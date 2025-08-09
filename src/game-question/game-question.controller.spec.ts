import { Test, TestingModule } from '@nestjs/testing';
import { GameQuestionController } from './game-question.controller';
import { GameQuestionService } from './game-question.service';

describe('GameQuestionController', () => {
  let controller: GameQuestionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GameQuestionController],
      providers: [GameQuestionService],
    }).compile();

    controller = module.get<GameQuestionController>(GameQuestionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
