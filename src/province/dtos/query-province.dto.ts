import { IsEmail, IsOptional, IsString } from "class-validator";

export class QueryProvinceDto {
    @IsString()
    @IsOptional()
    name: string;
}