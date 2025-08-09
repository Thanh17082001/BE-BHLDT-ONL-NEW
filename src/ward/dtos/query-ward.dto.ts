import { IsEmail, IsOptional, IsString } from "class-validator";

export class QueryWardDto {
    @IsString()
    @IsOptional()
    name: string;
}