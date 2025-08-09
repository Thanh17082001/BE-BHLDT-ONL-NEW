import { Module } from '@nestjs/common';
import { SchoolsService } from './schools.service';
import { SchoolsController } from './schools.controller';
import { School } from './entities/school.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GradeModule } from 'src/grade/grade.module';

@Module({
  imports: [TypeOrmModule.forFeature([School]), GradeModule],
  controllers: [SchoolsController],
  providers: [SchoolsService],
  exports: [SchoolsService, TypeOrmModule]
})
export class SchoolsModule {}
