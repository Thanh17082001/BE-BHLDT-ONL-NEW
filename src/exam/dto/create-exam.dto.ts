import { ApiProperty, OmitType } from "@nestjs/swagger";
import { IsArray, IsNumber, IsString } from "class-validator";
import { BaseDto } from "src/common/dto/base.dto";

export class CreateExamDto extends OmitType(BaseDto,[] as const) {
    @ApiProperty()
    @IsString()
    name: string;
    @ApiProperty()
    @IsNumber()
    subjectId: number;
    @ApiProperty()
    @IsNumber()
    time: number;
    @ApiProperty()
    @IsNumber()
    subExam: number;
    @ApiProperty()
    @IsNumber()
    totalMultipleChoiceScore: number;
    @ApiProperty()
    @IsNumber()
    totalMultipleChoiceScorePartI: number;
    @ApiProperty()
    @IsNumber()
    totalMultipleChoiceScorePartII: number;
    @ApiProperty()
    @IsNumber()
    totalMultipleChoiceScorePartIII: number;
    @ApiProperty()
    @IsNumber()
    totalEssayScore: number;
    @ApiProperty({ example: [1, 2, 3] })
    @IsArray()
    questionIds: number[];
}
