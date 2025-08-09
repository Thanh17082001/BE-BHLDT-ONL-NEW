import { Module } from '@nestjs/common';
import { TypeScoreService } from './type-score.service';
import { TypeScoreController } from './type-score.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeScore } from './entities/type-score.entity';

@Module({
  imports:[TypeOrmModule.forFeature([TypeScore])],
  controllers: [TypeScoreController],
  providers: [TypeScoreService],
  exports: [TypeScoreService, TypeOrmModule]
})
export class TypeScoreModule {}
