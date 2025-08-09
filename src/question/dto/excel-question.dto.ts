import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class ImportFileExcel {
  
    file: Express.Multer.File
    
    @ApiProperty()
    @IsString()
    subjectId: number;

    // @ApiProperty()
    // @IsString()
    // partId: number;

    @ApiProperty()
    @IsString()
    topicId: number;

    @ApiProperty()
    @IsString()
    typeQuestionId: number;
}