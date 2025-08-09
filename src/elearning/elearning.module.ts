import { Module } from '@nestjs/common';
import { ElearningService } from './elearning.service';
import { ElearningController } from './elearning.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Elearning } from './entities/elearning.entity';
import { SchoolsModule } from 'src/schools/schools.module';

@Module({
  imports:[TypeOrmModule.forFeature([Elearning]), SchoolsModule], // Add your entities here
  controllers: [ElearningController],
  providers: [ElearningService],
})
export class ElearningModule {}
