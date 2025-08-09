import { SubjectsService } from './subjects.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import * as XLSX from 'xlsx';

import { Controller, Get, Post, Body, Put, Param, Delete, Query, Req, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { PageOptionsDto } from 'src/common/pagination/page-option-dto';
import { Subject } from './entities/subject.entity';
import { Roles } from 'src/role/role.decorator';
import { Role } from 'src/role/role.enum';
import { User } from 'src/users/entities/user.entity';
import { RolesGuard } from 'src/role/role.guard';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { File } from 'buffer';
import { GradeService } from 'src/grade/grade.service';
import { Grade } from 'src/grade/entities/grade.entity';
import { SchoolType } from 'src/schools/entities/school.entity';

@Controller('subject')
@UseGuards(RolesGuard)

export class SubjectsController {
  constructor(
    private readonly examplesService: SubjectsService,
    private readonly gradeService:GradeService
  ) { }

  @Post()
  @Roles(Role.TEACHER)
  create(@Body() createSubjectDto: CreateSubjectDto, @Req() request: Request) {
    const user: User = request['user'] ?? null;
    return this.examplesService.create(createSubjectDto, user);
  }

  @Post('import-excel')
  @Roles(Role.TEACHER)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
     @ApiBody({
        description: 'File upload',
       type: 'file',
      })
  async importExcel(@UploadedFile() file: Express.Multer.File, @Req() request: Request) {
    const user: User = request['user'] ?? null;

     const workbook = XLSX.read(file.buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
    
            // Chuyển đổi sheet thành JSON
    const subjects = XLSX.utils.sheet_to_json(worksheet);
   
    
    let result = []
    let errors = []
    
    for (let i = 0; i < subjects.length; i++){
      try {
        const subject = subjects[i];

        const grade: Grade = await this.gradeService
          .findByName(subject['Khối lớp']);

        const createSubjectDto: CreateSubjectDto = {
          name: subject['Tên môn'],
          gradeId: grade.id,
          schoolId: user.school.id
        }
        console.log(createSubjectDto);
        result.push(await this.examplesService.create(createSubjectDto, user))
      }
       catch (error) {
        errors.push(error)
      }
    
    }
    return {result, errors}
  }
  

  @Get()
  @Roles(Role.TEACHER)
  async findAll(@Query() pageOptionDto: PageOptionsDto, @Query() query: Partial<Subject>, @Req() request: Request) {
    const user = request['user'] ?? null;
    return this.examplesService.findAll(pageOptionDto, query, user);
  }

  @Get(':id')
  @Roles(Role.TEACHER)
  findOne(@Param('id') id: string) {
    return this.examplesService.findOne(+id);
  }

  @Put(':id')
  @Roles(Role.TEACHER)
  update(@Param('id') id: string, @Body() updateSubjectDto: UpdateSubjectDto) {
    return this.examplesService.update(+id, updateSubjectDto);
  }

  @Delete(':id')
  @Roles(Role.TEACHER)
  remove(@Param('id') id: string, @Req() request: Request) {
    const user = request['user'] ?? null;
    return this.examplesService.remove(+id, user);
  }
}

