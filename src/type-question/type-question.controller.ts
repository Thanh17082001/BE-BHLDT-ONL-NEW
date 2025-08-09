import { TypeQuestionService } from './type-question.service';
import { CreateTypeQuestionDto } from './dto/create-type-question.dto';
import { UpdateTypeQuestionDto } from './dto/update-type-question.dto';
import { Controller, Get, Post, Body, Put, Param, Delete, Query, UseGuards } from '@nestjs/common';

import { PageOptionsDto } from 'src/common/pagination/page-option-dto';
import { RolesGuard } from 'src/role/role.guard';
import { Roles } from 'src/role/role.decorator';
import { Role } from 'src/role/role.enum';
import { Public } from 'src/auth/auth.decorator';
import { TypeQuestion } from './entities/type-question.entity';

@Controller('type-question')
@Public()
export class TypeQuestionController {
  constructor(private readonly TypeQuestionService: TypeQuestionService) { }

  @Post()
  async create(@Body() createTypeQuestion: CreateTypeQuestionDto) {
    return await this.TypeQuestionService.create(createTypeQuestion)
  }

  @Get()

  async findAll(@Query() pageOptionDto: PageOptionsDto, @Query() query: Partial<TypeQuestion>) {
    return this.TypeQuestionService.findAll(pageOptionDto, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.TypeQuestionService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateTypeQuestionDto: UpdateTypeQuestionDto) {
    return this.TypeQuestionService.update(+id, updateTypeQuestionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.TypeQuestionService.remove(+id);
  }
}


