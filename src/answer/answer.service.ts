import { CreateAnswerDto } from './dto/create-answer.dto';
import { UpdateAnswerDto } from './dto/update-answer.dto';

import {
  ForbiddenException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { PageOptionsDto } from 'src/common/pagination/page-option-dto';
import { ItemDto, PageDto } from 'src/common/pagination/page.dto';
import { PageMetaDto } from 'src/common/pagination/page.metadata.dto';
import { GradeService } from 'src/grade/grade.service';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/role/role.enum';
import { School } from 'src/schools/entities/school.entity';
import { schoolTypes } from 'src/common/constant/type-school-query';
import { Answer } from './entities/answer.entity';
import { Question } from 'src/question/entities/question.entity';

@Injectable()
export class AnswerService {
  constructor(
    @InjectRepository(Answer) private repo: Repository<Answer>,
    @InjectRepository(Question) private repoQuestion: Repository<Question>,
    @InjectRepository(School) private repoSchool: Repository<School>,
  ) { }
  async create(
    createAnswerDto: CreateAnswerDto,
    user: User,
  ): Promise<Answer> {
    const { content, questionId, schoolId, isCorrect } = createAnswerDto;

    createAnswerDto.schoolId = user?.school?.id;
    const school = await this.repoSchool.findOne({
      where: { id: schoolId },
    });
    const question = await this.repoQuestion.findOne({
      where: { id: questionId },
    });


    const newAnswer = this.repo.create({
      content,
      isCorrect,
      question,
      createdBy: user,
      school: school,
    });
    return await this.repo.save(newAnswer);
  }

  async findAll(
    pageOptions: PageOptionsDto,
    query: Partial<Answer>,
    user: User,
  ): Promise<PageDto<Answer>> {
    const queryBuilder = this.repo
      .createQueryBuilder('Answer')
      .leftJoinAndSelect('Answer.grade', 'grade')
      .leftJoinAndSelect('Answer.school', 'school') // Lấy thông tin trường
      .leftJoinAndSelect('Answer.users', 'users'); // Lấy danh sách giáo viên phụ trách môn học

    const { page, take, skip, order, search } = pageOptions;
    const pagination: string[] = ['page', 'take', 'skip', 'order', 'search'];



    // 🎯 Lọc theo điều kiện tìm kiếm (bỏ qua các tham số phân trang)
    if (!!query && Object.keys(query).length > 0) {
      Object.keys(query).forEach((key) => {
        if (key && !pagination.includes(key)) {
          queryBuilder.andWhere(`Answer.${key} = :${key}`, {
            [key]: query[key],
          });
        }
      });
    }


    // 🎯 Tìm kiếm theo tên môn học (bỏ dấu)
    if (search) {
      queryBuilder.andWhere(
        `LOWER(unaccent("Answer".name)) ILIKE LOWER(unaccent(:search))`,
        {
          search: `%${search}%`,
        },
      );
    }

    // 🎯 Phân trang và sắp xếp
    queryBuilder.orderBy('Answer.createdAt', order).skip(skip).take(take);

    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();

    return new PageDto(
      entities,
      new PageMetaDto({ pageOptionsDto: pageOptions, itemCount }),
    );
  }

  async findOne(id: number): Promise<ItemDto<Answer>> {
    const example = await this.repo.findOne({ where: { id } });
    if (!example) {
      throw new HttpException('Not found', 404);
    }
    return new ItemDto(example);
  }

  async update(id: number, updateAnswerDto: UpdateAnswerDto) {
    const { content, isCorrect } = updateAnswerDto;


    const example: Answer = await this.repo.findOne({ where: { id } });

    if (!example) {
      throw new NotFoundException(`Answer with ID ${id} not found`);
    }

    this.repo.merge(example, { content, isCorrect });

    await this.repo.update(id, example);

    return new ItemDto(example);
  }

  async remove(id: number, user: User) {
    const example: Answer = await this.repo.findOne({
      where: { id },
      relations: ['createdBy', 'school'],
    });

    if (!example) {
      throw new NotFoundException('Không tìm thấy tài nguyên');
    }

    if (!example?.createdBy?.isAdmin) {
      console.log(user);
      throw new ForbiddenException('Không có quyền xóa');
    }
    await this.repo.delete(id);
    return new ItemDto(await this.repo.delete(id));
  }
}
