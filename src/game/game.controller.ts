
import { Controller, Get, Post, Body, Put, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';

import { PageOptionsDto } from 'src/common/pagination/page-option-dto';
import { RolesGuard } from 'src/role/role.guard';
import { Roles } from 'src/role/role.decorator';
import { Role } from 'src/role/role.enum';
import { Public } from 'src/auth/auth.decorator';
import { CreateGameDto } from './dto/create-game.dto';
import { GameService } from './game.service';
import { UpdateGameDto } from './dto/update-game.dto';
import { Game } from './entities/game.entity';
import { AddQuestionToGameDto } from './dto/add-question.dto';

@Controller('game')
@UseGuards(RolesGuard)

export class GameController {
  constructor(private readonly gameService: GameService) { }

  @Post()
     @Roles(Role.TEACHER)
  async create(@Body() createGameDto: CreateGameDto, @Req() request: Request) {
    const user = request['user'] ?? null;
    return await this.gameService.create(createGameDto, user)
  }
  @Post('add-question')
  @Roles(Role.TEACHER)

  async AddQuestionToGame(@Body() addQuestionToGameDto: AddQuestionToGameDto, @Req() request: Request): Promise<Game> {
    try {
      const user = request['user'] ?? null;
      return await this.gameService.addQuestionToGame(addQuestionToGameDto, user);
    } catch (error) {
      console.log(error, 'tjajaajoaisdfkoasldkasda');
    }
  }


  @Get()
 @Roles(Role.TEACHER)
  async findAll(@Query() pageOptionDto: PageOptionsDto, @Query() query: Partial<Game>, @Req() request: Request) {
    const user = request['user'] ?? null;

    return this.gameService.findAll(pageOptionDto, query, user);
  }

  @Get(':id')
  @Roles(Role.TEACHER)
  findOne(@Param('id') id: string) {
    return this.gameService.findOne(+id);
  }

  @Put(':id')
  @Roles(Role.TEACHER)
  update(@Param('id') id: string, @Body() updateGameDto: UpdateGameDto) {
    return this.gameService.update(+id, updateGameDto);
  }

  @Delete(':id')
  @Roles(Role.TEACHER)
  remove(@Param('id') id: string) {
    return this.gameService.remove(+id);
  }
}

