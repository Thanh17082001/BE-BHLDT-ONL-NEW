import { TypeScoreService } from './type-score.service';
import { CreateTypeScoreDto } from './dto/create-type-score.dto';
import { UpdateTypeScoreDto } from './dto/update-type-score.dto';
import { Controller, Get, Post, Body, Put, Param, Delete, Query, UseGuards } from '@nestjs/common';

import { PageOptionsDto } from 'src/common/pagination/page-option-dto';
import { RolesGuard } from 'src/role/role.guard';
import { Roles } from 'src/role/role.decorator';
import { Role } from 'src/role/role.enum';
import { Public } from 'src/auth/auth.decorator';
import { TypeScore } from './entities/type-score.entity';

@Controller('type-score')
@Public()
export class TypeScoreController {
  constructor(private readonly typeVoiceService: TypeScoreService) { }

  @Post()
  async create(@Body() createTypeScoreDto: CreateTypeScoreDto) {
    return await this.typeVoiceService.create(createTypeScoreDto)
  }

  @Get()

  async findAll(@Query() pageOptionDto: PageOptionsDto, @Query() query: Partial<TypeScore>) {
    return this.typeVoiceService.findAll(pageOptionDto, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.typeVoiceService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateTypeScoreDto: UpdateTypeScoreDto) {
    return this.typeVoiceService.update(+id, updateTypeScoreDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.typeVoiceService.remove(+id);
  }
}

