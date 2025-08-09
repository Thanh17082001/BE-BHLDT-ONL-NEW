import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsEmail, IsString, IsDateString, IsOptional, IsNotEmpty, IsNumber } from 'class-validator'
import { BaseDto } from 'src/common/dto/base.dto';

export class CreateTopicDto extends OmitType(BaseDto,[] as const) {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;
    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    subjectId: number;

}
