import { Test, TestingModule } from '@nestjs/testing';
import { LessonPlanService } from './lesson-plan.service';

describe('LessonPlanService', () => {
  let service: LessonPlanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LessonPlanService],
    }).compile();

    service = module.get<LessonPlanService>(LessonPlanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
