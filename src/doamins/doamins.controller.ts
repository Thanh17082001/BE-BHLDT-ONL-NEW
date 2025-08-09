import { DoaminsService } from './doamins.service';
import { CreateDoaminDto } from './dto/create-doamin.dto';
import { UpdateDoaminDto } from './dto/update-doamin.dto';



import { Controller, Get, Post, Body, Put, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';

import { PageOptionsDto } from 'src/common/pagination/page-option-dto';
import { RolesGuard } from 'src/role/role.guard';
import { Roles } from 'src/role/role.decorator';
import { Role } from 'src/role/role.enum';
import { User } from 'src/users/entities/user.entity';
import { Public } from 'src/auth/auth.decorator';

@Controller('domain')
@UseGuards(RolesGuard)
export class DoaminsController {
  constructor(private readonly doamainService: DoaminsService) { }

  @Post()
  @Public()
  async create(@Body() createDoaminDto: CreateDoaminDto, @Req() req) {
    const user: User = req.user || null;
    return this.doamainService.create(createDoaminDto, user);

  }

  @Get()
  @Roles(Role.ADMIN)

  async findAll() {
    return this.doamainService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN)

  findOne(@Param('id') id: string) {
    return this.doamainService.findOne(+id);
  }

  @Put(':id')
  @Roles(Role.ADMIN)

  update(@Param('id') id: string, @Body() updateGradeDto: UpdateDoaminDto) {
    return this.doamainService.update(+id, updateGradeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.doamainService.remove(+id);
  }
}

