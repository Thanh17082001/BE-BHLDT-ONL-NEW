import { Test, TestingModule } from '@nestjs/testing';
import { DoaminsController } from './doamins.controller';
import { DoaminsService } from './doamins.service';

describe('DoaminsController', () => {
  let controller: DoaminsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DoaminsController],
      providers: [DoaminsService],
    }).compile();

    controller = module.get<DoaminsController>(DoaminsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
