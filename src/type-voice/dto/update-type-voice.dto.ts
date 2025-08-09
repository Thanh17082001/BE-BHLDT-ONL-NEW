import { PartialType } from '@nestjs/swagger';
import { CreateTypeVoiceDto } from './create-type-voice.dto';

export class UpdateTypeVoiceDto extends PartialType(CreateTypeVoiceDto) {}
