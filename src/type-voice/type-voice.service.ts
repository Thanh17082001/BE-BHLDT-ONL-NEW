import { CreateTypeVoiceDto } from './dto/create-type-voice.dto';
import { UpdateTypeVoiceDto } from './dto/update-type-voice.dto';

import { HttpException, Injectable, NotFoundException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { PageOptionsDto } from 'src/common/pagination/page-option-dto';
import { ItemDto, PageDto } from 'src/common/pagination/page.dto';
import { PageMetaDto } from 'src/common/pagination/page.metadata.dto';
import { TypeVoice } from './entities/type-voice.entity';

@Injectable()
export class TypeVoiceService {
  constructor(
    @InjectRepository(TypeVoice) private repo: Repository<TypeVoice>,
  ) { }
  async create(createTypeVoiceDto: CreateTypeVoiceDto): Promise<TypeVoice> {
    const { name } = createTypeVoiceDto;
    if (await this.repo.findOne({ where: { name } })) {
      throw new HttpException('Tên đã tồn tại', 409);
    }
    const newUser = this.repo.create({ name });
    return await this.repo.save(newUser);
  }

  async findAll(pageOptions: PageOptionsDto, query: Partial<TypeVoice>): Promise<PageDto<TypeVoice>> {
    const queryBuilder = this.repo.createQueryBuilder('typevoice');
    const { page, take, skip, order, search } = pageOptions;
    const pagination: string[] = ['page', 'take', 'skip', 'order', 'search']
    if (!!query && Object.keys(query).length > 0) {
      const arrayQuery: string[] = Object.keys(query);
      arrayQuery.forEach((key) => {
        if (key && !pagination.includes(key)) {
          queryBuilder.andWhere(`typevoice.${key} = :${key}`, { [key]: query[key] });
        }
      });
    }

    //search document
    if (search) {
      queryBuilder.andWhere(`LOWER(unaccent(typevoice.name)) ILIKE LOWER(unaccent(:search))`, {
        search: `%${search}%`,
      });
    }


    queryBuilder.orderBy(`typevoice.createdAt`, order)
      .skip(skip)
      .take(take);

    const itemCount = await queryBuilder.getCount();
    const pageMetaDto = new PageMetaDto({ pageOptionsDto: pageOptions, itemCount });
    const { entities } = await queryBuilder.getRawAndEntities();

    return new PageDto(entities, pageMetaDto);
  }

  async findOne(id: number): Promise<ItemDto<TypeVoice>> {

    const example = await this.repo.findOne({ where: { id } });
    if (!example) {
      throw new HttpException('Not found', 404);
    }
    return new ItemDto(example);
  }

  async findOrCreateByNames(names: string[], schoolId: number): Promise<number[]> {

    // Lấy danh sách các khối 
    const existingTypeVoices = await this.repo.find({
      where: {
        name: In(names),
      },
      select: ['id', 'name'],
    });



    // Tạo Map để kiểm tra trùng lặp nhanh hơn
    const existingMap = new Map(existingTypeVoices.map(grade => [grade.name, grade.id]));

    // Lọc ra những khối chưa tồn tại theo tên (không phân biệt hoa thường)
    const newNames = names.filter(name => !existingMap.has(name));




    let newIds: number[] = [];
    if (newNames.length > 0) {
      // Tạo khối mới
      console.log('đây');
      const newTypeVoices = newNames.map(name => this.repo.create({
        name,
      }));

      const savedTypeVoices = await this.repo.save(newTypeVoices);

      // Thêm ID của khối mới vào danh sách trả về
      newIds = savedTypeVoices.map(grade => grade.id);
    }

    // Trả về danh sách ID của tất cả khối đã có và mới tạo
    return [...Array.from(existingMap.values()), ...newIds];
  }

  async findByIds(gradeIds: number[]): Promise<TypeVoice[]> {
    return this.repo.find({ where: { id: In(gradeIds) } });
  }

  async update(id: number, updateTypeVoiceDto: UpdateTypeVoiceDto) {
    const { name } = updateTypeVoiceDto;
    const exampleExits: TypeVoice = await this.repo.findOne({ where: { name, id: Not(id) } });
    if (exampleExits) {
      throw new HttpException('Tên đã tồn tại', 409);
    }

    const example: TypeVoice = await this.repo.findOne({ where: { id } });

    if (!example) {
      throw new NotFoundException(`TypeVoice with ID ${id} not found`);
    }

    Object.assign(example, updateTypeVoiceDto)

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

