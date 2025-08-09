import { PartialType } from '@nestjs/swagger';
import { CreateDoaminDto } from './create-doamin.dto';

export class UpdateDoaminDto extends PartialType(CreateDoaminDto) {}
