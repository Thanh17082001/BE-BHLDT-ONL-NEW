import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNumber } from "class-validator";

export class Promoted2Dto{
    @ApiProperty({example:[1,2,3]})
    @IsArray()
    stundentIds:number[];
    
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