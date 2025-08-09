import { AnswerService } from './answer.service';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { UpdateAnswerDto } from './dto/update-answer.dto';

import { Controller, Get, Post, Body, Put, Param, Delete, Query, Req, UseGuards } from '@nestjs/common';
import { PageOptionsDto } from 'src/common/pagination/page-option-dto';
import { Roles } from 'src/role/role.decorator';
import { Role } from 'src/role/role.enum';
import { User } from 'src/users/entities/user.entity';
import { RolesGuard } from 'src/role/role.guard';
import { Answer } from './entities/answer.entity';

@Controller('Answer')
@UseGuards(RolesGuard)

export class AnswerController {
  constructor(private readonly answerService: AnswerService) { }

  @Post()
  @Roles(Role.TEACHER)
  create(@Body() createAnswerDto: CreateAnswerDto, @Req() request: Request) {
    const user: User = request['user'] ?? null;
    return this.answerService.create(createAnswerDto, user);
  }

  @Get()
  @Roles(Role.TEACHER)
  async findAll(@Query() pageOptionDto: PageOptionsDto, @Query() query: Partial<Answer>, @Req() request: Request) {
    const user = request['user'] ?? null;
    return this.answerService.findAll(pageOptionDto, query, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.answerService.findOne(+id);
  }

  @Put(':id')
  @Roles(Role.TEACHER)
  update(@Param('id') id: string, @Body() updateAnswerDto: UpdateAnswerDto) {
    return this.answerService.update(+id, updateAnswerDto);
  }

  @Delete(':id')
  @Roles(Role.TEACHER)
  remove(@Param('id') id: string, @Req() request: Request) {
    const user = request['user'] ?? null;
    return this.answerService.remove(+id, user);
  }
}


