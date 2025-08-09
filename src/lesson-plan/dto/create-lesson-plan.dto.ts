
import { ApiProperty, OmitType } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";
import { BaseDto } from "src/common/dto/base.dto";

export class CreateLessonPlanDto extends OmitType(BaseDto,[] as const) {
    
    
    @ApiProperty({type:String})
     @IsString()
    name: string;

    // @ApiProperty({ type: Number })
    // @IsNumber()
    // size: number;
    
    @ApiProperty({ type: Number })
    @IsString()
    topic: number;

    linkImage: string;
    
    path: string;
    previewImage: string;

    @ApiProperty({ type: Number })
    @IsString()
    subjectId: number;

    @ApiProperty({ type: Number })
    @IsString()
    fileType: number;

    file: Express.Multer.File
}

