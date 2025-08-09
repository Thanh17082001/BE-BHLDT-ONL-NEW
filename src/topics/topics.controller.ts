import { TopicsService } from './topics.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import * as XLSX from 'xlsx';
import { Controller, Get, Post, Body, Put, Param, Delete, Query, Req, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { PageOptionsDto } from 'src/common/pagination/page-option-dto';
import { Roles } from 'src/role/role.decorator';
import { Role } from 'src/role/role.enum';
import { Topic } from './entities/topic.entity';
import { RolesGuard } from 'src/role/role.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { User } from 'src/users/entities/user.entity';
import { SchoolType } from 'src/schools/entities/school.entity';
import { Subject } from 'src/subjects/entities/subject.entity';
import { SubjectsService } from 'src/subjects/subjects.service';

@Controller('topic')
@UseGuards(RolesGuard)
export class TopicsController {
  constructor(
    private readonly topicsService: TopicsService,
    private readonly subjectService: SubjectsService
  ) { }

  @Post()
  @Roles(Role.TEACHER)
  create(@Body() createTopicDto: CreateTopicDto, @Req() request: Request) {
    const user = request['user'] ?? null;

    return this.topicsService.create(createTopicDto, user);
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
    const topics = XLSX.utils.sheet_to_json(worksheet);
    console.log(topics);


    let result = []
    let errors = []

    for (let i = 0; i < topics.length; i++) {
      const topic: any = topics[i];
      const subjects = topic['Tên môn']?.split(',');
      for (let j = 0; j < subjects.length; j++) {
        try {
          const subject: Subject = await this.subjectService
            .findByName(subjects[j].trim());
          const createTopicDto: CreateTopicDto = {
            name: `${topic['Tên chủ đề'].trim()} lớp ${subject.grade.name.trim() }`,
            subjectId: subject.id,
            schoolId: user.school.id
          }
          console.log('thanh');
          result.push(await this.topicsService.create(createTopicDto, user))
        } catch (error) {
          errors.push(error)
        }
      }

    }
    return { result, errors }
 
  }

  @Get()
  @Roles(Role.TEACHER)
  async findAll(@Query() pageOptionDto: PageOptionsDto, @Query() query: Partial<Topic>, @Req() request: Request) {
    const user = request['user'] ?? null;
    return this.topicsService.findAll(pageOptionDto, query, user);
  }

  @Get(':id')
  @Roles(Role.TEACHER)

  findOne(@Param('id') id: string) {
    return this.topicsService.findOne(+id);
  }

  @Put(':id')
  @Roles(Role.TEACHER)
  update(@Param('id') id: string, @Body() updateTopicDto: UpdateTopicDto, @Req() request: Request) {
    const user = request['user'] ?? null;

    return this.topicsService.update(+id, updateTopicDto, user);
  }

  @Delete(':id')
  @Roles(Role.TEACHER)
  remove(@Param('id') id: string, @Req() request: Request) {
    const user = request['user'] ?? null;

    return this.topicsService.remove(+id, user);
  }
}
