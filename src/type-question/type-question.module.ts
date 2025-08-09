import { Module } from '@nestjs/common';
import { TypeQuestionService } from './type-question.service';
import { TypeQuestionController } from './type-question.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeQuestion } from './entities/type-question.entity';

@Module({
  imports:[TypeOrmModule.forFeature([TypeQuestion])],
  controllers: [TypeQuestionController],
  providers: [TypeQuestionService],
  exports:[TypeQuestionService,TypeOrmModule]
})
export class TypeQuestionModule {}
