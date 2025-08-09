import { Module } from '@nestjs/common';
import { TopicsService } from './topics.service';
import { TopicsController } from './topics.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Topic } from './entities/topic.entity';
import { SubjectsModule } from 'src/subjects/subjects.module';
import { SchoolsModule } from 'src/schools/schools.module';

@Module({
  imports: [TypeOrmModule.forFeature([Topic]),SubjectsModule,SchoolsModule],
  controllers: [TopicsController],
  providers: [TopicsService],
  exports: [TopicsService,TypeOrmModule],
})
export class TopicsModule {}
