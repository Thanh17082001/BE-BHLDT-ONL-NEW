import { Controller, Get, Post, Body, Put, Param, Delete, Query, Req, UseGuards } from '@nestjs/common';
import { PageOptionsDto } from 'src/common/pagination/page-option-dto';
import { Roles } from 'src/role/role.decorator';
import { Role } from 'src/role/role.enum';
import { CreateSchoolYearDto } from './dto/create-school-year.dto';
import { SchoolYear } from './entities/school-year.entity';
import { UpdateSchoolYearDto } from './dto/update-school-year.dto';
import { SchoolYearService } from './school-year.service';
import { RolesGuard } from 'src/role/role.guard';

@Controller('school-year')
@Roles(Role.TEACHER)
@UseGuards(RolesGuard)
export class SchoolYearController {
  constructor(private readonly schoolYearService: SchoolYearService) { }

  @Post()
  create(@Body() createschoolYearDto: CreateSchoolYearDto, @Req() request: Request) {
    console.log(createschoolYearDto);
    const user = request['user'] ?? null;
    return this.schoolYearService.create(createschoolYearDto, user);
  }

  @Get()
  @Roles(Role.TEACHER)
  async findAll(@Query() pageOptionDto: PageOptionsDto, @Query() query: Partial<SchoolYear>, @Req() request: Request) {
    const user = request['user'] ?? null;
    return this.schoolYearService.findAll(pageOptionDto, query, user);
  }

  @Get(':id')
  @Roles(Role.TEACHER)

  findOne(@Param('id') id: string) {
    return this.schoolYearService.findOne(+id);
  }

  @Put(':id')
  @Roles(Role.TEACHER)

  update(@Param('id') id: string, @Body() updateschoolYearDto: UpdateSchoolYearDto, @Req() request: Request) {
    const user = request['user'] ?? null;

    return this.schoolYearService.update(+id, updateschoolYearDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.schoolYearService.remove(+id);
  }
}
