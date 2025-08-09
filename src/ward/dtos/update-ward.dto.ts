import { IsNumber, IsEmail, IsString, IsDateString, IsOptional, MinLength } from 'class-validator'

export class UpdateWardDto {
    @IsNumber()
    id: number;
    @IsString()
    name: string;
    @IsNumber()
    code: number;
    @IsNumber()
    district_id: number;
}
