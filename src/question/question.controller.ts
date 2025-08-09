

import { Controller, Get, Post, Body, Put, Param, Delete, Query, Req, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { PageOptionsDto } from 'src/common/pagination/page-option-dto';
import { Roles } from 'src/role/role.decorator';
import { Role } from 'src/role/role.enum';
import { User } from 'src/users/entities/user.entity';
import { RolesGuard } from 'src/role/role.guard';
import { QuestionService } from './question.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { Question } from './entities/question.entity';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImportFileExcel } from './dto/excel-question.dto';

import * as XLSX from 'xlsx';
import { LevelService } from 'src/level/level.service';
import { PartService } from 'src/part/part.service';
import { RandomQuestionDto } from './dto/randoom-question.dto';


@Controller('Question')
@UseGuards(RolesGuard)

export class QuestionController {
  constructor(private readonly QuestionService: QuestionService,
    private readonly levelService: LevelService,
    private readonly partService: PartService,

  ) { }

  @Post()
  @Roles(Role.TEACHER)
  create(@Body() createQuestionDto: CreateQuestionDto, @Req() request: Request) {
    const user: User = request['user'] ?? null;
    return this.QuestionService.create(createQuestionDto, user);
  }

  @Post('import-excel')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @Roles(Role.TEACHER)
  async importExcel(@UploadedFile() file: Express.Multer.File, @Body() importFileExcel: ImportFileExcel, @Req() request: Request) {
    const user: User = request['user'] ?? null;
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    const keyData: string[] = Object.keys(data[0])
    const questions: Question[] = []
    const array = []
    console.log(data);
    let errors: Array<{ row: number, error: string }> = [];
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      try {
        const level = await this.levelService.findByName(item[keyData[2]]);
        const part = await this.partService.findByName(item['Phần']);
        const answerCorrect = Array.from(item['Đáp án đúng'].split(','));
        const createQuestionDto: CreateQuestionDto = {
          content: item[keyData[1]],
          subjectId: +importFileExcel.subjectId,
          partId: part.id,
          topicId: +importFileExcel.topicId || null,
          typeQuestionId: +importFileExcel.typeQuestionId,
          numberOfAnswers: item['Phần'] === 'III' ? 1 : 4,
          levelId: level.id,
          score: +0.25,
          answers: [{
            content: item['A'] ?? '',
            isCorrect: answerCorrect.includes('A'),
            questionId: 0
          }, {
            content: item['B'] ?? '',
            isCorrect: answerCorrect.includes('B'),
            questionId: 0
          }, {
            content: item['C'] ?? '',
            isCorrect: answerCorrect.includes('C'),
            questionId: 0
          }, {
            content: item['D'] ?? '',
            isCorrect: answerCorrect.includes('D'),
            questionId: 0
          },]
        };

        const result = await this.QuestionService.create(createQuestionDto, user);

        questions.push(result)
      } catch (error) {
        errors.push({ row: i + 1, error: error.message });
      }
    }
    return { questions, errors }
  }

  @Get()
  @Roles(Role.TEACHER)
  async findAll(@Query() pageOptionDto: PageOptionsDto, @Query() query: Partial<Question>, @Req() request: Request) {
    const user = request['user'] ?? null;
    return this.QuestionService.findAll(pageOptionDto, query, user);
  }

  @Post('/random')
  @Roles(Role.TEACHER)

  getRandomItems(@Body() randomqestTionDto: RandomQuestionDto): Promise<Array<Question>> {
    return this.QuestionService.getRandomItems(randomqestTionDto);
  }


  @Get(':id')
  @Roles(Role.TEACHER)

  findOne(@Param('id') id: string) {
    return this.QuestionService.findOne(+id);
  }

  @Put(':id')
  @Roles(Role.TEACHER)
  update(@Param('id') id: string, @Body() updateQuestionDto: UpdateQuestionDto) {
    return this.QuestionService.update(+id, updateQuestionDto);
  }

  @Delete(':id')
  @Roles(Role.TEACHER)
  remove(@Param('id') id: string, @Req() request: Request) {
    const user = request['user'] ?? null;
    return this.QuestionService.remove(+id, user);
  }
}


