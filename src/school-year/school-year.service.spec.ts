import { Test, TestingModule } from '@nestjs/testing';
import { SchoolYearService } from './school-year.service';

describe('SchoolYearService', () => {
  let service: SchoolYearService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SchoolYearService],
    }).compile();

    service = module.get<SchoolYearService>(SchoolYearService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
