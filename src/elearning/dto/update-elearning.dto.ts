import { PartialType } from '@nestjs/swagger';
import { CreateElearningDto } from './create-elearning.dto';

export class UpdateElearningDto extends PartialType(CreateElearningDto) {}
