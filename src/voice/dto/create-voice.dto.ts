

import { ApiProperty, OmitType } from "@nestjs/swagger";
import { IsBoolean, IsNumber, IsString } from "class-validator";
import { BaseDto } from "src/common/dto/base.dto";

export class CreateVoiceDto extends OmitType(BaseDto, [] as const) {
    @ApiProperty()
    @IsString()
    fileId: number;

    @ApiProperty()
    @IsString()
    typeVoiceId: number;

    @ApiProperty()
    file?: Express.Multer.File

    link?: string

    name?: string

    @ApiProperty()
    @IsString()
    order: number

    @ApiProperty()
    @IsString()
    isGeneral: boolean
}
