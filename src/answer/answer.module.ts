import { forwardRef, Module } from '@nestjs/common';
import { AnswerService } from './answer.service';
import { AnswerController } from './answer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Answer } from './entities/answer.entity';
import { QuestionModule } from 'src/question/question.module';
import { SchoolsModule } from 'src/schools/schools.module';

@Module({
  imports:[TypeOrmModule.forFeature([Answer]), forwardRef( () => QuestionModule), SchoolsModule],
  controllers: [AnswerController],
  providers: [AnswerService],
  exports: [AnswerService, TypeOrmModule],
})
export class AnswerModule {}
