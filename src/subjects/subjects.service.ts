import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

import {
  ForbiddenException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Not, Repository } from 'typeorm';
import { PageOptionsDto } from 'src/common/pagination/page-option-dto';
import { ItemDto, PageDto } from 'src/common/pagination/page.dto';
import { PageMetaDto } from 'src/common/pagination/page.metadata.dto';
import { Subject } from './entities/subject.entity';
import { Grade } from 'src/grade/entities/grade.entity';
import { GradeService } from 'src/grade/grade.service';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/role/role.enum';
import { School } from 'src/schools/entities/school.entity';
import { schoolTypes } from 'src/common/constant/type-school-query';
import { roleQueryPrincipal, queryTeacher } from 'src/common/constant/role-query';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(Subject) private repo: Repository<Subject>,
    @InjectRepository(Grade) private repoGrade: Repository<Grade>,
    @InjectRepository(School) private repoSchool: Repository<School>,
    private gradeService: GradeService,
  ) {}
  async create(
    createSubjectDto: CreateSubjectDto,
    user: User,
  ): Promise<Subject> {

    createSubjectDto.schoolId = user?.school?.id;
    const school = await this.repoSchool.findOne({
      where: { id: createSubjectDto.schoolId },
    });
    const { name, gradeId } = createSubjectDto;
    if (await this.repo.findOne({ where: { name:name.toLowerCase(), grade:{id:gradeId} } })) {
      throw new HttpException('Tên đã tồn tại', 409);
    }
    const grade: Grade = await this.repoGrade.findOne({
      where: { id: gradeId },
    });
    if (!grade) {
      throw new HttpException('Lớp không tồn tại', 409);
    }

    const newSubject = this.repo.create({
      ...createSubjectDto,
      name: `${name} ${grade.name}`.toLowerCase(),
      grade,
      createdBy: user,
      school: school,
    });
    return await this.repo.save(newSubject);
  }

  async findAll(
    pageOptions: PageOptionsDto,
    query: Partial<Subject>,
    user: User,
  ): Promise<PageDto<Subject>> {
    const queryBuilder = this.repo
      .createQueryBuilder('subject')
      .leftJoinAndSelect('subject.grade', 'grade')
      .leftJoinAndSelect('subject.school', 'school') // Lấy thông tin trường
      .leftJoinAndSelect('subject.users', 'users'); // Lấy danh sách giáo viên phụ trách môn học

    const { page, take, skip, order, search } = pageOptions;
    const pagination: string[] = ['page', 'take', 'skip', 'order', 'search', 'topic'];

    // 🎯 Phân quyền dữ liệu
    if (user) {
      const schoolTypesQuery = schoolTypes(user);

      queryBuilder.andWhere(
        new Brackets((qb) => {
          if (user.role === Role.TEACHER) {
            const subjectIds = user.subjects?.map((subject) => subject.id) || [];

            if (subjectIds.length > 0) {
              qb.where(
                new Brackets((q) =>
                  q
                    .where('subject.id IN (:...subjectIds)', { subjectIds })
                    .orWhere('subject.created_by = :created_by', { created_by: user.id }),
                ),
              );
            }
          } else if (user.role === Role.PRINCIPAL) {
            qb.where(
              new Brackets((q) =>
                q
                  .where('school.id = :schoolId', { schoolId: user.school.id })
                  .orWhere(
                    'school.isAdmin = :isAdmin AND school.schoolType IN (:...schoolTypesQuery)',
                    {
                      isAdmin: true,
                      schoolTypesQuery,
                    },
                  ),
            ),
            );
          } else if(user.role === Role.ADMIN) {
            qb.where('school.schoolType IN (:...schoolTypesQuery)', { schoolTypesQuery });
          }
          
        }),
      );
    }

    // 🎯 Lọc theo điều kiện tìm kiếm (bỏ qua các tham số phân trang)
    if (!!query && Object.keys(query).length > 0) {
      Object.keys(query).forEach((key) => {
        if (key && !pagination.includes(key)) {
          queryBuilder.andWhere(`subject.${key} = :${key}`, {
            [key]: query[key],
          });
        }
      });
    }

    // 🎯 Tìm kiếm theo tên môn học (bỏ dấu)
    if (search) {
      queryBuilder.andWhere(
        `LOWER(unaccent("subject".name)) ILIKE LOWER(unaccent(:search))`,
        {
          search: `%${search}%`,
        },
      );
    }


    // 🎯 Phân trang và sắp xếp
    queryBuilder.orderBy('subject.name', 'ASC').skip(skip).take(take);

    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();

    return new PageDto(
      entities,
      new PageMetaDto({ pageOptionsDto: pageOptions, itemCount }),
    );
  }

  async findByName(name: string): Promise<Subject> {

    const example = await this.repo.findOne({ where: { name }, relations:['grade']});
    if (!example) {
      throw new HttpException('Not found', 404);
    }
    return example;
  }

  async findOne(id: number): Promise<ItemDto<Subject>> {
    const example = await this.repo.findOne({ where: { id }, relations:['topics'] });
    if (!example) {
      throw new HttpException('Not found', 404);
    }
    return new ItemDto(example);
  }

  async findOrCreateByNames(
    names: string[],
    gradeIds: number[],
    schoolId: number,
    user,
  ): Promise<number[]> {
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
    const formattedNames = grades.flatMap((grade) =>
      names.map((name) => `${name} ${grade.name}`),
    );

    // Lấy danh sách môn học đã tồn tại theo `name + grade.name`
    const existingSubjects = await this.repo.find({
      where: formattedNames.map((fullName) => ({
        name: fullName,
        school: { id: schoolId },
      })),
      relations: ['grade'],
      select: ['id', 'name', 'grade'],
    });

    // Tạo Map kiểm tra nhanh (key: `name + grade.name`)
    const existingMap = new Map(
      existingSubjects.map((subject) => [subject.name, subject.id]),
    );

    // Tạo danh sách môn học mới nếu chưa có
    const newSubjects = grades.flatMap((grade) =>
      names
        .map((name) => {
          const fullName = `${name} ${grade.name}`;
          if (!existingMap.has(fullName)) {
            return this.repo.create({
              name: fullName,
              grade,
              school,
              createdBy: user,
            });
          }
          return null;
        })
        .filter((subject) => subject !== null),
    );

    // Lưu môn học mới nếu có
    if (newSubjects.length > 0) {
      const savedSubjects = await this.repo.save(newSubjects);
      return [
        ...existingMap.values(),
        ...savedSubjects.map((subject) => subject.id),
      ];
    }

    return [...existingMap.values()];
  }

  async update(id: number, updateSubjectDto: UpdateSubjectDto) {
    const { name } = updateSubjectDto;
    const exampleExits: Subject = await this.repo.findOne({
      where: { name, id: Not(id) },
    });
    if (exampleExits) {
      throw new HttpException('Tên đã tồn tại', 409);
    }

    const example: Subject = await this.repo.findOne({ where: { id } , relations:['school', 'createdBy']});

    if (!example) {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }
    const grade: Grade = await this.repoGrade.findOne({
      where: { id: updateSubjectDto.gradeId },
    });
    if (!grade) {
      throw new HttpException('Lớp không tồn tại', 409);
    }
    this.repo.merge(example, { name: updateSubjectDto.name, grade });
    console.log(example);

    await this.repo.update(id, example);

    return new ItemDto(example);
  }

  async remove(id: number, user:User) {
    const example: Subject = await this.repo.findOne({
      where: { id },
      relations: ['createdBy', 'school'],
    });

    if (!example) {
      throw new NotFoundException('Không tìm thấy tài nguyên');
    }

    const isOwner = example?.createdBy?.id === user.id;
    const isSameSchoolType = example?.school?.schoolType === user.school?.schoolType;

    if (!user.isAdmin && !isOwner) {
      throw new ForbiddenException('Không có quyền ');
    }

    if (user.isAdmin && !isSameSchoolType) {
      throw new ForbiddenException('Không có quyền');
    }

    if (example?.createdBy.id !== user.id) {
      throw new ForbiddenException('Không có quyền');
    }

    if (example?.createdBy?.id !== user.id) {
      console.log(user);
      throw new ForbiddenException('Không có quyền');
    }

    if (!example?.createdBy?.isAdmin) {
      console.log(user);
      throw new ForbiddenException('Không có quyền xóa');
    }
    await this.repo.delete(id);
    return new ItemDto(await this.repo.delete(id));
  }
}
