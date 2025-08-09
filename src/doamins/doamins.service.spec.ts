import { Test, TestingModule } from '@nestjs/testing';
import { DoaminsService } from './doamins.service';

describe('DoaminsService', () => {
  let service: DoaminsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DoaminsService],
    }).compile();

    service = module.get<DoaminsService>(DoaminsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
