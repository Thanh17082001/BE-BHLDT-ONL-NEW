import { Module } from '@nestjs/common';
import { DistrictService } from './district.service';
import { DistrictController } from './district.controller';
import { District } from './entities/district.entity';

import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ProvinceModule } from 'src/province/province.module';
@Module({
  imports: [TypeOrmModule.forFeature([District]), HttpModule, ProvinceModule],
  controllers: [DistrictController],
  providers: [DistrictService],
  exports: [DistrictService, TypeOrmModule],
})
export class DistrictModule { }
