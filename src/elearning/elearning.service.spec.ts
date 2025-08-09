import { Test, TestingModule } from '@nestjs/testing';
import { ElearningService } from './elearning.service';

describe('ElearningService', () => {
  let service: ElearningService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ElearningService],
    }).compile();

    service = module.get<ElearningService>(ElearningService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
