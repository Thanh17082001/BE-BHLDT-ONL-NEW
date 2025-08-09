import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { District } from './entities/district.entity';
import { ILike, Repository } from 'typeorm';
import { DistrictDto } from './dtos/district.dto';
import { QueryDistrictDto } from './dtos/query-district.dto';
import { CreateDistrictDto } from './dtos/create-district.dto';
import { plainToInstance } from "class-transformer";
import { PageOptionsDto } from 'src/common/pagination/page-option-dto';
import { PageDto } from 'src/common/pagination/page.dto';
import { PageMetaDto } from 'src/common/pagination/page.metadata.dto';

@Injectable()
export class DistrictService {
  constructor(
    @InjectRepository(District) private repo: Repository<District>) {
  }

  async create(entity: CreateDistrictDto) {
    // const checkExist = await this.findOneByDistrictname(entity.name);
    // console.log(checkExist);
    // if (checkExist) {
    //   throw new BadRequestException('District is Already Registered');
    // }
    const district = this.repo.create(entity);
    const districtEntity = await this.repo.save(district);
    return districtEntity;
  }

  async find(districtQuery: QueryDistrictDto, pageOptionsDto: PageOptionsDto): Promise<PageDto<DistrictDto>> {
    const queryBuilder = this.repo.createQueryBuilder("district");
    if (districtQuery.name) {
      let nameQuery = districtQuery.name;
      console.log("name query ", nameQuery);
      queryBuilder.where("district.name = :name", { name: nameQuery });
    }

    console.log("pageOptionsDto.skip", pageOptionsDto.skip);
    console.log("pageOptionsDto.take", pageOptionsDto.take);

    await queryBuilder.orderBy("district.createdAt", pageOptionsDto.order).skip(pageOptionsDto.skip).take(pageOptionsDto.take);

    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();

    const pageMetaDto = new PageMetaDto({ pageOptionsDto, itemCount });


    return new PageDto(entities, pageMetaDto);
  }

  async find2(): Promise<Array<DistrictDto>> {
    const data = await this.repo.find();
    return data;
  }

  findOne(id: number) {
    return this.repo.findOne({
      where: {
        id: id
      }
    });
  }

  findByName(name: string) {
    return this.repo.findOne({
      where: {
        name: ILike(`%${name}%`) // Không phân biệt hoa thường
      }
    });
  }

  async update(id: number, attrs: Partial<District>) {
    const district = await this.findOne(id);
    if (!district) {
      throw new NotFoundException('district not found');
    }
    if (attrs.id !== id) {
      throw new NotFoundException('district not found');
    }
    const checkExist = await this.findOneByDistrictname(attrs.name);
    if (checkExist && checkExist.id !== district.id) {
      throw new BadRequestException('District is Already Registered');
    }
    Object.assign(district, attrs);
    console.log("last", district);

    return this.repo.save(district);
  }

  async remove(id: number) {
    const district = await this.findOne(id);
    if (!district) {
      throw new NotFoundException('district not found');
    }
    return this.repo.remove(district);
  }

  findOneByDistrictname(name: string) {
    return this.repo.findOne({
      where: {
        name: name
      }
    });
  }

  async findByIdProvince(province_id: number): Promise<Array<District>>{
    return this.repo.find({
      where: {
        province: province_id
      }
    })
  }

}
