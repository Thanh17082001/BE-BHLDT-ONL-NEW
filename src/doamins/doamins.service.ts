

import { CreateDoaminDto } from './dto/create-doamin.dto';
import { UpdateDoaminDto } from './dto/update-doamin.dto';

import { HttpException, Injectable, NotFoundException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { PageOptionsDto } from 'src/common/pagination/page-option-dto';
import { ItemDto, PageDto } from 'src/common/pagination/page.dto';
import { PageMetaDto } from 'src/common/pagination/page.metadata.dto';
import { Doamin } from './entities/doamin.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class DoaminsService {
  constructor(
    @InjectRepository(Doamin) private repo: Repository<Doamin>,
  ) { }
  async create(createDoaminDto: CreateDoaminDto, user:User): Promise<Doamin> {
    const { name } = createDoaminDto;
    if (await this.repo.findOne({ where: { name } })) {
      throw new HttpException('Tên đã tồn tại', 409);
    }
    const newUser = this.repo.create({ name ,createdBy:user });
    return await this.repo.save(newUser);
  }

  async findAll(): Promise<Array<Doamin>> {
    const queryBuilder = this.repo.createQueryBuilder('Doamin').leftJoinAndSelect('Doamin.createdBy', 'createdBy');
    
    queryBuilder.orderBy(`Doamin.createdAt`, 'DESC')
    const { entities } = await queryBuilder.getRawAndEntities();

    return entities
  }

  async findOne(id: number): Promise<ItemDto<Doamin>> {

    const example = await this.repo.findOne({ where: { id } });
    if (!example) {
      throw new HttpException('Not found', 404);
    }
    return new ItemDto(example);
  }

  async findOrCreateByNames(names: string[], schoolId: number): Promise<number[]> {
    
    // Lấy danh sách các khối 
    const existingDoamins = await this.repo.find({
      where: {
        name: In(names),
      },
      select: ['id', 'name'],
    });



    // Tạo Map để kiểm tra trùng lặp nhanh hơn
    const existingMap = new Map(existingDoamins.map(Doamin => [Doamin.name, Doamin.id]));

    // Lọc ra những khối chưa tồn tại theo tên (không phân biệt hoa thường)
    const newNames = names.filter(name => !existingMap.has(name));




    let newIds: number[] = [];
    if (newNames.length > 0) {
      // Tạo khối mới
      console.log('đây');
      const newDoamins = newNames.map(name => this.repo.create({
        name,
      }));

      const savedDoamins = await this.repo.save(newDoamins);

      // Thêm ID của khối mới vào danh sách trả về
      newIds = savedDoamins.map(Doamin => Doamin.id);
    }

    // Trả về danh sách ID của tất cả khối đã có và mới tạo
    return [...Array.from(existingMap.values()), ...newIds];
  }

  async findByIds(DoaminIds: number[]): Promise<Doamin[]> {
    return this.repo.find({ where: { id: In(DoaminIds) } });
  }

  async update(id: number, updateDoaminDto: UpdateDoaminDto) {
    const { name } = updateDoaminDto;
    const exampleExits: Doamin = await this.repo.findOne({ where: { name, id: Not(id) } });
    if (exampleExits) {
      throw new HttpException('Tên đã tồn tại', 409);
    }

    const example: Doamin = await this.repo.findOne({ where: { id } });

    if (!example) {
      throw new NotFoundException(`Doamin with ID ${id} not found`);
    }

    Object.assign(example, updateDoaminDto)

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

