import { FileTypeService } from './file-type.service';
import { CreateFileTypeDto } from './dto/create-file-type.dto';
import { UpdateFileTypeDto } from './dto/update-file-type.dto';

import { Controller, Get, Post, Body, Put, Param, Delete, Query, UseGuards } from '@nestjs/common';

import { PageOptionsDto } from 'src/common/pagination/page-option-dto';
import { RolesGuard } from 'src/role/role.guard';
import { Roles } from 'src/role/role.decorator';
import { Role } from 'src/role/role.enum';
import { FileType } from './entities/file-type.entity';

@Controller('file-type')
@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
export class FileTypeController {
  constructor(private readonly fileTypeService: FileTypeService) { }

  @Post()
  async create() {
    let createFileTypeDto: CreateFileTypeDto = new CreateFileTypeDto();
    let result = []
    const names: string[] =['Tranh ảnh', 'Video','Sách tham khảo'];
    for (let i = 0; i < names.length; i++) {
      createFileTypeDto.name = names[i];
      result.push(await this.fileTypeService.create(createFileTypeDto));
    }
    return result
  }

  @Get()
  @Roles(Role.TEACHER)
  async findAll(@Query() pageOptionDto: PageOptionsDto, @Query() query: Partial<FileType>) {
    return this.fileTypeService.findAll(pageOptionDto, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fileTypeService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateFileTypeDto: UpdateFileTypeDto) {
    return this.fileTypeService.update(+id, updateFileTypeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fileTypeService.remove(+id);
  }
}
