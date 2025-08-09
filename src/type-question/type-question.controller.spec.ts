import { Test, TestingModule } from '@nestjs/testing';
import { TypeQuestionController } from './type-question.controller';
import { TypeQuestionService } from './type-question.service';

describe('TypeQuestionController', () => {
  let controller: TypeQuestionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TypeQuestionController],
      providers: [TypeQuestionService],
    }).compile();

    controller = module.get<TypeQuestionController>(TypeQuestionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
