import { Module } from '@nestjs/common';
import { WardService } from './ward.service';
import { WardController } from './ward.controller';
import { Ward } from './entities/ward.entity';

import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { DistrictModule } from 'src/district/district.module';
@Module({
  imports: [TypeOrmModule.forFeature([Ward]), HttpModule, DistrictModule],
  controllers: [WardController],
  providers: [WardService],
  exports: [WardService, TypeOrmModule],
})
export class WardModule { }
