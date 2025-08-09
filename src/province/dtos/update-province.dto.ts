import { IsNumber, IsEmail, IsString, IsDateString, IsOptional, MinLength } from 'class-validator'

export class UpdateProvinceDto {
    @IsNumber()
    id: number;
    @IsString()
    name: string;
    @IsNumber()
    code: number;
}
