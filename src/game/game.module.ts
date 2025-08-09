import { SchoolsModule } from './../schools/schools.module';
import { forwardRef, Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from './entities/game.entity';
import { GameQuestionModule } from 'src/game-question/game-question.module';

@Module({
  imports: [TypeOrmModule.forFeature([Game]), forwardRef(() => GameQuestionModule), SchoolsModule],
  controllers: [GameController],
  providers: [GameService],
  exports: [GameService, TypeOrmModule],
})
export class GameModule {}
