import { TypeQuestionModule } from './../type-question/type-question.module';
import { forwardRef, Module } from '@nestjs/common';
import { QuestionService } from './question.service';
import { QuestionController } from './question.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from './entities/question.entity';
import { AnswerModule } from 'src/answer/answer.module';
import { SchoolsModule } from 'src/schools/schools.module';
import { PartModule } from 'src/part/part.module';
import { LevelModule } from 'src/level/level.module';
import { SubjectsModule } from 'src/subjects/subjects.module';
import { TopicsModule } from 'src/topics/topics.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Question]),
    forwardRef(() => AnswerModule),
    SchoolsModule,
    PartModule,
    LevelModule,
    TypeQuestionModule,
    SubjectsModule,
    TopicsModule
  ],
  controllers: [QuestionController],
  providers: [QuestionService],
  exports: [QuestionService, TypeOrmModule],
})
export class QuestionModule {}
