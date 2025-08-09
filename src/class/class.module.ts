import { GradeModule } from 'src/grade/grade.module';
import { Module } from '@nestjs/common';
import { ClassService } from './class.service';
import { ClassController } from './class.controller';
import { Type } from 'class-transformer';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Class } from './entities/class.entity';
import { SchoolsModule } from 'src/schools/schools.module';
import { SchoolYearModule } from 'src/school-year/school-year.module';

@Module({
  imports: [TypeOrmModule.forFeature([Class]), SchoolsModule, GradeModule, SchoolYearModule],
  controllers: [ClassController],
  providers: [ClassService],
  exports: [ClassService,TypeOrmModule],
})
export class ClassModule {}
