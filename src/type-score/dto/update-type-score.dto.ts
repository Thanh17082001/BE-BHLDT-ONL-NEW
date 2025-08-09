import { PartialType } from '@nestjs/swagger';
import { CreateTypeScoreDto } from './create-type-score.dto';

export class UpdateTypeScoreDto extends PartialType(CreateTypeScoreDto) {}
