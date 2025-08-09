import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Not, Repository } from 'typeorm';
import { PageOptionsDto } from 'src/common/pagination/page-option-dto';
import { ItemDto, PageDto } from 'src/common/pagination/page.dto';
import { PageMetaDto } from 'src/common/pagination/page.metadata.dto';
import { Grade } from 'src/grade/entities/grade.entity';
import { GradeService } from 'src/grade/grade.service';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/role/role.enum';
import { School } from 'src/schools/entities/school.entity';
import { Class } from './entities/class.entity';
import { SchoolYear } from 'src/school-year/entities/school-year.entity';
import { schoolTypes } from 'src/common/constant/type-school-query';

@Injectable()
export class ClassService {
  constructor(
    @InjectRepository(Class) private repo: Repository<Class>,
    @InjectRepository(Grade) private repoGrade: Repository<Grade>,
    @InjectRepository(School) private repoSchool: Repository<School>,
    @InjectRepository(SchoolYear) private repoSchoolYear: Repository<SchoolYear>,
    private gradeService: GradeService,

  ) { }
  async create(createClassDto: CreateClassDto, user: User): Promise<Class> {
    createClassDto.schoolId = user.school.id;
    const school = await this.repoSchool.findOne({ where: { id: createClassDto.schoolId } });
    const schoolYear = await this.repoSchoolYear.findOne({ where: { id: createClassDto.schoolYearId } });
    const { name, gradeId } = createClassDto;
    if (await this.repo.findOne({ where: { name, school: { id: createClassDto.schoolId }, schoolYear: { id: createClassDto.schoolYearId } } })) {
      throw new HttpException('Tên đã tồn tại', 409);
    }
    const grade: Grade = await this.repoGrade.findOne({ where: { id: gradeId } });
    if (!grade) {
      throw new HttpException('Lớp không tồn tại', 409);
    }
    const newClass = this.repo.create({ ...createClassDto, name: name, grade, createdBy: user.isAdmin ? null : user, school: school ?? null, schoolYear });
    return await this.repo.save(newClass);
  }

  async findAll(
    pageOptions: PageOptionsDto,
    query: Partial<Class>,
    user: User
  ): Promise<PageDto<Class>> {
    const queryBuilder = this.repo
      .createQueryBuilder('class')
      .leftJoinAndSelect('class.grade', 'grade')
      .leftJoinAndSelect('class.school', 'school')
      .leftJoinAndSelect('class.schoolYear', 'schoolYear')
      .leftJoinAndSelect('school.users', 'users');

    const { page, take, skip, order, search } = pageOptions;
    const pagination: string[] = ['page', 'take', 'skip', 'order', 'search'];

    // 🎯 Lọc theo các điều kiện cụ thể (trừ tham số phân trang)
    if (query && Object.keys(query).length > 0) {
      Object.keys(query).forEach((key) => {
        if (key && !pagination.includes(key)) {
          queryBuilder.andWhere(`class.${key} = :${key}`, { [key]: query[key] });
        }
      });
    }

    // 🔐 Phân quyền dữ liệu theo vai trò
    if (user.role === Role.TEACHER) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('class.created_by = :userId')
        }),
      );
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('school.id = :schoolId');
        }),
      );
      queryBuilder.setParameters({
        userId: user.id,
        schoolId: user.school.id,
      });
    } else if (user.role === Role.PRINCIPAL) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('school.id = :schoolId')
        }),
      );
      queryBuilder.setParameter('schoolId', user.school.id);
    } else if (user.role === Role.ADMIN) {
      const schoolTypesQuery = schoolTypes(user); // Hàm trả về danh sách schoolType mà admin được quản lý
      if (schoolTypesQuery.length > 0) {
        queryBuilder.andWhere(
          new Brackets((qb) => {
            qb.where('school.schoolType IN (:...schoolTypes)', {
              schoolTypes: schoolTypesQuery,
            });
          }),
        );
      }
    }

    // 🔎 Tìm kiếm theo tên lớp học (không phân biệt dấu và chữ hoa/thường)
    if (search) {
      queryBuilder.andWhere(
        `LOWER(unaccent(class.name)) ILIKE LOWER(unaccent(:search))`,
        { search: `%${search}%` }
      );
    }

    // 📄 Phân trang và sắp xếp
    queryBuilder
      .orderBy('class.createdAt', order)
      .skip(skip)
      .take(take);

    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();

    return new PageDto(entities, new PageMetaDto({ pageOptionsDto: pageOptions, itemCount }));
  }




  async findOne(id: number): Promise<ItemDto<Class>> {

    const example = await this.repo.findOne({ where: { id }, relations: ['grade', 'school', 'schoolYear'] });
    if (!example) {
      throw new HttpException('Not found', 404);
    }
    return new ItemDto(example);
  }

  async findOrCreateByNames(names: string[], gradeIds: number[], schoolId: number, user): Promise<number[]> {
    if (!gradeIds.length || !names.length) {
      return [];
    }

    // Lấy danh sách khối lớp hợp lệ
    const grades = await this.gradeService.findByIds(gradeIds);
    if (!grades.length) {
      throw new Error('Không tìm thấy khối lớp hợp lệ');
    }

    const school = await this.repoSchool.findOne({ where: { id: schoolId } });

    // Chuẩn hóa danh sách tên môn học theo `name + grade.name`
    const formattedNames = grades.flatMap(grade =>
      names.map(name => `${name} lớp ${grade.name}`)
    );


    // Lấy danh sách môn học đã tồn tại theo `name + grade.name`
    const existingClasss = await this.repo.find({
      where: formattedNames.map(fullName => ({
        name: fullName,
        school: { id: schoolId },
      })),
      relations: ['grade'],
      select: ['id', 'name', 'grade'],
    });

    // Tạo Map kiểm tra nhanh (key: `name + grade.name`)
    const existingMap = new Map(
      existingClasss.map(subject => [subject.name, subject.id])
    );


    // Tạo danh sách môn học mới nếu chưa có
    const newClasss = grades.flatMap(grade =>
      names
        .map(name => {
          const fullName = `${name} lớp ${grade.name}`;
          if (!existingMap.has(fullName)) {
            return this.repo.create({ name: fullName, grade, school, createdBy: user });
          }
          return null;
        })
        .filter(subject => subject !== null)
    );


    // Lưu môn học mới nếu có
    if (newClasss.length > 0) {
      const savedClasss = await this.repo.save(newClasss);
      return [...existingMap.values(), ...savedClasss.map(subject => subject.id)];
    }

    return [...existingMap.values()];
  }

  async update(id: number, updateClassDto: UpdateClassDto) {
    const { name, suffixes,gradeId,schoolYearId } = updateClassDto;
    const exampleExits: Class = await this.repo.findOne({ where: { name, id: Not(id), school: { id: updateClassDto.schoolId }, schoolYear: { id: schoolYearId } } });
    if (exampleExits) {
      throw new HttpException('Tên đã tồn tại', 409);
    }

    const example: Class = await this.repo.findOne({ where: { id } });

    if (!example) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }
    const grade: Grade = await this.repoGrade.findOne({ where: { id: updateClassDto.gradeId } });
    const schoolYear = await this.repoSchoolYear.findOne({ where: { id: schoolYearId } });

    if (!grade) {
      throw new HttpException('Lớp không tồn tại', 409);
    }
    Object.assign(example, { name, suffixes, grade, schoolYear })

    await this.repo.update(id, example)

    return new ItemDto(example);;
  }

  async remove(id: number) {
    const example = await this.repo.findOne({ where: { id }, relations: ['students'] });
    if (!example) {
      throw new NotFoundException('Không tìm thấy tài nguyên');
    }

    console.log(example);

    if (example.students.length > 0) {
      throw new HttpException('Không thể xóa lớp học này vì nó đang chứa học sinh', 400);
    }
    await this.repo.delete(id);
    return new ItemDto(await this.repo.delete(id));
  }
}
