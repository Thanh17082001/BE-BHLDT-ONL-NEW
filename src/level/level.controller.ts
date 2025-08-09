import { LevelService } from './level.service';
import { CreateLevelDto } from './dto/create-level.dto';
import { UpdateLevelDto } from './dto/update-level.dto';


import { Controller, Get, Post, Body, Put, Param, Delete, Query, UseGuards } from '@nestjs/common';

import { PageOptionsDto } from 'src/common/pagination/page-option-dto';
import { RolesGuard } from 'src/role/role.guard';
import { Roles } from 'src/role/role.decorator';
import { Role } from 'src/role/role.enum';
import { Public } from 'src/auth/auth.decorator';
import { Level } from './entities/level.entity';

@Controller('level')
@Public()
export class LevelController {
  constructor(private readonly LevelService: LevelService) { }

  @Post()
  async create(@Body() createLevel: CreateLevelDto) {
    return await this.LevelService.create(createLevel)
  }

  @Get()

  async findAll(@Query() pageOptionDto: PageOptionsDto, @Query() query: Partial<Level>) {
    return this.LevelService.findAll(pageOptionDto, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.LevelService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateLevelDto: UpdateLevelDto) {
    return this.LevelService.update(+id, updateLevelDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.LevelService.remove(+id);
  }
}


