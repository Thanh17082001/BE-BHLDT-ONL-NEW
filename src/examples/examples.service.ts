import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateExampleDto } from './dto/create-example.dto';
import { UpdateExampleDto } from './dto/update-example.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Example } from './entities/example.entity';
import { PageOptionsDto } from 'src/common/pagination/page-option-dto';
import { ItemDto, PageDto } from 'src/common/pagination/page.dto';
import { PageMetaDto } from 'src/common/pagination/page.metadata.dto';

@Injectable()
export class ExamplesService {
  constructor(
    @InjectRepository(Example) private repo: Repository<Example>,
  ) {}
  async create(createExampleDto: CreateExampleDto): Promise<Example> {
    const { name } = createExampleDto;
    if (await this.repo.findOne({where:{name} })) {
      throw new HttpException('Tên đã tồn tại',409);
    }
    const newUser = this.repo.create({  name });
    return await this.repo.save(newUser);
  }

  async findAll(pageOptions: PageOptionsDto, query: Partial<Example>): Promise<PageDto<Example>> {
    const queryBuilder = this.repo.createQueryBuilder('example');
    const { page, take, skip, order, search } = pageOptions;
    const pagination: string[] = ['page', 'take', 'skip', 'order', 'search']
    if (!!query && Object.keys(query).length > 0) {
      const arrayQuery: string[] = Object.keys(query);
      arrayQuery.forEach((key) => {
        if (key && !pagination.includes(key)) {
          queryBuilder.andWhere(`example.${key} = :${key}`, { [key]: query[key] });
        }
      });
    }

    //search document
    if (search) {
      queryBuilder.andWhere(`LOWER(unaccent(example.name)) ILIKE LOWER(unaccent(:search))`, {
        search: `%${search}%`,
      });
    }


    queryBuilder.orderBy(`example.createdAt`, order)
      .skip(skip)
      .take(take);

    const itemCount = await queryBuilder.getCount();
    const pageMetaDto = new PageMetaDto({ pageOptionsDto: pageOptions, itemCount });
    const { entities } = await queryBuilder.getRawAndEntities();

    return new PageDto(entities, pageMetaDto);
  }

  async findOne(id: number): Promise<ItemDto<Example>> {

    const example = await this.repo.findOne({where:{id}});
    if (!example) {
      throw new HttpException('Not found', 404);
    }
    return new ItemDto(example);
  }

  async update(id: number, updateExampleDto: UpdateExampleDto) {
    const { name } = updateExampleDto;
    const exampleExits:Example = await this.repo.findOne({where:{name,id: Not(id)}});
    if (exampleExits){
      throw new HttpException('Tên đã tồn tại',409);
    }

    const example:Example = await this.repo.findOne({ where: { id } });

    if (!example) {
      throw new NotFoundException(`Example with ID ${id} not found`);
    }

    Object.assign(example, updateExampleDto)

    await this.repo.update(id, example)

    return new ItemDto(example);;
  }

  async remove(id: number) {
    const example = this.repo.findOne({ where: { id } });
    if(!example){
      throw new NotFoundException('Không tìm thấy tài nguyên');
    }
    await this.repo.delete(id);
    return new ItemDto(await this.repo.delete(id));
  }
}
