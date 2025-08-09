import { forwardRef, Module } from '@nestjs/common';
import { GameQuestionService } from './game-question.service';
import { GameQuestionController } from './game-question.controller';
import { Type } from 'class-transformer';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameQuestion } from './entities/game-question.entity';
import { GameModule } from 'src/game/game.module';
import { SchoolsModule } from 'src/schools/schools.module';

@Module({
  imports: [TypeOrmModule.forFeature([GameQuestion]), forwardRef(() => GameModule), SchoolsModule],
  controllers: [GameQuestionController],
  providers: [GameQuestionService],
  exports: [GameQuestionService, TypeOrmModule],
})
export class GameQuestionModule {}
