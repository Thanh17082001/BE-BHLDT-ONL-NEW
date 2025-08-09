import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class ChangePassDto {
    @ApiProperty()
    @IsString()
    userId: string;
    @ApiProperty()
    @IsString()
    newPassword: string;
    @ApiProperty()
    @IsString()
    password: string;
}