import { ApiProperty, OmitType } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsNumber } from "class-validator";
import { BaseDto } from "src/common/dto/base.dto";


export class CreateAnswerDto extends OmitType(BaseDto, [] as const) {
    @ApiProperty()
    @IsNotEmpty()
    content: string;

    @ApiProperty()
    @IsNumber()
    questionId: number;

    @ApiProperty()
    @IsBoolean()
    isCorrect: boolean;
}
