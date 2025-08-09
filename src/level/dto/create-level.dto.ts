import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class CreateLevelDto {
    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsNumber()
    order: number;

    @ApiProperty()
    @IsNumber()
    typeQuestionId: number;
}
