import { CreateLevelDto } from './dto/create-level.dto';
import { UpdateLevelDto } from './dto/update-level.dto';

import { HttpException, Injectable, NotFoundException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { PageOptionsDto } from 'src/common/pagination/page-option-dto';
import { ItemDto, PageDto } from 'src/common/pagination/page.dto';
import { PageMetaDto } from 'src/common/pagination/page.metadata.dto';
import { Level } from './entities/level.entity';
import { TypeQuestion } from 'src/type-question/entities/type-question.entity';

@Injectable()
export class LevelService {
  constructor(
    @InjectRepository(Level) private repo: Repository<Level>,
    @InjectRepository(TypeQuestion) private repoTypeQuestion: Repository<TypeQuestion>,
  ) { }
  async create(createLevelDto: CreateLevelDto): Promise<Level> {
    const { name, order, typeQuestionId } = createLevelDto;
    const typeQuestion: TypeQuestion = await this.repoTypeQuestion.findOne({ where: { id: typeQuestionId } });
  
    if (await this.repo.findOne({ where: { name } })) {
      throw new HttpException('Tên đã tồn tại', 409);
    }
    const newUser = this.repo.create({ name, order, typeQuestion });
    return await this.repo.save(newUser);
  }

  async findAll(pageOptions: PageOptionsDto, query: Partial<Level>): Promise<PageDto<Level>> {
    const queryBuilder = this.repo.createQueryBuilder('Level').leftJoinAndSelect(
      'Level.typeQuestion',
      'typeQuestion',
    );
    const { page, take, skip, order, search } = pageOptions;
    const pagination: string[] = ['page', 'take', 'skip', 'order', 'search']
    if (!!query && Object.keys(query).length > 0) {
      const arrayQuery: string[] = Object.keys(query);
      arrayQuery.forEach((key) => {
        if (key && !pagination.includes(key)) {
          queryBuilder.andWhere(`Level.${key} = :${key}`, { [key]: query[key] });
        }
      });
    }

    //search document
    if (search) {
      queryBuilder.andWhere(`LOWER(unaccent(Level.name)) ILIKE LOWER(unaccent(:search))`, {
        search: `%${search}%`,
      });
    }


    queryBuilder.orderBy(`Level.order`, 'ASC')
      .skip(skip)
      .take(take);

    const itemCount = await queryBuilder.getCount();
    const pageMetaDto = new PageMetaDto({ pageOptionsDto: pageOptions, itemCount });
    const { entities } = await queryBuilder.getRawAndEntities();

    return new PageDto(entities, pageMetaDto);
  }

  async findOne(id: number): Promise<ItemDto<Level>> {

    const example = await this.repo.findOne({ where: { id } });
    if (!example) {
      throw new HttpException('Not found', 404);
    }
    return new ItemDto(example);
  }

  async findByName(name: string): Promise<Level> {
    return await this.repo.findOne({
      where: {
        name: name
      }
    })
  }

  async findByIds(gradeIds: number[]): Promise<Level[]> {
    return this.repo.find({ where: { id: In(gradeIds) } });
  }

  async update(id: number, updateLevelDto: UpdateLevelDto) {
    const { name,typeQuestionId } = updateLevelDto;
    const exampleExits: Level = await this.repo.findOne({ where: { name, id: Not(id) } });
    const typeQuestion: TypeQuestion = await this.repoTypeQuestion.findOne({ where: { id: typeQuestionId } });
    if (exampleExits) {
      throw new HttpException('Tên đã tồn tại', 409);
    }

    const example: Level = await this.repo.findOne({ where: { id } });

    if (!example) {
      throw new NotFoundException(`Level with ID ${id} not found`);
    }

    this.repo.merge(example, { ...updateLevelDto,typeQuestion })

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

