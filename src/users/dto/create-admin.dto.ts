import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsDateString, IsOptional, Min, IsEmpty, MinLength, IsNotEmpty, IsNumber, IsArray } from 'class-validator'
export class CreateUserAdminDto {
    


    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    schoolType: string;

    

}
