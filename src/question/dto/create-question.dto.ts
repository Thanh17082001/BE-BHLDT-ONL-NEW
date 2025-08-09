import { Answer } from './../../answer/entities/answer.entity';
import { ApiProperty, OmitType } from "@nestjs/swagger";
import { IsArray, IsNumber, IsOptional, IsString } from "class-validator";
import { CreateAnswerDto } from 'src/answer/dto/create-answer.dto';
import { BaseDto } from 'src/common/dto/base.dto';

export class CreateQuestionDto extends OmitType(BaseDto,[] as const) {

    @ApiProperty()
    @IsString()
    content: string;
    @ApiProperty()
    @IsNumber()
    subjectId: number;

    @ApiProperty()
    @IsOptional()
    partId?: number = null;
    @ApiProperty()
    @IsNumber()
    topicId: number;
    @ApiProperty()
    @IsNumber()
    typeQuestionId: number;
    @ApiProperty()
    @IsNumber()
    numberOfAnswers: number;
    @ApiProperty()
    @IsNumber()
    levelId: number;
    @ApiProperty()
    @IsNumber()
    score: number;

    @ApiProperty({ type: [CreateAnswerDto] })
    @IsArray()
    answers: CreateAnswerDto[];
}
