import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsDateString, IsOptional, IsNotEmpty } from 'class-validator'

export class CreateFileTypeDto {
    @ApiProperty({ type: String })
    @IsString()
    @IsNotEmpty()
    name: string;
}

