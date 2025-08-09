import { PartialType } from '@nestjs/swagger';
import { CreateTypeQuestionDto } from './create-type-question.dto';

export class UpdateTypeQuestionDto extends PartialType(CreateTypeQuestionDto) {}
