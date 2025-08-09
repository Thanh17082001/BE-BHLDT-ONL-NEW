import { ApiProperty, OmitType } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { BaseDto } from "src/common/dto/base.dto";

export class CreateElearningDto extends OmitType(BaseDto, [] as const) {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    content: string;
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    title: string;
}
