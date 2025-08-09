import { Test, TestingModule } from '@nestjs/testing';
import { ElearningController } from './elearning.controller';
import { ElearningService } from './elearning.service';

describe('ElearningController', () => {
  let controller: ElearningController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ElearningController],
      providers: [ElearningService],
    }).compile();

    controller = module.get<ElearningController>(ElearningController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
