import { Test, TestingModule } from '@nestjs/testing';
import { GameQuestionService } from './game-question.service';

describe('GameQuestionService', () => {
  let service: GameQuestionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GameQuestionService],
    }).compile();

    service = module.get<GameQuestionService>(GameQuestionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
