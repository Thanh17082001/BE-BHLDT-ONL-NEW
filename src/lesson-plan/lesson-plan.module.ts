import { Module } from '@nestjs/common';
import { LessonPlanService } from './lesson-plan.service';
import { LessonPlanController } from './lesson-plan.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LessonPlan } from './entities/lesson-plan.entity';
import { TopicsModule } from 'src/topics/topics.module';
import { SubjectsModule } from 'src/subjects/subjects.module';
import { SchoolsModule } from 'src/schools/schools.module';

@Module({
  imports:[TypeOrmModule.forFeature([LessonPlan]), TopicsModule,SubjectsModule, SchoolsModule],
  controllers: [LessonPlanController],
  providers: [LessonPlanService],
  exports: [LessonPlanService, TypeOrmModule],
})
export class LessonPlanModule {}
