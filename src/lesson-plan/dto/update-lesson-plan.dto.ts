import { PartialType } from '@nestjs/swagger';
import { CreateLessonPlanDto } from './create-lesson-plan.dto';

export class UpdateLessonPlanDto extends PartialType(CreateLessonPlanDto) {
    path:string
}
