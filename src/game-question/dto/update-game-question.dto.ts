import { PartialType } from '@nestjs/swagger';
import { CreateGameQuestionDto } from './create-game-question.dto';

export class UpdateGameQuestionDto extends PartialType(CreateGameQuestionDto) {}
