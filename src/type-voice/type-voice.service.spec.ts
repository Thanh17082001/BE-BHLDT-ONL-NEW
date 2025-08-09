import { Test, TestingModule } from '@nestjs/testing';
import { TypeVoiceService } from './type-voice.service';

describe('TypeVoiceService', () => {
  let service: TypeVoiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TypeVoiceService],
    }).compile();

    service = module.get<TypeVoiceService>(TypeVoiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
