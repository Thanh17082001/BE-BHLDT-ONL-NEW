import { CreateElearningDto } from './dto/create-elearning.dto';
import { UpdateElearningDto } from './dto/update-elearning.dto';



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
import { Question } from 'src/question/entities/question.entity';
import { Elearning } from './entities/elearning.entity';

@Injectable()
export class ElearningService {
  constructor(
    @InjectRepository(Elearning) private repo: Repository<Elearning>,
    @InjectRepository(School) private repoSchool: Repository<School>,
  ) { }
  async create(
    createElearningDto: CreateElearningDto,
    user: User,
  ): Promise<Elearning> {
    const { content, schoolId, title } = createElearningDto;

    createElearningDto.schoolId = user?.school?.id;
    const school = await this.repoSchool.findOne({
      where: { id: schoolId },
    });
    

    const newElearning = this.repo.create({
      content,
      title,
      createdBy: user,
      school: school,
    });
    return await this.repo.save(newElearning);
  }

  async findAll(
    pageOptions: PageOptionsDto,
    query: Partial<Elearning>,
    user: User,
  ): Promise<PageDto<Elearning>> {
    const queryBuilder = this.repo
      .createQueryBuilder('Elearning')
      .leftJoinAndSelect('Elearning.school', 'school') // Lấy thông tin trường
      .leftJoinAndSelect('Elearning.createdBy', 'createdBy'); // Lấy danh sách giáo viên phụ trách môn học

    const { page, take, skip, order, search } = pageOptions;
    const pagination: string[] = ['page', 'take', 'skip', 'order', 'search'];



    // 🎯 Lọc theo điều kiện tìm kiếm (bỏ qua các tham số phân trang)
    if (!!query && Object.keys(query).length > 0) {
      Object.keys(query).forEach((key) => {
        if (key && !pagination.includes(key)) {
          queryBuilder.andWhere(`Elearning.${key} = :${key}`, {
            [key]: query[key],
          });
        }
      });
    }


    // 🎯 Tìm kiếm theo tên môn học (bỏ dấu)
    if (search) {
      queryBuilder.andWhere(
        `LOWER(unaccent("Elearning".name)) ILIKE LOWER(unaccent(:search))`,
        {
          search: `%${search}%`,
        },
      );
    }

    // 🎯 Phân trang và sắp xếp
    queryBuilder.orderBy('Elearning.createdAt', order).skip(skip).take(take);

    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();

    return new PageDto(
      entities,
      new PageMetaDto({ pageOptionsDto: pageOptions, itemCount }),
    );
  }

  async findOne(id: number): Promise<ItemDto<Elearning>> {
    const example = await this.repo.findOne({ where: { id } });
    if (!example) {
      throw new HttpException('Not found', 404);
    }
    return new ItemDto(example);
  }

  async update(id: number, updateElearningDto: UpdateElearningDto) {
    const { content, title } = updateElearningDto;


    const example: Elearning = await this.repo.findOne({ where: { id }, relations: ['createdBy', 'school'] });

    if (!example) {
      throw new NotFoundException(`Elearning with ID ${id} not found`);
    }

    this.repo.merge(example, { content, title });

    await this.repo.update(id, example);

    return new ItemDto(example);
  }

  async remove(id: number, user: User) {
    const example: Elearning = await this.repo.findOne({
      where: { id },
      relations: ['createdBy', 'school'],
    });

    if (!example) {
      throw new NotFoundException('Không tìm thấy tài nguyên');
    }
    if (user.role !== Role.ADMIN) {
      if (example.createdBy.id !== user.id) {
        throw new ForbiddenException('Không có quyền xóa');
      }
    }
    await this.repo.delete(id);
    return new ItemDto(await this.repo.delete(id));
  }
}
