import { IsNumber, IsEmail, IsString, IsDateString, IsOptional } from 'class-validator'

export class CreateProvinceDto {
    @IsString()
    name: string;
    @IsNumber()
    code: number;
}
