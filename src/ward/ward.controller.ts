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
import { WardService } from './ward.service';
import { CreateWardDto } from './dtos/create-ward.dto';
import { UpdateWardDto } from './dtos/update-ward.dto';
import { WardDto } from './dtos/ward.dto';
import { QueryWardDto } from './dtos/query-ward.dto';
import { ApiTags } from '@nestjs/swagger';
import { DistrictService } from 'src/district/district.service';
import { HttpService } from '@nestjs/axios';
import { Province } from 'src/province/entities/supplier.entity';
import { PageMetaDto } from 'src/common/pagination/page.metadata.dto';
import { PageOptionsDto } from 'src/common/pagination/page-option-dto';
import { PageDto } from 'src/common/pagination/page.dto';
import { Public } from 'src/auth/auth.decorator';

@Controller('ward')
@ApiTags('ward')
  @Public()
  
@UseInterceptors(ClassSerializerInterceptor)
export class WardController {
  constructor(private readonly wardService: WardService, private readonly districtService: DistrictService, private readonly httpService: HttpService) { }

  @Post('/')
  async createWard() {
  
  
      const response = await this.httpService.get(`https://provinces.open-api.vn/api/w`).toPromise()
      const wards = response.data
      for (let j = 0; j < wards.length; j++){
        const data: CreateWardDto = {
          name: wards[j].name,
          code: wards[j].code,
          district: wards[j].district_code
        }
        await this.wardService.create(data)
      }
    
  }
  @Get()
  async findAllWards(@Query() wardQuery: QueryWardDto, @Query() pageOptionDto: PageOptionsDto): Promise<PageDto<WardDto>> {
    return await this.wardService.find(wardQuery, pageOptionDto);
  }
  @Put(':id')
  async updateWard(@Param('id') id: number, @Body() updateWardDto: UpdateWardDto) {
    return await this.wardService.update(+id, updateWardDto);
  }

  @Delete(':id')
  removeWard(@Param('id') id: number) {
    return this.wardService.remove(+id);
  }
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<WardDto> {
    let entity = await this.wardService.findOne(id);
    return entity;
  }

  @Get('name/:name')
  async findByName(@Param('name') name: string): Promise<WardDto> {
    let entity = await this.wardService.findOneByWardName(name);
    return entity;
  }

  @Get('district/:code')
   async findByIdProvince(@Param('code') code: number): Promise<PageDto<Province>> {
    let entity = await this.wardService.findByIdDistrict(code);
    const pageMetaDto = new PageMetaDto({ pageOptionsDto: new PageOptionsDto(), itemCount:entity.length });
    return new PageDto(entity, pageMetaDto);
  }

}
