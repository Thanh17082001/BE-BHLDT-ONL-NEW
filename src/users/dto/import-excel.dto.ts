import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class ImportFileExcelUser {
    @ApiProperty({
        format: 'binary',
        required: true
    })
    file: any;  // Không dùng Express.Multer.File ở đây
}