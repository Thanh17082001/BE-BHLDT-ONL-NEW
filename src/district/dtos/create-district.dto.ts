import { IsNumber, IsEmail, IsString, IsDateString, IsOptional } from 'class-validator'

export class CreateDistrictDto {
    @IsString()
    name: string;
    @IsNumber()
    code: number;
    @IsNumber()
    province: number;
}
