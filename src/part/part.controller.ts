import { PartService } from './part.service';
import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';

import { Controller, Get, Post, Body, Put, Param, Delete, Query, UseGuards } from '@nestjs/common';

import { PageOptionsDto } from 'src/common/pagination/page-option-dto';
import { RolesGuard } from 'src/role/role.guard';
import { Roles } from 'src/role/role.decorator';
import { Role } from 'src/role/role.enum';
import { Part } from './entities/part.entity';
import { Public } from 'src/auth/auth.decorator';

@Controller('part')
// @UseGuards(RolesGuard)
  // @Roles(Role.ADMIN)
  @Public()
export class PartController {
  constructor(private readonly partService: PartService) { }

  @Post()
  async create() {
    let createPartDto: CreatePartDto = new CreatePartDto();
    let result = []
    const names: string[] = ['Phần I', 'Phần II', 'Phần III'];
    for (let i = 0; i < names.length; i++) {
      createPartDto.name = names[i];
      createPartDto.order = i+1;
      result.push(await this.partService.create(createPartDto));
    }
    return result
  }

  @Get()

  async findAll(@Query() pageOptionDto: PageOptionsDto, @Query() query: Partial<Part>) {
    return this.partService.findAll(pageOptionDto, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.partService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updatePartDto: UpdatePartDto) {
    return this.partService.update(+id, updatePartDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.partService.remove(+id);
  }
}
