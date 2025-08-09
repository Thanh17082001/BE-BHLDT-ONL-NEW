import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';


import { Controller, Get, Post, Body, Put, Param, Delete, Query, Req, UseGuards } from '@nestjs/common';
import { PageOptionsDto } from 'src/common/pagination/page-option-dto';
import { Roles } from 'src/role/role.decorator';
import { Role } from 'src/role/role.enum';
import { User } from 'src/users/entities/user.entity';
import { RolesGuard } from 'src/role/role.guard';
import { ClassService } from './class.service';
import { Class } from './entities/class.entity';

@Controller('class')
@UseGuards(RolesGuard)

export class ClassController {
  constructor(private readonly examplesService: ClassService) { }

  @Post()
  @Roles(Role.TEACHER)
  create(@Body() createClassDto: CreateClassDto, @Req() request: Request) {
    const user: User = request['user'] ?? null;
    return this.examplesService.create(createClassDto, user);
  }

  @Get()
  @Roles(Role.TEACHER)
  async findAll(@Query() pageOptionDto: PageOptionsDto, @Query() query: Partial<Class>, @Req() request: Request) {
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
  update(@Param('id') id: string, @Body() updateClassDto: UpdateClassDto) {
    return this.examplesService.update(+id, updateClassDto);
  }

  @Delete(':id')
  @Roles(Role.TEACHER)
  remove(@Param('id') id: string) {
    return this.examplesService.remove(+id);
  }
}

