import { Test, TestingModule } from '@nestjs/testing';
import { TypeScoreService } from './type-score.service';

describe('TypeScoreService', () => {
  let service: TypeScoreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TypeScoreService],
    }).compile();

    service = module.get<TypeScoreService>(TypeScoreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
