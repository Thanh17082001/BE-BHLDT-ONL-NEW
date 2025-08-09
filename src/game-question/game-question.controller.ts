
import { Controller, Get, Post, Body, Put, Param, Delete, Query, UseGuards, Req, Patch } from '@nestjs/common';

import { PageOptionsDto } from 'src/common/pagination/page-option-dto';
import { RolesGuard } from 'src/role/role.guard';
import { Roles } from 'src/role/role.decorator';
import { Role } from 'src/role/role.enum';
import { Public } from 'src/auth/auth.decorator';
import { GameQuestionService } from './game-question.service';
import { CreateGameQuestionDto } from './dto/create-game-question.dto';
import { UpdateGameQuestionDto } from './dto/update-game-question.dto';
import { GameQuestion } from './entities/game-question.entity';
@Controller('game-question')
@UseGuards(RolesGuard)

export class GameQuestionController {
  constructor(private readonly gameQuestionService: GameQuestionService) { }

  @Post()
  @Roles(Role.TEACHER)
  async create(@Body() createGameQuestionDto: CreateGameQuestionDto,  @Req() request: Request) {
    const user = request['user'] ?? null;

    return await this.gameQuestionService.create(createGameQuestionDto, user)
  }

  @Get()
  @Roles(Role.TEACHER)
  async findAll(@Query() pageOptionDto: PageOptionsDto, @Query() query: Partial<GameQuestion>, @Req() request: Request) {
    const user = request['user'] ?? null;

    return this.gameQuestionService.findAll(pageOptionDto, query, user);
  }

  @Get(':id')
  @Roles(Role.TEACHER)
  findOne(@Param('id') id: string) {
    return this.gameQuestionService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Role.TEACHER)
  update(@Param('id') id: string, @Body() updateGameDto: UpdateGameQuestionDto) {
    return this.gameQuestionService.update(+id, updateGameDto);
  }

  @Delete(':id')
  @Roles(Role.TEACHER)
  remove(@Param('id') id: string) {
    return this.gameQuestionService.remove(+id);
  }
}

