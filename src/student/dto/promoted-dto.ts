import { ApiProperty } from "@nestjs/swagger";
import { IsNumber } from "class-validator";

export class PromotedDto{
    @ApiProperty()
    @IsNumber()
    stundentId:number;
    
    @ApiProperty()
    @IsNumber()
    newClassId:number;

    @ApiProperty()
    @IsNumber()
    oldSchoolYearId: number;
    
    @ApiProperty()
    @IsNumber()
    newSchoolYearId:number;

    @ApiProperty()
    @IsNumber()
    oldClassId: number;
}