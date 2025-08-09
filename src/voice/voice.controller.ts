import { VoiceService } from './voice.service';
import { CreateVoiceDto } from './dto/create-voice.dto';
import { UpdateVoiceDto } from './dto/update-voice.dto';

import { Controller, Get, Post, Body, Put, Param, Delete, Query, Req, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { PageOptionsDto } from 'src/common/pagination/page-option-dto';
import { Voice } from './entities/voice.entity';
import { Roles } from 'src/role/role.decorator';
import { Role } from 'src/role/role.enum';
import { User } from 'src/users/entities/user.entity';
import { RolesGuard } from 'src/role/role.guard';
import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions, storage } from 'src/config/multer';

@Controller('voice')
@UseGuards(RolesGuard)
export class VoiceController {
  constructor(private readonly examplesService: VoiceService) { }

  @Post()
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Upload file' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
      description: 'File upload',
      type: CreateVoiceDto,
    })
    @UseInterceptors(FileInterceptor('file', { storage: storage('voice', false), ...multerOptions }))
  create(@UploadedFile() file: Express.Multer.File, @Body() createVoiceDto: CreateVoiceDto, @Req() request: Request) {
    const user: User = request['user'] ?? null;
    if (file) {
      const link = `public/voice/${file.filename}`
      const name: string = file.originalname;
      const data: CreateVoiceDto = {
        fileId: +createVoiceDto.fileId,
        order: +createVoiceDto.order,
        isGeneral: (/true/).test(createVoiceDto.isGeneral.toString()),
        typeVoiceId: +createVoiceDto.typeVoiceId,
        link: link,
        name: name
      }
      return this.examplesService.create(data, user);
    }
  }

  @Get()
  @Roles(Role.TEACHER)
  async findAll(@Query() pageOptionDto: PageOptionsDto, @Query() query: Partial<Voice>, @Req() request: Request) {
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
  @ApiOperation({ summary: 'Upload file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File upload',
    type: UpdateVoiceDto,
  })
  @UseInterceptors(FileInterceptor('file', { storage: storage('voice', false), ...multerOptions }))
  update(@UploadedFile() file: Express.Multer.File, @Param('id') id: string, @Body() updateVoiceDto: UpdateVoiceDto, @Req() request: Request) {
    const user: User = request['user'] ?? null;
    let link = updateVoiceDto.link;
    let isFile = false;
    let name: string = updateVoiceDto.name;

    if (file) {
      name = file.originalname;

      link = `public/voice/${file.filename}`
      isFile = true;
    }
    const data: CreateVoiceDto = {
      fileId: +updateVoiceDto.fileId,
      order: +updateVoiceDto.order,
      isGeneral: (/true/).test(updateVoiceDto.isGeneral.toString()),
      typeVoiceId: +updateVoiceDto.typeVoiceId,
      link: link,
      name: name || updateVoiceDto.name
    }

    return this.examplesService.update(+id, data, user, isFile);
  }

  @Delete(':id')
  @Roles(Role.TEACHER)
  remove(@Param('id') id: string, @Req() request: Request) {
    const user = request['user'] ?? null;
    return this.examplesService.remove(+id, user);
  }
}


