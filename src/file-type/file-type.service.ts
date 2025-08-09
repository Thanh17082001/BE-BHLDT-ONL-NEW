import { CreateFileTypeDto } from './dto/create-file-type.dto';
import { UpdateFileTypeDto } from './dto/update-file-type.dto';

import { HttpException, Injectable, NotFoundException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { PageOptionsDto } from 'src/common/pagination/page-option-dto';
import { ItemDto, PageDto } from 'src/common/pagination/page.dto';
import { PageMetaDto } from 'src/common/pagination/page.metadata.dto';
import { FileType } from './entities/file-type.entity';

@Injectable()
export class FileTypeService {
  constructor(
    @InjectRepository(FileType) private repo: Repository<FileType>,
  ) { }
  async create(createFileTypeDto: CreateFileTypeDto): Promise<FileType> {
    const { name } = createFileTypeDto;
    if (await this.repo.findOne({ where: { name } })) {
      throw new HttpException('Tên đã tồn tại', 409);
    }
    const newUser = this.repo.create({ name });
    return await this.repo.save(newUser);
  }

  async findAll(pageOptions: PageOptionsDto, query: Partial<FileType>): Promise<PageDto<FileType>> {
    const queryBuilder = this.repo.createQueryBuilder('fileType');
    const { page, take, skip, order, search } = pageOptions;
    const pagination: string[] = ['page', 'take', 'skip', 'order', 'search']
    if (!!query && Object.keys(query).length > 0) {
      const arrayQuery: string[] = Object.keys(query);
      arrayQuery.forEach((key) => {
        if (key && !pagination.includes(key)) {
          queryBuilder.andWhere(`fileType.${key} = :${key}`, { [key]: query[key] });
        }
      });
    }

    //search document
    if (search) {
      queryBuilder.andWhere(`LOWER(unaccent(fileType.name)) ILIKE LOWER(unaccent(:search))`, {
        search: `%${search}%`,
      });
    }


    queryBuilder.orderBy(`fileType.createdAt`, order)
      .skip(skip)
      .take(take);

    const itemCount = await queryBuilder.getCount();
    const pageMetaDto = new PageMetaDto({ pageOptionsDto: pageOptions, itemCount });
    const { entities } = await queryBuilder.getRawAndEntities();

    return new PageDto(entities, pageMetaDto);
  }

  async findOne(id: number): Promise<ItemDto<FileType>> {

    const example = await this.repo.findOne({ where: { id } });
    if (!example) {
      throw new HttpException('Not found', 404);
    }
    return new ItemDto(example);
  }

  async findOrCreateByNames(names: string[], schoolId: number): Promise<number[]> {

    // Lấy danh sách các khối 
    const existingFileTypes = await this.repo.find({
      where: {
        name: In(names),
      },
      select: ['id', 'name'],
    });



    // Tạo Map để kiểm tra trùng lặp nhanh hơn
    const existingMap = new Map(existingFileTypes.map(grade => [grade.name, grade.id]));

    // Lọc ra những khối chưa tồn tại theo tên (không phân biệt hoa thường)
    const newNames = names.filter(name => !existingMap.has(name));




    let newIds: number[] = [];
    if (newNames.length > 0) {
      // Tạo khối mới
      console.log('đây');
      const newFileTypes = newNames.map(name => this.repo.create({
        name,
      }));

      const savedFileTypes = await this.repo.save(newFileTypes);

      // Thêm ID của khối mới vào danh sách trả về
      newIds = savedFileTypes.map(grade => grade.id);
    }

    // Trả về danh sách ID của tất cả khối đã có và mới tạo
    return [...Array.from(existingMap.values()), ...newIds];
  }

  async findByIds(gradeIds: number[]): Promise<FileType[]> {
    return this.repo.find({ where: { id: In(gradeIds) } });
  }

  async update(id: number, updateFileTypeDto: UpdateFileTypeDto) {
    const { name } = updateFileTypeDto;
    const exampleExits: FileType = await this.repo.findOne({ where: { name, id: Not(id) } });
    if (exampleExits) {
      throw new HttpException('Tên đã tồn tại', 409);
    }

    const example: FileType = await this.repo.findOne({ where: { id } });

    if (!example) {
      throw new NotFoundException(`FileType with ID ${id} not found`);
    }

    Object.assign(example, updateFileTypeDto)

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

