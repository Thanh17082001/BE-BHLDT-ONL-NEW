import { ClassModule } from './../class/class.module';
import { forwardRef, Module } from '@nestjs/common';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';
import { Type } from 'class-transformer';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from './entities/student.entity';
import { SchoolsModule } from 'src/schools/schools.module';
import { DistrictModule } from 'src/district/district.module';
import { WardModule } from 'src/ward/ward.module';
import { ProvinceModule } from 'src/province/province.module';
import { UsersModule } from 'src/users/users.module';
import { ScoreModule } from 'src/score/score.module';
import { TypeScoreModule } from 'src/type-score/type-score.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Student]),
    SchoolsModule,
    ClassModule,
    DistrictModule,
    WardModule,
    ProvinceModule,
    UsersModule,
    TypeScoreModule,
    forwardRef(() => ScoreModule),
  ],
  controllers: [StudentController],
  providers: [StudentService],
  exports: [StudentService, TypeOrmModule],
})
export class StudentModule {}
