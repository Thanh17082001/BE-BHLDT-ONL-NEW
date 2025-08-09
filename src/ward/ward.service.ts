import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Ward } from './entities/ward.entity';
import { ILike, Repository } from 'typeorm';
import { WardDto } from './dtos/ward.dto';
import { QueryWardDto } from './dtos/query-ward.dto';
import { CreateWardDto } from './dtos/create-ward.dto';
import { plainToInstance } from "class-transformer";
import { PageOptionsDto } from 'src/common/pagination/page-option-dto';
import { PageDto } from 'src/common/pagination/page.dto';
import { PageMetaDto } from 'src/common/pagination/page.metadata.dto';

@Injectable()
export class WardService {
  constructor(
    @InjectRepository(Ward) private repo: Repository<Ward>) {
  }

  async create(entity: CreateWardDto) {
    
    const ward = this.repo.create(entity);
    const wardEntity = await this.repo.save(ward);
    return wardEntity;
  }

  async find(wardQuery: QueryWardDto, pageOptionsDto: PageOptionsDto): Promise<PageDto<WardDto>> {
    const queryBuilder = this.repo.createQueryBuilder("ward");
    if (wardQuery.name) {
      let nameQuery = wardQuery.name;
      queryBuilder.where("ward.name = :name", { name: nameQuery });
    }
    await queryBuilder.orderBy("ward.createdAt", pageOptionsDto.order).skip(pageOptionsDto.skip).take(pageOptionsDto.take);

    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();

    const pageMetaDto = new PageMetaDto({ pageOptionsDto, itemCount });


    return new PageDto(entities, pageMetaDto);
  }
  findOneByWardName(name: string) {
    return this.repo.findOne({
      where: {
        name: ILike(`%${name}%`) // Không phân biệt hoa thường
      }
    });
  }
  findOne(id: number) {
    return this.repo.findOne({
      where: {
        id: id
      }
    });
  }

  async update(id: number, attrs: Partial<Ward>) {
    const ward = await this.findOne(id);
    if (!ward) {
      throw new NotFoundException('ward not found');
    }
    if (attrs.id !== id) {
      throw new NotFoundException('ward not found');
    }
    Object.assign(ward, attrs);

    return this.repo.save(ward);
  }

  async remove(id: number) {
    const ward = await this.findOne(id);
    if (!ward) {
      throw new NotFoundException('ward not found');
    }
    return this.repo.remove(ward);
  }

  async findByIdDistrict(districtId: number): Promise<Array<Ward>>{
    return this.repo.find({
      where: {
        district: districtId
      }
    })
  }
}
