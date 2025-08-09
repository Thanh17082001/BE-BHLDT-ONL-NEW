import { ApiProperty } from "@nestjs/swagger";
import { IsNumber } from "class-validator";

export class changeClassStudent{
    @ApiProperty()
   @IsNumber()
    id: number;
    
    @ApiProperty()
    @IsNumber()
    classId:number;
}