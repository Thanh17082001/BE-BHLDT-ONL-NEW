import { ApiProperty, OmitType } from "@nestjs/swagger"
import { IsDate, IsNumber, IsString } from "class-validator"
import { BaseDto } from "src/common/dto/base.dto"

export class CreateSchoolYearDto extends OmitType( BaseDto, ['isPublic'] as const) {
    @ApiProperty()
    @IsNumber()
    startYear: number
    @ApiProperty()
    @IsNumber()
    endYear: number
    // @ApiProperty()
    @IsString()
    name?: string = ''
}
