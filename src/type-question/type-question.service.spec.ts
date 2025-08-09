import { Test, TestingModule } from '@nestjs/testing';
import { TypeQuestionService } from './type-question.service';

describe('TypeQuestionService', () => {
  let service: TypeQuestionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TypeQuestionService],
    }).compile();

    service = module.get<TypeQuestionService>(TypeQuestionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
