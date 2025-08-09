import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class CreatePartDto {
    @ApiProperty()
    @IsString()
    name: string;
    @ApiProperty()
    @IsNumber()
    order: number;
}
