import { GradeService } from './grade.service';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';

import { Controller, Get, Post, Body, Put, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';

import { PageOptionsDto } from 'src/common/pagination/page-option-dto';
import { Grade } from './entities/grade.entity';
import { RolesGuard } from 'src/role/role.guard';
import { Roles } from 'src/role/role.decorator';
import { Role } from 'src/role/role.enum';
import { SchoolType } from 'src/schools/entities/school.entity';
import { Public } from 'src/auth/auth.decorator';

@Controller('grade')
@UseGuards(RolesGuard)
export class GradeController {
  constructor(private readonly gradeService: GradeService) { }

  @Post()
    @Roles(Role.ADMIN)
  @Public()
  async create() {
    let createGradeDto: CreateGradeDto = new CreateGradeDto();
    let result = []
    const typeSchool = SchoolType
    const names: string[] = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
    for (let i = 0; i < names.length; i++) {
      createGradeDto.name = names[i];
      result.push(await this.gradeService.create(createGradeDto));
    }
    return result
  }

  @Get()
  @Roles(Role.TEACHER)

  async findAll(@Query() pageOptionDto: PageOptionsDto, @Query() query: Partial<Grade>, @Req() request: Request) {
    const user = request['user'] ?? null;
    return this.gradeService.findAll(pageOptionDto, query, user);
  }

  @Get(':id')
  @Roles(Role.TEACHER)

  findOne(@Param('id') id: string) {
    return this.gradeService.findOne(+id);
  }

  @Put(':id')
  @Roles(Role.ADMIN)

  update(@Param('id') id: string, @Body() updateGradeDto: UpdateGradeDto) {
    return this.gradeService.update(+id, updateGradeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.gradeService.remove(+id);
  }
}
