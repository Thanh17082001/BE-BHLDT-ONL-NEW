import { forwardRef, Module } from '@nestjs/common';
import { ScoreService } from './score.service';
import { ScoreController } from './score.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Score } from './entities/score.entity';
import { TypeScoreModule } from 'src/type-score/type-score.module';
import { ClassModule } from 'src/class/class.module';
import { SchoolsModule } from 'src/schools/schools.module';
import { SubjectsModule } from 'src/subjects/subjects.module';
import { SchoolYearModule } from 'src/school-year/school-year.module';
import { StudentModule } from 'src/student/student.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Score]),
    TypeScoreModule,
    ClassModule,
    SchoolsModule,
    SubjectsModule,
    SchoolYearModule,
    forwardRef( () => StudentModule)
    ],
  controllers: [ScoreController],
  providers: [ScoreService],
  exports: [ScoreService, TypeOrmModule],
})
export class ScoreModule {}
