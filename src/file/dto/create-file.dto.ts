import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsNumber, IsEmail, IsString, IsDateString, IsOptional, IsArray, IsBoolean } from 'class-validator'
import { BaseDto } from 'src/common/dto/base.dto';

export class CreateFileDto extends OmitType(BaseDto,[] as const) {
    @ApiProperty()
    @IsString()
    name: string;

    path?: string = '';

    mimetype: string;


    @IsString()
    @IsOptional()
    previewImage?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    filetypeId?: number;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    topicId?: number;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    parentId?: number;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    subjectId?: number;


    @ApiProperty({ type: 'string', format: 'binary', required: false })
    file?: any;

    @IsBoolean()
    isFolder: boolean = true;


}

