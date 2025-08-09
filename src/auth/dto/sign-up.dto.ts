import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';


export class SignUpDto {
    @ApiProperty({ example: 'string@gmail.com' })
    @IsString()
    email?: string='';
    @ApiProperty()
    @IsString()
    password?: string='';

    @ApiProperty()
    @IsString()
    username?: string='';

    @ApiProperty()
    @IsString()
    fullName: string;

    @ApiProperty()
    @IsNumber()
    schoolId: number;
  

}
