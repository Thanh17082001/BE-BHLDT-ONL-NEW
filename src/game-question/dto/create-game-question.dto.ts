import { ApiProperty, OmitType } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { BaseDto } from "src/common/dto/base.dto";

export class CreateGameQuestionDto extends OmitType(BaseDto, [] as const) {
    @ApiProperty() 
    @IsString()
    suggest: string;
    @ApiProperty()
    @IsString()
    answer: string;
}
