import { ExamService } from './exam.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { Controller, Get, Post, Body, Put, Param, Delete, Query, Req, UseGuards } from '@nestjs/common';
import { PageOptionsDto } from 'src/common/pagination/page-option-dto';
import { Roles } from 'src/role/role.decorator';
import { Role } from 'src/role/role.enum';
import { User } from 'src/users/entities/user.entity';
import { RolesGuard } from 'src/role/role.guard';
import { Exam } from './entities/exam.entity';

@Controller('exam')
@UseGuards(RolesGuard)

export class ExamController {
  constructor(private readonly ExamService: ExamService) { }

  @Post()
  @Roles(Role.TEACHER)
  create(@Body() createExamDto: CreateExamDto, @Req() request: Request) {
    const user: User = request['user'] ?? null;
    return this.ExamService.create(createExamDto, user);
  }

  @Get()
  @Roles(Role.TEACHER)
  async findAll(@Query() pageOptionDto: PageOptionsDto, @Query() query: Partial<Exam>, @Req() request: Request) {
    const user = request['user'] ?? null;
    return this.ExamService.findAll(pageOptionDto, query, user);
  }

  @Get(':id')
  @Roles(Role.TEACHER)
  findOne(@Param('id') id: string) {
    return this.ExamService.findOne(+id);
  }

  @Put(':id')
  @Roles(Role.TEACHER)
  update(@Param('id') id: string, @Body() updateExamDto: UpdateExamDto,  @Req() request: Request) {
    const user = request['user'] ?? null;
    return this.ExamService.update(+id, updateExamDto, user);
  }

  @Delete(':id')
  @Roles(Role.TEACHER)
  remove(@Param('id') id: string, @Req() request: Request) {
    const user = request['user'] ?? null;
    return this.ExamService.remove(+id, user);
  }
}



