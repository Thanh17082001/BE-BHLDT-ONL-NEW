import { Module } from '@nestjs/common';
import { VoiceService } from './voice.service';
import { VoiceController } from './voice.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Voice } from './entities/voice.entity';
import { TypeVoiceModule } from 'src/type-voice/type-voice.module';
import { FileModule } from 'src/file/file.module';
import { SchoolsModule } from 'src/schools/schools.module';

@Module({
  imports: [TypeOrmModule.forFeature([Voice]), TypeVoiceModule, FileModule,TypeVoiceModule, SchoolsModule],
  controllers: [VoiceController],
  providers: [VoiceService],
  exports:[VoiceService, TypeOrmModule]
})
export class VoiceModule {}
