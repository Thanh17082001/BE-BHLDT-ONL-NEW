import { ApiProperty, OmitType } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";
import { BaseDto } from "src/common/dto/base.dto";

export class CreateClassDto extends OmitType(BaseDto,[] as const) {
    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsString()
    suffixes: string;

    @ApiProperty()
    @IsNumber()
    gradeId: number

    @ApiProperty()
    @IsNumber()
    schoolYearId: number
}
