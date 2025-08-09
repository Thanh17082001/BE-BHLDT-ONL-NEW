import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional } from "class-validator";
class levelInterface {
    levelId: number
    count: number
}

export class RandomQuestionDto{
    @ApiProperty()
    @IsNumber()
    subjectId: number;
    @ApiProperty()
    @IsNumber()
    partId: number;
    @ApiProperty()
    @IsNumber()
    topicId: number;
    @ApiProperty()
    @IsNumber()
    typeQuestionId: number;
    @ApiProperty({ type: [levelInterface], example: [{ levelId: 1, count: 3 }] })
    @IsOptional()
    levels: levelInterface [];
}

