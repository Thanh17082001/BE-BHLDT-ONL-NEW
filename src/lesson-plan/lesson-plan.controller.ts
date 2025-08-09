import { LessonPlan } from './entities/lesson-plan.entity';
import { LessonPlanService } from './lesson-plan.service';
import { CreateLessonPlanDto } from './dto/create-lesson-plan.dto';
import { UpdateLessonPlanDto } from './dto/update-lesson-plan.dto';

import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, Req, Query, UseGuards, UploadedFile, Put } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { multerOptions, storage } from 'src/config/multer';
import { generateImageFromVideo } from 'src/utils/generate-thumbnail-video';
import { resizeImage } from 'src/utils/resize-image';
import { Public } from 'src/auth/auth.decorator';
import { PageOptionsDto } from 'src/common/pagination/page-option-dto';
import { Roles } from 'src/role/role.decorator';
import { Role } from 'src/role/role.enum';
import { RolesGuard } from 'src/role/role.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('lesson-plan')
  @UseGuards(RolesGuard)
export class LessonPlanController {
  constructor(private readonly LessonPlanService: LessonPlanService) {}

  @Post()
    @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Upload LessonPlan' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'LessonPlan upload',
    type: CreateLessonPlanDto,
  })
  @UseInterceptors(FileInterceptor('file', { storage: storage('lesson-plan', true), ...multerOptions }))
  async create(@UploadedFile() file: Express.Multer.File, @Body() createLessonPlanDto: CreateLessonPlanDto, @Req() request: Request) {
    const user = request['user'] ?? null;
   try {
     if (file) {
       if (file.mimetype == 'application/vnd.openxmlformats-officedocument.presentationml.presentation' || file.mimetype == 'application/vnd.ms-powerpoint') {
             createLessonPlanDto.path = `public/lesson-plan/ptt/${file.filename}`;
             createLessonPlanDto.previewImage = 'public/default/image-ptt.jpg';
           } else if (file.mimetype == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.mimetype == 'application/msword') {
             createLessonPlanDto.previewImage = 'public/default/image-word.jpg';
             createLessonPlanDto.path = `public/lesson-plan/word/${file.filename}`;
           } 
     }
     return await this.LessonPlanService.create(createLessonPlanDto, user);
   } catch (error) {
    return error
   }

  }

  @Get()
    @Roles(Role.TEACHER)
    async findAll(@Query() pageOptionDto: PageOptionsDto, @Query() query: Partial<LessonPlan>, @Req() request: Request) {
      const user = request['user'] ?? null;
      return this.LessonPlanService.findAll(pageOptionDto, query, user);
    }

  @Get(':id')
  @Roles(Role.TEACHER)

  findOne(@Param('id') id: string) {
    return this.LessonPlanService.findOne(+id);
  }

  @Put(':id')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Upload LessonPlan' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'LessonPlan upload',
    type: CreateLessonPlanDto,
  })
  @UseInterceptors(FileInterceptor('file', { storage: storage('lesson-plan', true), ...multerOptions }))
  async update(@Param('id') id: string, @Body() updateLessonPlanDto: UpdateLessonPlanDto,@UploadedFile() file: Express.Multer.File, @Req() request: Request) {
    const user = request['user'] ?? null;
    let isFile = false;
    let path=''
    try {
      if (file) {
        console.log(file);
        if (file.originalname.endsWith('.pptx') || file.originalname.endsWith('.ppt')) {
          updateLessonPlanDto.path = `public/lesson-plan/ptt/${file.filename}`;
        } else if (file.originalname.endsWith('.docx') || file.originalname.endsWith('.doc')) {
          updateLessonPlanDto.path = `public/lesson-plan/word/${file.filename}`;
        }
        console.log(path,'thiênntthannh');
        isFile = true
      }
      return await this.LessonPlanService.update(+id, updateLessonPlanDto, user, isFile);
    } catch (error) {
      return error
    }

  }

  @Delete(':id')
  @Roles(Role.TEACHER)
  remove(@Param('id') id: string, @Req() request: Request) {
    const user = request['user'] ?? null;
    return this.LessonPlanService.remove(+id, user);
  }
}
