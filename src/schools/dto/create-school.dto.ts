import { ApiProperty, OmitType } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { SchoolType } from "../entities/school.entity";
import { BaseDto } from "src/common/dto/base.dto";

export class CreateSchoolDto extends OmitType(BaseDto, ['isPublic'] as const) {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    code?: string=null;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    address?: string=null;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    description?: string=null;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    manageBy?: string=null;


    @ApiProperty({ enum: SchoolType })
    @IsString()
    @IsNotEmpty()
    schoolType: SchoolType;

}
