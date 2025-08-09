import { Province } from './../province/entities/supplier.entity';
import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Patch,
  Param,
  Delete,
  NotFoundException,
  UseInterceptors,
  ClassSerializerInterceptor,
  Request,
  UnauthorizedException,
  Query,
} from '@nestjs/common';
import { DistrictService } from './district.service';
import { CreateDistrictDto } from './dtos/create-district.dto';
import { UpdateDistrictDto } from './dtos/update-district.dto';
import { DistrictDto } from './dtos/district.dto';
import { QueryDistrictDto } from './dtos/query-district.dto';
import { ApiTags } from '@nestjs/swagger';
import { HttpService } from '@nestjs/axios';
import { PageOptionsDto } from 'src/common/pagination/page-option-dto';
import { PageDto } from 'src/common/pagination/page.dto';
import { PageMetaDto } from 'src/common/pagination/page.metadata.dto';
import { Public } from 'src/auth/auth.decorator';

@Controller('district')
@ApiTags('district')
@Public()
@UseInterceptors(ClassSerializerInterceptor)
export class DistrictController {
  constructor(private readonly districtService: DistrictService, private readonly httpService: HttpService) { }

  @Post('/')
  async createDistrict() {
    let districts = []
      const resDistricts = await this.httpService.get(`https://provinces.open-api.vn/api/d`).toPromise()
       districts.push(...resDistricts.data)
    

    for (let j = 0; j < districts.length; j++) {
      const data: CreateDistrictDto = {
        name: districts[j].name ?? '',
        code: +districts[j].code,
        province: districts[j].province_code
      }
      await this.districtService.create(data);
    }
  }
  @Get()
  async findAllDistricts(@Query() districtQuery: QueryDistrictDto, @Query() pageOptionDto: PageOptionsDto): Promise<PageDto<DistrictDto>> {
    return await this.districtService.find(districtQuery, pageOptionDto);
  }
  @Put(':id')
  async updateDistrict(@Param('id') id: number, @Body() updateDistrictDto: UpdateDistrictDto) {
    return await this.districtService.update(+id, updateDistrictDto);
  }

  @Delete(':id')
  removeDistrict(@Param('id') id: number) {
    return this.districtService.remove(+id);
  }
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<DistrictDto> {
    let entity = await this.districtService.findOne(id);
    return entity;
  }

  @Get('name/:name')
  async findByName(@Param('name') name: string): Promise<DistrictDto> {
    let entity = await this.districtService.findByName(name);
    return entity;
  }

  @Get('province/:code')
  async findByIdProvince(@Param('code') code: number): Promise<PageDto<DistrictDto>> {
    let entity = await this.districtService.findByIdProvince(code);
    const pageMetaDto = new PageMetaDto({ pageOptionsDto: new PageOptionsDto(), itemCount:entity.length });
    return new PageDto(entity, pageMetaDto);
  }

}
