import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateTypeVoiceDto {
    @ApiProperty()
    @IsString()
    name: string;
}
