import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNumber, IsOptional, IsString } from "class-validator";
import { CreateGameQuestionDto } from "src/game-question/dto/create-game-question.dto";

export class AddQuestionToGameDto {
    @ApiProperty()
    @IsNumber()
    gameId: Number;

    @ApiProperty()
    @IsOptional()
    gameQuestionIds?: Number[] = null;

    @ApiProperty()
    @IsOptional()
    gameQuestion?: CreateGameQuestionDto = null;
}
