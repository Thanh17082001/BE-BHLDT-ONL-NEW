import { IsNumber, IsEmail, IsString, IsDateString, IsOptional, MinLength } from 'class-validator'

export class UpdateDistrictDto {
    @IsNumber()
    id: number;
    @IsString()
    name: string;
    @IsNumber()
    code: number;
    @IsNumber()
    province_id: number;
}
