import { CreateLessonPlanDto } from './dto/create-lesson-plan.dto';
import { UpdateLessonPlanDto } from './dto/update-lesson-plan.dto';


import { ForbiddenException, HttpException, Injectable, NotFoundException } from '@nestjs/common';



import * as sharp from 'sharp';
import * as path from 'path';
import { existsSync, statSync, unlinkSync, promises as fs } from 'fs';
import { School } from 'src/schools/entities/school.entity';
import { Topic } from 'src/topics/entities/topic.entity';
import { Subject } from 'src/subjects/entities/subject.entity';
import { ItemDto, PageDto } from 'src/common/pagination/page.dto';
import { PageMetaDto } from 'src/common/pagination/page.metadata.dto';
import { Role } from 'src/role/role.enum';
import { User } from 'src/users/entities/user.entity';
import { PageOptionsDto } from 'src/common/pagination/page-option-dto';
import { subscribe } from 'diagnostics_channel';
import { schoolTypes } from 'src/common/constant/type-school-query';
import { Voice } from 'src/voice/entities/voice.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { LessonPlan } from './entities/lesson-plan.entity';

@Injectable()
export class LessonPlanService {
  constructor(
    @InjectRepository(LessonPlan) private repo: Repository<LessonPlan>,
    @InjectRepository(School) private repoSchool: Repository<School>,
    @InjectRepository(Topic) private repoTopic: Repository<Topic>,
    @InjectRepository(Subject) private repoSubject: Repository<Subject>,
  ) {}

  async create(createLessonPlanDto: CreateLessonPlanDto, user) {
    createLessonPlanDto.createdBy = user;
    createLessonPlanDto.schoolId = user?.school?.id;
    const school = await this.repoSchool.findOne({
      where: { id: createLessonPlanDto.schoolId ?? -1 },
    });
   
   
    const subject = await this.repoSubject.findOne({
      where: { id: +createLessonPlanDto.subjectId },
    });
    

   
    const LessonPlanTypeEntity = await this.repo.save({
      ...createLessonPlanDto,
      school,
      subject,
      createdBy: user,
    });
    return LessonPlanTypeEntity;
  }

  async findAll(
    pageOptions: PageOptionsDto,
    query: Partial<LessonPlan>,
    user: User,
  ): Promise<PageDto<LessonPlan>> {
    const queryBuilder = this.repo
      .createQueryBuilder('lessonplan')
      .leftJoinAndSelect('lessonplan.subject', 'subject')
      
      .leftJoinAndSelect('lessonplan.school', 'school') // Lấy thông tin trường
      .leftJoinAndSelect('school.users', 'users')
      .leftJoinAndSelect('users.subjects', 'userSubjects') // Lấy danh sách giáo viên phụ trách môn học
     
      
    const { page, take, skip, order, search } = pageOptions;
    const pagination: string[] = ['page', 'take', 'skip', 'order', 'search'];

    // 🎯 Lọc theo điều kiện tìm kiếm (bỏ qua các tham số phân trang)
    if (user) {
      const schoolTypesQuery = schoolTypes(user);

      queryBuilder.andWhere(
        new Brackets((qb) => {
          if (user.role === Role.TEACHER) {
            const subjectIds = user.subjects?.map((subject) => subject.id) || [];
            if (subjectIds.length > 0) {
              qb.where('subject.id IN (:...subjectIds)', { subjectIds })
                .orWhere(
                  '(school.isAdmin = :isAdmin AND school.schoolType IN (:...schoolTypesQuery))',
                  {
                    isAdmin: true,
                    schoolTypesQuery,
                  },
                );
            }
          } else if (user.role === Role.PRINCIPAL) {
            qb.where('school.id = :schoolId', { schoolId: user.school.id })
              .orWhere(
                '(school.isAdmin = :isAdmin AND school.schoolType IN (:...schoolTypesQuery))',
                {
                  isAdmin: true,
                  schoolTypesQuery,
                },
              );
          } else if (user.role === Role.ADMIN) {
            qb.where('school.schoolType IN (:...schoolTypesQuery)', { schoolTypesQuery });
          }
        }),
      );
    }

    // 🎯 Thêm filter từ query params (không bao gồm pagination)
    if (!!query && Object.keys(query).length > 0) {
      Object.keys(query).forEach((key) => {
        if (key && !pagination.includes(key)) {
          queryBuilder.andWhere(`lessonplan.${key} = :${key}`, {
            [key]: +query[key],
          });
        }
      });
    }



    // 🎯 Tìm kiếm theo tên môn học (bỏ dấu)
    if (search) {
      queryBuilder.andWhere(
        `LOWER(unaccent("lessonplan".name)) ILIKE LOWER(unaccent(:search))`,
        {
          search: `%${search}%`,
        },
      );
    }

    // 🎯 Phân trang và sắp xếp
    queryBuilder.orderBy('lessonplan.createdAt', order).skip(skip).take(take);

    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();

    return new PageDto(
      entities,
      new PageMetaDto({ pageOptionsDto: pageOptions, itemCount }),
    );
  }

  async findOne(id: number) {
    const resource = await this.repo.findOne({
      where: { id },
      relations: ['subject'],
    });
    return new ItemDto(resource);
  }

  async update(id: number, updateLessonPlanDto: UpdateLessonPlanDto, user: User, isFile: boolean) {
    const lessonPlan = await this.repo.findOne({ where: { id }, relations: ['subject', 'school','createdBy'] });
    if (!lessonPlan) {
      throw new NotFoundException('Lesson plan not found');
    }
    if (isFile) {
      const oldPath = path.join(__dirname, '..', '..', lessonPlan.path);
      console.log('t', oldPath);
      if (existsSync(oldPath) && lessonPlan.path) {
        unlinkSync(oldPath);
      }
    }

    console.log(updateLessonPlanDto,'tálkdjahsldkjahsd');

    const data = this.repo.merge(
      lessonPlan,
      updateLessonPlanDto,
    );
    return await this.repo.save(data);
  }

  async remove(id: number, user: User) {
    const lessonPlan = await this.repo.findOne({ where: { id }, relations: ['subject', 'school','createdBy'] });
    if (!lessonPlan) {
      throw new NotFoundException('Lesson plan not found');
    }

    if (!user.isAdmin) {
      if (lessonPlan?.createdBy?.id !== user.id) {
        throw new ForbiddenException('Không có quyền');
      }
        }
    

    const oldPath = path.join(__dirname, '..', '..', lessonPlan.path);
    if (existsSync(oldPath) && lessonPlan.path) {
      unlinkSync(oldPath);
    }
   

    
    return await this.repo.remove(lessonPlan);
  }

  
}
