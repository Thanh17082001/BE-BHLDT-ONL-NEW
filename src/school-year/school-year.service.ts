import { BadRequestException, HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Not, Repository } from 'typeorm';
import { PageOptionsDto } from 'src/common/pagination/page-option-dto';
import { ItemDto, PageDto } from 'src/common/pagination/page.dto';
import { PageMetaDto } from 'src/common/pagination/page.metadata.dto';
import { SchoolYear } from './entities/school-year.entity';
import { CreateSchoolYearDto } from './dto/create-school-year.dto';
import { UpdateSchoolYearDto } from './dto/update-school-year.dto';
import { User } from 'src/users/entities/user.entity';
import { School } from 'src/schools/entities/school.entity';
import { Role } from 'src/role/role.enum';
import { schoolTypes } from 'src/common/constant/type-school-query';

@Injectable()
export class SchoolYearService {
  constructor(
    @InjectRepository(SchoolYear) private repo: Repository<SchoolYear>,
    @InjectRepository(School) private repoSchool: Repository<School>,
  ) {}
  async create(createSchoolYearDto: CreateSchoolYearDto, user: User): Promise<SchoolYear> {
    createSchoolYearDto.schoolId = user.school.id;
    const school = await this.repoSchool.findOne({ where: { id: createSchoolYearDto.schoolId } });
    let { name, endYear, startYear } = createSchoolYearDto;
    if (!name) {
      name = `${startYear} - ${endYear}`;
    }
    if (endYear < startYear) {
      throw new BadRequestException('Năm học không hợp lệ');
    }
    const exist = await this.repo.findOne({ where: { name, school: { id: createSchoolYearDto.schoolId }, createdBy: { id: user.id } } })
    if (exist) {
      throw new HttpException('Tên đã tồn tại',409);
    }
    const newUser = this.repo.create({ startYear,endYear ,name , createdBy: user, school: school ?? null });
    return await this.repo.save(newUser);
  }

  async findAll(
    pageOptions: PageOptionsDto,
    query: Partial<SchoolYear>,
    user: User
  ): Promise<PageDto<SchoolYear>> {
    const queryBuilder = this.repo
      .createQueryBuilder('schoolYear')
      .leftJoinAndSelect('schoolYear.school', 'school')
      .leftJoinAndSelect('schoolYear.createdBy', 'users');

    const { take, skip, order, search } = pageOptions;
    const pagination: string[] = ['page', 'take', 'skip', 'order', 'search'];

   
    // 🔐 Phân quyền dữ liệu
    if (user.role === Role.TEACHER) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('users.id = :userId');
        })
      );
      queryBuilder.setParameter('userId', user.id);
    } else if (user.role === Role.PRINCIPAL) {
      queryBuilder.andWhere('school.id = :schoolId', {
        schoolId: user.school.id,
      });
    } else if (user.role === Role.ADMIN) {
      const schoolTypesQuery = schoolTypes(user); // ⬅️ Giả sử bạn có hàm này trả về danh sách các loại trường mà admin được xem
      if (schoolTypesQuery.length > 0) {
        queryBuilder.andWhere(
          new Brackets((qb) => {
            qb.where('school.schoolType IN (:...schoolTypes)', {
              schoolTypes: schoolTypesQuery,
            });
          })
        );
      }
    }

    // 🎯 Lọc theo điều kiện query
    if (query && Object.keys(query).length > 0) {
      Object.keys(query).forEach((key) => {
        if (!pagination.includes(key)) {
          queryBuilder.andWhere(`schoolYear.${key} = :${key}`, {
            [key]: query[key],
          });
        }
      });
    }


    // 🔍 Tìm kiếm theo tên năm học
    if (search) {
      queryBuilder.andWhere(
        `LOWER(unaccent(schoolYear.name)) ILIKE LOWER(unaccent(:search))`,
        { search: `%${search}%` }
      );
    }

    // 📄 Phân trang và sắp xếp
    queryBuilder
      .orderBy('schoolYear.createdAt', order)
      .skip(skip)
      .take(take);

    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();

    return new PageDto(entities, new PageMetaDto({ pageOptionsDto: pageOptions, itemCount }));
  }

  async findOne(id: number): Promise<ItemDto<SchoolYear>> {

    const schoolyear = await this.repo.findOne({where:{id}});
    if (!schoolyear) {
      throw new HttpException('Not found', 404);
    }
    return new ItemDto(schoolyear);
  }

  async update(id: number, updateSchoolYearDto: UpdateSchoolYearDto, user:User) {
    const { name } = updateSchoolYearDto;
    const schoolyearExits: SchoolYear = await this.repo.findOne({ where: { name, id: Not(id), school: { id: updateSchoolYearDto.schoolId }, createdBy: { id: user.id } } });
    if (schoolyearExits){
      throw new HttpException('Tên đã tồn tại',409);
    }

    const schoolyear:SchoolYear = await this.repo.findOne({ where: { id } });

    if (!schoolyear) {
      throw new NotFoundException(`SchoolYear with ID ${id} not found`);
    }

    if (updateSchoolYearDto.endYear < updateSchoolYearDto.startYear) {
      throw new BadRequestException('Năm học không hợp lệ');
    }
    const newName = `${updateSchoolYearDto.startYear} - ${updateSchoolYearDto.endYear}`;
    await this.repo.update(id, { startYear: updateSchoolYearDto.startYear, endYear: updateSchoolYearDto.endYear, name: newName })

    return new ItemDto(schoolyear);;
  }

  async remove(id: number) {
    const schoolyear = this.repo.findOne({ where: { id } });
    if(!schoolyear){
      throw new NotFoundException('Không tìm thấy tài nguyên');
    }
    await this.repo.delete(id);
    return new ItemDto(await this.repo.delete(id));
  }
}
