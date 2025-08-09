import { Module } from '@nestjs/common';
import { ProvinceService } from './province.service';
import { ProvinceController } from './province.controller';
import { Province } from './entities/supplier.entity';
import { HttpModule } from '@nestjs/axios';

import { TypeOrmModule } from '@nestjs/typeorm';
@Module({
  imports: [TypeOrmModule.forFeature([Province]), HttpModule],
  controllers: [ProvinceController],
  providers: [ProvinceService],
  exports: [ProvinceService, TypeOrmModule],
})
export class ProvinceModule { }
