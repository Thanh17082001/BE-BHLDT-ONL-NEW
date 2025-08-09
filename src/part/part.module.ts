import { Module } from '@nestjs/common';
import { PartService } from './part.service';
import { PartController } from './part.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Part } from './entities/part.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Part])],
  controllers: [PartController],
  providers: [PartService],
  exports: [PartService, TypeOrmModule],
})
export class PartModule {}
