import { Module } from '@nestjs/common';
import { LevelService } from './level.service';
import { LevelController } from './level.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Level } from './entities/level.entity';
import { TypeQuestionModule } from 'src/type-question/type-question.module';

@Module({
  imports: [TypeOrmModule.forFeature([Level]), TypeQuestionModule],
  controllers: [LevelController],
  providers: [LevelService],
  exports:[LevelService,TypeOrmModule]
})
export class LevelModule {}
