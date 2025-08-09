import { ApiProperty, OmitType } from "@nestjs/swagger";
import { IsDate, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { BaseDto } from "src/common/dto/base.dto";

export class CreateStudentDto extends OmitType(BaseDto,[] as const) {

    @ApiProperty()
    @IsString()
    code: string;

    // profile
    @ApiProperty()
    @IsString()
    email: string;
    @ApiProperty()
    @IsString()
    fullname: string;
    @ApiProperty()
    @IsString()
    gender: string;
    @ApiProperty()
    @IsString()
    phone: string;
    @ApiProperty()
    @IsString()
    street: string;
    @ApiProperty()
    @IsString()
    @ApiProperty()
    birthday: Date;

    @ApiProperty()
    @IsNumber()
    ward_id: number;
    @ApiProperty()
    @IsNumber()
    district_id: number;
    @ApiProperty()
    @IsNumber()
    province_id: number;


    //Class
    @ApiProperty()
    @IsNumber()
    classId: number;

    // //Account
    // @ApiProperty()
    // @IsNumber()
    // userId?: number;

}
