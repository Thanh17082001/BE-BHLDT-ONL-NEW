import { PartModule } from 'src/part/part.module';
import { Module } from '@nestjs/common';
import { ExamService } from './exam.service';
import { ExamController } from './exam.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exam } from './entities/exam.entity';
import { QuestionModule } from 'src/question/question.module';
import { SubjectsModule } from 'src/subjects/subjects.module';
import { SchoolsModule } from 'src/schools/schools.module';

@Module({
  imports: [TypeOrmModule.forFeature([Exam]), QuestionModule, SubjectsModule, SchoolsModule, PartModule],
  controllers: [ExamController],
  providers: [ExamService],
  exports:[TypeOrmModule,ExamService]
})
export class ExamModule {}
