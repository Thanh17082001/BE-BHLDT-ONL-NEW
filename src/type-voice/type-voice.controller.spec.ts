import { Test, TestingModule } from '@nestjs/testing';
import { TypeVoiceController } from './type-voice.controller';
import { TypeVoiceService } from './type-voice.service';

describe('TypeVoiceController', () => {
  let controller: TypeVoiceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TypeVoiceController],
      providers: [TypeVoiceService],
    }).compile();

    controller = module.get<TypeVoiceController>(TypeVoiceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
