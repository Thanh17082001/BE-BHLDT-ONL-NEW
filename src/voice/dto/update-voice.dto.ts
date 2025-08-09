import { PartialType } from '@nestjs/swagger';
import { CreateVoiceDto } from './create-voice.dto';

export class UpdateVoiceDto extends PartialType(CreateVoiceDto) {}
