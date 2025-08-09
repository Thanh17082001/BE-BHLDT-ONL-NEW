import { IsNumber, IsEmail, IsString, IsDateString, IsOptional } from 'class-validator'

export class CreateWardDto {
    @IsString()
    name: string;
    @IsNumber()
    code: number;
    @IsNumber()
    district: number;
}
