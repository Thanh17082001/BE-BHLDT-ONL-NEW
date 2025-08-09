import { IsEmail, IsOptional, IsString } from "class-validator";

export class QueryDistrictDto {
    @IsString()
    @IsOptional()
    name: string;
}