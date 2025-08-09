import { IsEmail, IsString, IsDateString, IsOptional, Min, IsEmpty, MinLength, IsNotEmpty, IsNumber, IsArray } from 'class-validator'
export class CreateUserDto {
    @IsString()
    fullName: string;


    @IsString()
    username?: string;

    @IsString()
    password: string;



    @IsNotEmpty()
    @IsNumber()
    schoolId: number;

    @IsArray()
    gradeIds: number[];

    @IsArray()
    subjectIds: number[];

    @IsOptional()
    isAdmin?: boolean = false;
    
    @IsOptional()
    role: string = 'Giáo viên';

}
