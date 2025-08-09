import { ApiProduces, ApiProperty, OmitType } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { BaseDto } from "src/common/dto/base.dto";

export class CreateGradeDto extends OmitType(BaseDto ,[] as const) {
  
    @IsString()
    @IsNotEmpty()
    name: string;
    
}
