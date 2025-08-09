import { ElearningService } from './elearning.service';
import { CreateElearningDto } from './dto/create-elearning.dto';
import { UpdateElearningDto } from './dto/update-elearning.dto';

import { Controller, Get, Post, Body, Put, Param, Delete, Query, Req, UseGuards } from '@nestjs/common';
import { PageOptionsDto } from 'src/common/pagination/page-option-dto';
import { Roles } from 'src/role/role.decorator';
import { Role } from 'src/role/role.enum';
import { User } from 'src/users/entities/user.entity';
import { RolesGuard } from 'src/role/role.guard';
import { Elearning } from './entities/elearning.entity';
import { Public } from 'src/auth/auth.decorator';

@Controller('elearning')
@UseGuards(RolesGuard)
  @Public()

export class ElearningController {
  constructor(private readonly ElearningService: ElearningService) { }

  @Post()
  // @Roles(Role.TEACHER)
  create(@Body() createElearningDto: CreateElearningDto, @Req() request: Request) {
    const user: User = request['user'] ?? null;
    return this.ElearningService.create(createElearningDto, user);
  }

  @Get()
  // @Roles(Role.TEACHER)
  async findAll(@Query() pageOptionDto: PageOptionsDto, @Query() query: Partial<Elearning>, @Req() request: Request) {
    const user = request['user'] ?? null;
    return this.ElearningService.findAll(pageOptionDto, query, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ElearningService.findOne(+id);
  }

  @Put(':id')
  // @Roles(Role.TEACHER)
  update(@Param('id') id: string, @Body() updateElearningDto: UpdateElearningDto) {
    return this.ElearningService.update(+id, updateElearningDto);
  }

  @Delete(':id')
  // @Roles(Role.TEACHER)
  remove(@Param('id') id: string, @Req() request: Request) {
    const user = request['user'] ?? null;
    return this.ElearningService.remove(+id, user);
  }
}



