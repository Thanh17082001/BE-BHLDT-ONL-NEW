import { Module } from '@nestjs/common';
import { TypeVoiceService } from './type-voice.service';
import { TypeVoiceController } from './type-voice.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeVoice } from './entities/type-voice.entity';

@Module({
  imports:[TypeOrmModule.forFeature([TypeVoice])],
  controllers: [TypeVoiceController],
  providers: [TypeVoiceService],
  exports:[TypeOrmModule, TypeVoiceService]
})
export class TypeVoiceModule {}
