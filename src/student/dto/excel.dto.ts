import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class ImportFileExcelStudent {
    @ApiProperty()
    file: Express.Multer.File
    @ApiProperty()
    @IsString()
    classId: number;
}