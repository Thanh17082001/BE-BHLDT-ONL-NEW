import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class StatisticalDto{
    @ApiProperty()
    @IsString()
    classId: number;


    @ApiProperty()
    @IsString()
    subjectId: number;

    @ApiProperty()
    @IsString()
    schoolYearId: number;

    @ApiProperty({required:false, default:0, example:0})
    @IsString()
    typeScoreId?: number =0;
}