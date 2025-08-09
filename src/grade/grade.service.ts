import { schoolTypes } from 'src/common/constant/type-school-query';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';

import { HttpException, Injectable, NotFoundException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { PageOptionsDto } from 'src/common/pagination/page-option-dto';
import { ItemDto, PageDto } from 'src/common/pagination/page.dto';
import { PageMetaDto } from 'src/common/pagination/page.metadata.dto';
import { Grade } from './entities/grade.entity';
import { User } from 'src/users/entities/user.entity';
import { SchoolType } from 'src/schools/entities/school.entity';
import { Role } from 'src/role/role.enum';

@Injectable()
export class GradeService {
  constructor(
    @InjectRepository(Grade) private repo: Repository<Grade>,
  ) { }
  async create(createGradeDto: CreateGradeDto): Promise<Grade> {
    const { name } = createGradeDto;
    if (await this.repo.findOne({ where: { name } })) {
      throw new HttpException('Tên đã tồn tại', 409);
    }
    const newUser = this.repo.create({ name   });
    return await this.repo.save(newUser);
  }

  async findAll(pageOptions: PageOptionsDto, query: Partial<Grade>, user:User): Promise<PageDto<Grade>> {
    const queryBuilder = this.repo.createQueryBuilder('grade').leftJoinAndSelect('grade.school', 'school');;
    const { page, take, skip, order, search } = pageOptions;
    const pagination: string[] = ['page', 'take', 'skip', 'order', 'search']
   
      // Định nghĩa khoảng lớp theo loại trường
      const gradeRanges: Record<SchoolType, { min: string; max: string }> = {
        [SchoolType['Tiểu học']]: { min: '1', max: '5' },
        [SchoolType['THCS']]: { min: '6', max: '9' },
        [SchoolType['THPT']]: { min: '10', max: '12' },
        [SchoolType['TH&THCS']]: { min: '1', max: '9' },
        [SchoolType['THCS&THPT']]: { min: '6', max: '12' },
      };

      // Lấy khoảng lớp phù hợp theo schoolType
      const range = gradeRanges[user.school.schoolType];

    if (user.role !== Role.SUPER_ADMIN) {
      if (range) {
        queryBuilder.andWhere(`CAST(grade.name AS INTEGER) BETWEEN :min AND :max`, {
          min: range.min,
          max: range.max,
        });
      }
      }
    

    if (!!query && Object.keys(query).length > 0) {
      const arrayQuery: string[] = Object.keys(query);
      arrayQuery.forEach((key) => {
        if (key && !pagination.includes(key)) {
          queryBuilder.andWhere(`grade.${key} = :${key}`, { [key]: query[key] });
        }
      });
    }

    

    //search document
    if (search) {
      queryBuilder.andWhere(`LOWER(unaccent(grade.name)) ILIKE LOWER(unaccent(:search))`, {
        search: `%${search}%`,
      });
    }


    queryBuilder.orderBy('CAST(grade.name AS INT)', 'ASC')
      .skip(skip)
      .take(take);

    const itemCount = await queryBuilder.getCount();
    const pageMetaDto = new PageMetaDto({ pageOptionsDto: pageOptions, itemCount });
    const { entities } = await queryBuilder.getRawAndEntities();


    return new PageDto(entities, pageMetaDto);
  }

  async findOne(id: number): Promise<ItemDto<Grade>> {

    const example = await this.repo.findOne({ where: { id } });
    if (!example) {
      throw new HttpException('Not found', 404);
    }
    return new ItemDto(example);
  }

  async findByName(name: string): Promise<Grade> {

    const example = await this.repo.findOne({ where: { name } });
    if (!example) {
      throw new HttpException('Not found', 404);
    }
    return example;
  }

  async findOrCreateByNames(names: string[]): Promise<number[]> {
    
    // Lấy danh sách các khối 
    const existingGrades = await this.repo.find({
      where: {
        name: In(names),
      },
      select: ['id', 'name'],
    });



    // Tạo Map để kiểm tra trùng lặp nhanh hơn
    const existingMap = new Map(existingGrades.map(grade => [grade.name, grade.id]));

    // Lọc ra những khối chưa tồn tại theo tên (không phân biệt hoa thường)
    const newNames = names.filter(name => !existingMap.has(name));




    let newIds: number[] = [];
    if (newNames.length > 0) {
      // Tạo khối mới
      console.log('đây');
      const newGrades = newNames.map(name => this.repo.create({
        name,
      }));

      const savedGrades = await this.repo.save(newGrades);

      // Thêm ID của khối mới vào danh sách trả về
      newIds = savedGrades.map(grade => grade.id);
    }

    // Trả về danh sách ID của tất cả khối đã có và mới tạo
    return [...Array.from(existingMap.values()), ...newIds];
  }

  async findByIds(gradeIds: number[]): Promise<Grade[]> {
    return this.repo.find({ where: { id: In(gradeIds) } });
  }

  async update(id: number, updateGradeDto: UpdateGradeDto) {
    const { name } = updateGradeDto;
    const exampleExits: Grade = await this.repo.findOne({ where: { name, id: Not(id) } });
    if (exampleExits) {
      throw new HttpException('Tên đã tồn tại', 409);
    }

    const example: Grade = await this.repo.findOne({ where: { id } });

    if (!example) {
      throw new NotFoundException(`Grade with ID ${id} not found`);
    }

    Object.assign(example, updateGradeDto)

    await this.repo.update(id, example)

    return new ItemDto(example);;
  }

  async remove(id: number) {
    const example = this.repo.findOne({ where: { id } });
    if (!example) {
      throw new NotFoundException('Không tìm thấy tài nguyên');
    }
    await this.repo.delete(id);
    return new ItemDto(await this.repo.delete(id));
  }
}

