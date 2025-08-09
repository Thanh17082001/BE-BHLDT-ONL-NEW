import { SchoolsService } from './schools.service';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { Controller, Get, Post, Body, Param, Delete, Query, Req, UseGuards, Put } from '@nestjs/common';
import { PageOptionsDto } from 'src/common/pagination/page-option-dto';
import { School } from './entities/school.entity';
import { User } from 'src/users/entities/user.entity';
import { Roles } from 'src/role/role.decorator';
import { Role } from 'src/role/role.enum';
import { RolesGuard } from 'src/role/role.guard';
import { Public } from 'src/auth/auth.decorator';

@Controller('school')
@UseGuards(RolesGuard)

export class SchoolsController {
  constructor(private readonly schoolsService: SchoolsService) { }

  @Post()
  @Public()
  create(@Body() createSchoolDto: CreateSchoolDto, @Req() request: Request) {
    const user: User = request['user'] ?? null;
    return this.schoolsService.create(createSchoolDto, user);
  }

  @Get()
  @Roles(Role.TEACHER)
  async findAll(@Query() pageOptionDto: PageOptionsDto, @Query() query: Partial<School>, @Req() request: Request) {
    const user: User = request['user'] ?? null;

    return this.schoolsService.findAll(pageOptionDto, query, user);
  }

  @Get('type')
  @Roles(Role.TEACHER)
  async findAllTYpe(@Query() pageOptionDto: PageOptionsDto, @Query() query: Partial<School>, @Req() request: Request) {
    const user: User = request['user'] ?? null;

    return this.schoolsService.findAlltype();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.schoolsService.findOne(+id);
  }

  @Put(':id')
  @Roles(Role.TEACHER)
  update(@Param('id') id: string, @Body() updateSchoolDto: UpdateSchoolDto) {
    return this.schoolsService.update(+id, updateSchoolDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.schoolsService.remove(+id);
  }
}
