import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateGameDto } from './dto/update-game.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Game } from './entities/game.entity';
import { Brackets, Not, Repository } from 'typeorm';

import { ItemDto, PageDto } from 'src/common/pagination/page.dto';
import { PageMetaDto } from 'src/common/pagination/page.metadata.dto';

import { GameQuestion } from 'src/game-question/entities/game-question.entity';
import { AddQuestionToGameDto } from './dto/add-question.dto';
import { CreateGameDto } from './dto/create-game.dto';
import { PageOptionsDto } from 'src/common/pagination/page-option-dto';
import { School } from 'src/schools/entities/school.entity';
import { User } from 'src/users/entities/user.entity';
import { schoolTypes } from 'src/common/constant/type-school-query';
import { Role } from 'src/role/role.enum';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Game) private repo: Repository<Game>,
    @InjectRepository(GameQuestion)
    private questionRepository: Repository<GameQuestion>,
        @InjectRepository(School) private repoSchool: Repository<School>,
    
  ) {
  }
  async create(createGameDto: CreateGameDto, user:User): Promise<Game> {
    const exits = await this.repo.findOne({
      where: {
        name: createGameDto.name,
      }
    })

    const school = await this.repoSchool.findOne({
      where: { id: user.school.id ?? -1 },
    });

    return await this.repo.save({ ...createGameDto, school, createdBy: user });
  }

  async addQuestionToGame(addQuestionToGame: AddQuestionToGameDto,user:User): Promise<Game> {
    try {

      const school = await this.repoSchool.findOne({
        where: { id: user.school.id ?? -1 },
      });
      // Tìm game theo id
      const game = await this.repo.findOne({
        where: { id: +addQuestionToGame.gameId },
        relations: ['questions', 'school', 'createdBy'],
      });
      if (!game) {
        throw new NotFoundException('Game not found');
      }

      if (!game?.questions) {
        game.questions = [];
      }


      // thêm câu có sẵn vào
      if (addQuestionToGame.gameQuestionIds?.length > 0) {
        game.questions = [];
        for (let i = 0; i < addQuestionToGame?.gameQuestionIds?.length; i++) {
          const idQuestion = addQuestionToGame.gameQuestionIds[i];
          const question: GameQuestion = await this.questionRepository.findOne({
            where: { id: +idQuestion },
            relations: ['school', 'createdBy'],
          });

          game.questions.push(question);

        }

      }
      // Thêm mới câu hỏi và push vào mảng trong game
      else {
        const question: GameQuestion = await this.questionRepository.save({
          suggest: addQuestionToGame.gameQuestion.suggest,
          answer: addQuestionToGame.gameQuestion.answer,
          school,
          createdBy: user,
        })



        const checkQuestionExist = game.questions.some((item) => item.id === question.id)
        if (checkQuestionExist) {
          throw new BadRequestException('Question already exists');
        }
        game.questions.push(question)

      }
      const result = await this.repo.save(game);

      return result
    } catch (error) {
      console.log(error, 'lôiiiiiiiiii');
    }
  }


  async findAll(pageOptions: PageOptionsDto, query: Partial<Game>, user:User): Promise<PageDto<Game>> {
    const queryBuilder = this.repo.createQueryBuilder('game').leftJoinAndSelect('game.questions', 'gameQuestion').leftJoinAndSelect('game.school', 'school').leftJoinAndSelect('game.createdBy', 'createdBy').leftJoinAndSelect('gameQuestion.school', 'schoolQuestion').leftJoinAndSelect('gameQuestion.createdBy', 'createdByQuestion');
    const { page, take, skip, order, search } = pageOptions;
    const pagination: string[] = ['page', 'take', 'skip', 'order', 'search'];
     const schoolTypesQuery = schoolTypes(user);
    // 🎯 Lọc theo điều kiện tìm kiếm (bỏ qua các tham số phân trang)
    if (!!query && Object.keys(query).length > 0) {
      Object.keys(query).forEach((key) => {
        if (key !== undefined && key !== null && !pagination.includes(key)) {
          queryBuilder.andWhere(`file.${key} = :${key}`, { [key]: query[key] });
        }
      });
    }

    if (user.role === Role.TEACHER) {
          queryBuilder.andWhere(
            new Brackets((qb) => {
              qb.where('game.created_by = :userId')
            }),
          );
          queryBuilder.andWhere(
            new Brackets((qb) => {
              qb.where('school.id = :schoolId');
            }),
          );
          queryBuilder.setParameters({
            userId: user.id,
            schoolId: user.school.id,
          });
        } else if (user.role === Role.PRINCIPAL) {
          queryBuilder.andWhere(
            new Brackets((qb) => {
              qb.where('school.id = :schoolId')
            }),
          );
          queryBuilder.setParameter('schoolId', user.school.id);
        } else if (user.role === Role.ADMIN) {
          const schoolTypesQuery = schoolTypes(user); // Hàm trả về danh sách schoolType mà admin được quản lý
          if (schoolTypesQuery.length > 0) {
            queryBuilder.andWhere(
              new Brackets((qb) => {
                qb.where('school.schoolType IN (:...schoolTypes)', {
                  schoolTypes: schoolTypesQuery,
                });
              }),
            );
          }
        }

    // 🎯 Tìm kiếm theo tên môn học (bỏ dấu)
    if (search) {
      queryBuilder.andWhere(
        `LOWER(unaccent("subject".name)) ILIKE LOWER(unaccent(:search))`,
        {
          search: `%${search}%`,
        },
      );
    }

    queryBuilder.orderBy("game.createdAt", pageOptions.order)
      .skip(pageOptions.skip)
      .take(pageOptions.take);

    const itemCount = await queryBuilder.getCount();
    const pageMetaDto = new PageMetaDto({ pageOptionsDto: pageOptions, itemCount });
    const entities = await queryBuilder.getMany();

    return new PageDto(entities, pageMetaDto);

  }


  async findOne(id: number): Promise<ItemDto<Game>> {
    return new ItemDto(await this.repo.findOne({
      where: {
        id: id
      },
      relations: ['questions']
    }))
  }

  async update(id: number, updateTypeScore: Partial<UpdateGameDto>): Promise<Game> {
    const typeQuestion: Game = await this.repo.findOne({
      where: {
        id: id
      }
    });
    const exits = await this.repo.findOne({
      where: {
        name: updateTypeScore.name,
        id: Not(id),
      }
    })
    if (exits) {
      throw new BadRequestException('game  is already!')
    }
    if (!typeQuestion) {
      throw new NotFoundException('game does not exits!');
    }
    const data = this.repo.merge(
      typeQuestion,
      updateTypeScore,
    );
    return await this.repo.save(data);
  }

  async remove(id: number): Promise<Game> {
    const typeQuestion: Game = await this.repo.findOne({
      where: {
        id: id
      }
    });
    if (!typeQuestion) {
      throw new NotFoundException('Game does not exits!');
    }
    return await this.repo.remove(typeQuestion)
  }

}

