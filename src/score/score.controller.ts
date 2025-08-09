import { ScoreService } from './score.service';
import { UpdateScoreDto } from './dto/update-score.dto';
import { CreateScoreDto } from './dto/create-score.dto';
import { Controller, Get, Post, Body, Put, Param, Delete, Query, Req, UseGuards } from '@nestjs/common';
import { PageOptionsDto } from 'src/common/pagination/page-option-dto';
import { Roles } from 'src/role/role.decorator';
import { Role } from 'src/role/role.enum';
import { User } from 'src/users/entities/user.entity';
import { RolesGuard } from 'src/role/role.guard';
import { Score } from './entities/score.entity';
import { StatisticalDto } from './dto/statistical-dto';

@Controller('score')
@UseGuards(RolesGuard)

export class ScoreController {
  constructor(private readonly scoreService: ScoreService) { }

  @Post()
  @Roles(Role.TEACHER)
  create(@Body() createScoreDto: CreateScoreDto, @Req() request: Request) {
    const user: User = request['user'] ?? null;
    return this.scoreService.create(createScoreDto, user);
  }

  @Get()
  @Roles(Role.TEACHER)
  async findAll(@Query() pageOptionDto: PageOptionsDto, @Query() query: Partial<Score>, @Req() request: Request) {
    const user = request['user'] ?? null;
    return this.scoreService.findAll(pageOptionDto, query, user);
  }

  @Get('statistical')
  @Roles(Role.TEACHER)

  statistical(@Query() statisticalDto: StatisticalDto) {
    return this.scoreService.statistical(statisticalDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.scoreService.findOne(+id);
  }

  @Put(':id')
  @Roles(Role.TEACHER)
  update(@Param('id') id: string, @Body() updateScoreDto: UpdateScoreDto) {
    return this.scoreService.update(+id, updateScoreDto);
  }

  @Delete(':id')
  @Roles(Role.TEACHER)
  remove(@Param('id') id: string) {
    return this.scoreService.remove(+id);
  }
}


