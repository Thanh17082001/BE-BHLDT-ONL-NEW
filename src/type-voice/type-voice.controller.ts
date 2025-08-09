import { TypeVoiceService } from './type-voice.service';
import { CreateTypeVoiceDto } from './dto/create-type-voice.dto';
import { UpdateTypeVoiceDto } from './dto/update-type-voice.dto';
import { Controller, Get, Post, Body, Put, Param, Delete, Query, UseGuards } from '@nestjs/common';

import { PageOptionsDto } from 'src/common/pagination/page-option-dto';
import { RolesGuard } from 'src/role/role.guard';
import { Roles } from 'src/role/role.decorator';
import { Role } from 'src/role/role.enum';
import { TypeVoice } from './entities/type-voice.entity';
import { Public } from 'src/auth/auth.decorator';

@Controller('type-voice')
@Public()
export class TypeVoiceController {
  constructor(private readonly typeVoiceService: TypeVoiceService) { }

  @Post()
  async create(@Body() createTypeVoice: CreateTypeVoiceDto) {
    return await this.typeVoiceService.create(createTypeVoice)
  }

  @Get()

  async findAll(@Query() pageOptionDto: PageOptionsDto, @Query() query: Partial<TypeVoice>) {
    return this.typeVoiceService.findAll(pageOptionDto, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.typeVoiceService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateTypeVoiceDto: UpdateTypeVoiceDto) {
    return this.typeVoiceService.update(+id, updateTypeVoiceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.typeVoiceService.remove(+id);
  }
}

