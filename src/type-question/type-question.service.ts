import { CreateTypeQuestionDto } from './dto/create-type-question.dto';
import { UpdateTypeQuestionDto } from './dto/update-type-question.dto';

import { HttpException, Injectable, NotFoundException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { PageOptionsDto } from 'src/common/pagination/page-option-dto';
import { ItemDto, PageDto } from 'src/common/pagination/page.dto';
import { PageMetaDto } from 'src/common/pagination/page.metadata.dto';
import { TypeQuestion } from './entities/type-question.entity';

@Injectable()
export class TypeQuestionService {
  constructor(
    @InjectRepository(TypeQuestion) private repo: Repository<TypeQuestion>,
  ) { }
  async create(createTypeQuestionDto: CreateTypeQuestionDto): Promise<TypeQuestion> {
    const { name, order } = createTypeQuestionDto;
    if (await this.repo.findOne({ where: { name } })) {
      throw new HttpException('Tên đã tồn tại', 409);
    }
    const newUser = this.repo.create({ name,order });
    return await this.repo.save(newUser);
  }

  async findAll(pageOptions: PageOptionsDto, query: Partial<TypeQuestion>): Promise<PageDto<TypeQuestion>> {
    const queryBuilder = this.repo.createQueryBuilder('type_question');
    const { page, take, skip, order, search } = pageOptions;
    const pagination: string[] = ['page', 'take', 'skip', 'order', 'search']
    if (!!query && Object.keys(query).length > 0) {
      const arrayQuery: string[] = Object.keys(query);
      arrayQuery.forEach((key) => {
        if (key && !pagination.includes(key)) {
          queryBuilder.andWhere(`type_question.${key} = :${key}`, { [key]: query[key] });
        }
      });
    }

    //search document
    if (search) {
      queryBuilder.andWhere(`LOWER(unaccent(type_question.name)) ILIKE LOWER(unaccent(:search))`, {
        search: `%${search}%`,
      });
    }


    queryBuilder.orderBy(`type_question.order`, 'ASC')
      .skip(skip)
      .take(take);

    const itemCount = await queryBuilder.getCount();
    const pageMetaDto = new PageMetaDto({ pageOptionsDto: pageOptions, itemCount });
    const { entities } = await queryBuilder.getRawAndEntities();

    return new PageDto(entities, pageMetaDto);
  }

  async findOne(id: number): Promise<ItemDto<TypeQuestion>> {

    const example = await this.repo.findOne({ where: { id } });
    if (!example) {
      throw new HttpException('Not found', 404);
    }
    return new ItemDto(example);
  }

  async findOrCreateByNames(names: string[], schoolId: number): Promise<number[]> {

    // Lấy danh sách các khối 
    const existingTypeQuestions = await this.repo.find({
      where: {
        name: In(names),
      },
      select: ['id', 'name'],
    });



    // Tạo Map để kiểm tra trùng lặp nhanh hơn
    const existingMap = new Map(existingTypeQuestions.map(grade => [grade.name, grade.id]));

    // Lọc ra những khối chưa tồn tại theo tên (không phân biệt hoa thường)
    const newNames = names.filter(name => !existingMap.has(name));




    let newIds: number[] = [];
    if (newNames.length > 0) {
      // Tạo khối mới
      console.log('đây');
      const newTypeQuestions = newNames.map(name => this.repo.create({
        name,
      }));

      const savedTypeQuestions = await this.repo.save(newTypeQuestions);

      // Thêm ID của khối mới vào danh sách trả về
      newIds = savedTypeQuestions.map(grade => grade.id);
    }

    // Trả về danh sách ID của tất cả khối đã có và mới tạo
    return [...Array.from(existingMap.values()), ...newIds];
  }

  async findByIds(gradeIds: number[]): Promise<TypeQuestion[]> {
    return this.repo.find({ where: { id: In(gradeIds) } });
  }

  async update(id: number, updateTypeQuestionDto: UpdateTypeQuestionDto) {
    const { name } = updateTypeQuestionDto;
    const exampleExits: TypeQuestion = await this.repo.findOne({ where: { name, id: Not(id) } });
    if (exampleExits) {
      throw new HttpException('Tên đã tồn tại', 409);
    }

    const example: TypeQuestion = await this.repo.findOne({ where: { id } });

    if (!example) {
      throw new NotFoundException(`TypeQuestion with ID ${id} not found`);
    }

    Object.assign(example, updateTypeQuestionDto)

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

