import { Test, TestingModule } from '@nestjs/testing';
import { TypeScoreController } from './type-score.controller';
import { TypeScoreService } from './type-score.service';

describe('TypeScoreController', () => {
  let controller: TypeScoreController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TypeScoreController],
      providers: [TypeScoreService],
    }).compile();

    controller = module.get<TypeScoreController>(TypeScoreController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
