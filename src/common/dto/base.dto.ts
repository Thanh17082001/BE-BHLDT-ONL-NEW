import { IsOptional, IsString } from "class-validator";



export class BaseDto {
   @IsOptional()
    createdBy?: any; 

   @IsOptional()
    isPublic?: any = false;
    
    @IsOptional()
    schoolId?: number = null;
}

