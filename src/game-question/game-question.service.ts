import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateGameQuestionDto } from './dto/update-game-question.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { GameQuestion } from './entities/game-question.entity';
import { Not, Repository } from 'typeorm';
import { CreateGameQuestionDto } from './dto/create-game-question.dto';
import { PageOptionsDto } from 'src/common/pagination/page-option-dto';
import { ItemDto, PageDto } from 'src/common/pagination/page.dto';
import { PageMetaDto } from 'src/common/pagination/page.metadata.dto';
import { School } from 'src/schools/entities/school.entity';
import { User } from 'src/users/entities/user.entity';
import { schoolTypes } from 'src/common/constant/type-school-query';


@Injectable()
export class GameQuestionService {
  constructor(
    @InjectRepository(GameQuestion)
    private repo: Repository<GameQuestion>,
            @InjectRepository(School) private repoSchool: Repository<School>,
    
  ) { }

  async create(createGameQuestionDto: CreateGameQuestionDto, user:User): Promise<GameQuestion> {
    console.log('thiên tha hnhasdasdas');

    const school = await this.repoSchool.findOne({
      where: { id: user.school.id ?? -1 },
    });


    return await this.repo.save({ suggest: createGameQuestionDto.suggest, answer: createGameQuestionDto.answer, school, createdBy:user });
  }

  async findAll(pageOptions: PageOptionsDto, query: Partial<GameQuestion>, user:User): Promise<PageDto<GameQuestion>> {
    const queryBuilder = this.repo.createQueryBuilder('game-question').leftJoinAndSelect('game-question.school', 'school')
      .leftJoinAndSelect('game-question.createdBy', 'createdBy')
      .leftJoinAndSelect('game-question.games', 'games');
    const { page, take, skip, order, search } = pageOptions;
    const pagination: string[] = ['page', 'take', 'skip', 'order', 'search'];

          const schoolTypesQuery = schoolTypes(user);
    
    // 🎯 Lọc theo điều kiện tìm kiếm (bỏ qua các tham số phân trang)
    if (!!query && Object.keys(query).length > 0) {
      Object.keys(query).forEach((key) => {
        if (key !== undefined && key !== null && !pagination.includes(key)) {
          queryBuilder.andWhere(`game-question.${key} = :${key}`, { [key]: query[key] });
        }
      });
    }

    queryBuilder.andWhere(
      '(school.id = :schoolId OR (school.isAdmin = :isAdmin AND school.schoolType IN (:...schoolTypesQuery)))',
      {
        schoolId: user.school.id,
        isAdmin: true, // Thêm điều kiện isAdmin = true
        schoolTypesQuery,
      },
    );

    // 🎯 Tìm kiếm theo tên môn học (bỏ dấu)
    if (search) {
      queryBuilder.andWhere(
        `LOWER(unaccent("game-question".name)) ILIKE LOWER(unaccent(:search))`,
        {
          search: `%${search}%`,
        },
      );
    }

    queryBuilder.orderBy("game-question.createdAt", pageOptions.order)
      .skip(pageOptions.skip)
      .take(pageOptions.take);

    const itemCount = await queryBuilder.getCount();
    const pageMetaDto = new PageMetaDto({ pageOptionsDto: pageOptions, itemCount });
    const entities = await queryBuilder.getMany();

    return new PageDto(entities, pageMetaDto);

  }

  async findOne(id: number): Promise<ItemDto<GameQuestion>> {
    return new ItemDto(await this.repo.findOne({
      where: {
        id: id
      },
      relations: ['games']
    }))
  }

  async update(id: number, updateTypeScore: Partial<UpdateGameQuestionDto>): Promise<GameQuestion> {
    const gameQuestion: GameQuestion = await this.repo.findOne({
      where: {
        id: id
      }
    });
    const exits = await this.repo.findOne({
      where: {
        suggest: updateTypeScore.suggest,
        id: Not(id),
      }
    })
    if (exits) {
      throw new BadRequestException('game question  is already!')
    }
    if (!gameQuestion) {
      throw new NotFoundException('game question does not exits!');
    }
    const data = this.repo.merge(
      gameQuestion,
      updateTypeScore,
    );
    return await this.repo.save(data);
  }

  async remove(id: number): Promise<GameQuestion> {
    const typeQuestion: GameQuestion = await this.repo.findOne({
      where: {
        id: id
      }
    });
    if (!typeQuestion) {
      throw new NotFoundException('Game question does not exits!');
    }
    return await this.repo.remove(typeQuestion)
  }
}
