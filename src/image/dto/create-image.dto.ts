import { IsNumber, IsString } from "class-validator";



export class CreateImageDto {
    @IsString()
    name: string;
    @IsString()
    path: string;
    @IsNumber()
    fileId: number
}
