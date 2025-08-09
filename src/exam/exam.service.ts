import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';

import {
  BadRequestException,
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
import { Exam } from './entities/exam.entity';
import { Subject } from 'src/subjects/entities/subject.entity';
import { Part } from 'src/part/entities/part.entity';

@Injectable()
export class ExamService {
  constructor(
    @InjectRepository(Exam) private repo: Repository<Exam>,
    @InjectRepository(Subject) private repoSubject: Repository<Subject>,
    @InjectRepository(School) private repoSchool: Repository<School>,
    @InjectRepository(Question) private repoQuestion: Repository<Question>,
    @InjectRepository(Part) private repoPart: Repository<Part>,
  ) {}
  async create(createExamDto: CreateExamDto, user: User): Promise<Exam> {
    const {
      schoolId,
      questionIds,
      subjectId,
      totalEssayScore,
      totalMultipleChoiceScore,
      totalMultipleChoiceScorePartI,
      totalMultipleChoiceScorePartII,
      totalMultipleChoiceScorePartIII,
      time,
      subExam,
      name,
    } = createExamDto;

    createExamDto.schoolId = user?.school?.id;
    const school = await this.repoSchool.findOne({
      where: { id: createExamDto.schoolId },
    });
    const subject: Subject = await this.repoSubject.findOne({
      where: { id: subjectId },
    });

    const questions: Question[] = await this.repoQuestion.findByIds(questionIds);

    const newExam = this.repo.create({
      totalEssayScore,
      totalMultipleChoiceScore,
      totalMultipleChoiceScorePartI,
      totalMultipleChoiceScorePartII,
      totalMultipleChoiceScorePartIII,
      time,
      subject,
      subExam,
      name,
      questions,
      createdBy: user,
      school: school,
    });
    return await this.repo.save(newExam);
  }

  async findAll(
    pageOptions: PageOptionsDto,
    query: Partial<Exam>,
    user: User,
  ): Promise<PageDto<Exam>> {
    const queryBuilder = this.repo
      .createQueryBuilder('exam')
      .leftJoinAndSelect('exam.subject', 'subject')
      .leftJoinAndSelect('exam.questions', 'questions')
      .leftJoinAndSelect('questions.typeQuestion', 'typeQuestion')
      .leftJoinAndSelect('questions.part', 'part')
      .leftJoinAndSelect('questions.level', 'level')

      .leftJoinAndSelect('questions.answers', 'answers')
      .leftJoinAndSelect('exam.school', 'school') // Lấy thông tin trường

    const { page, take, skip, order, search } = pageOptions;
    const pagination: string[] = ['page', 'take', 'skip', 'order', 'search'];

    //phân quyền dữ liệu
    if (user) {
      const schoolTypesQuery = schoolTypes(user);
      if (user.role === Role.TEACHER) {
        const subjectIds = user.subjects?.map((subject) => subject.id) || [];
        if (subjectIds.length > 0) {
          queryBuilder.andWhere(
            '(subject.id IN (:...subjectIds) OR exam.created_by = :created_by OR school.isAdmin = :isAdmin)', // danh sách môn cộng câu hỏi chính ng đó tạo
            {
              subjectIds,
              created_by: user.id,
              isAdmin: true
            },
          );
        }
      } else if (user.role === Role.PRINCIPAL) {
        queryBuilder.andWhere(
          '(school.id = :schoolId OR exam.created_by = :created_by OR school.isAdmin = :isAdmin)',
          {
            schoolId: user.school.id,
            created_by: user.id,
            isAdmin: true
          },
        );
      }
      // admin
      else {
        queryBuilder.andWhere(`school.schoolType IN (:...schoolTypesQuery)`, {
          schoolTypesQuery,
        });
      }
    }

    // 🎯 Lọc theo điều kiện tìm kiếm (bỏ qua các tham số phân trang)
    if (!!query && Object.keys(query).length > 0) {
      Object.keys(query).forEach((key) => {
        if (key && !pagination.includes(key)) {
          queryBuilder.andWhere(`exam.${key} = :${key}`, {
            [key]: query[key],
          });
        }
      });
    }

    // 🎯 Tìm kiếm theo tên môn học (bỏ dấu)
    if (search) {
      queryBuilder.andWhere(
        `LOWER(unaccent("exam".name)) ILIKE LOWER(unaccent(:search))`,
        {
          search: `%${search}%`,
        },
      );
    }

    // 🎯 Phân trang và sắp xếp
    queryBuilder.orderBy('exam.createdAt', order).skip(skip).take(take);

    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();

    const categorizedExams = entities.map(exam => {
      const typeQuestionMap = exam.questions.reduce((acc, question) => {
        const { typeQuestion } = question;
        const { id: typeQuestionId, name } = typeQuestion;
        if (!acc[name]) {
          acc[name] = [];
        }
        acc[name].push(question);
        return acc;
      }, {});

      console.log(typeQuestionMap);



      // Tạo hai mảng cho các loại câu hỏi dựa trên typeQuestionId
      const MultipleChoiceScore = typeQuestionMap['Trắc nghiệm'] || [];
      const EssayScore = typeQuestionMap['Tự luận'] || [];


      return {
        ...exam,
        MultipleChoiceScore,
        EssayScore,
      };
    });
    return new PageDto(
      categorizedExams,
      new PageMetaDto({ pageOptionsDto: pageOptions, itemCount }),
    );
  }


  //trộn đề
      // tạo ra số đề con
  async generateSubExams(data) {
    const parts = await this.repoPart.find()
    const { subExam, MultipleChoiceScore } = data;
    // Tạo ra các đề con với thứ tự `MultipleChoiceScore` khác nhau
    const subExams = Array.from({ length: subExam + 1 }, (_, index) => {
      return {
        ...data,
        questions: undefined,
        subExamIndex: index,
        MultipleChoiceScore: index === 0
          ? this.groupByPartId(MultipleChoiceScore, parts) // Giữ nguyên mảng gốc ở subExamIndex = 0
          : this.shuffleByPartIdToObjects([...MultipleChoiceScore], parts),
      };
    });


    return subExams;
  }
  
  groupByPartId(array: any[], parts) {
    const result = array.reduce((acc, question) => {
      const { part } = question;
      const { id: partId } = part;
      
      acc[partId] = acc[partId] || [];
      acc[partId].push(question); // Thêm câu hỏi vào phần tương ứng, giữ nguyên thứ tự
      return acc;
    }, {});

    const partObjects = Object.entries(result).map(([pathId, questions]) => ({
      part: parts.find(part => part.id == +pathId),
      questions: questions,
    }));

    return partObjects
  }

  // Hàm để trộn ngẫu nhiên một mảng
  shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  shuffleByPartIdToObjects(array: any[], parts) {
    // Nhóm câu hỏi theo `partId`
    const groupedByPart: Record<number, any[]> = array.reduce((acc, question) => {
      const { part } = question;
      const { id: partId } = part;
      acc[partId] = acc[partId] || [];
      acc[partId].push(question);
      return acc;
    }, {});

    // Trộn từng nhóm và chuyển thành object
    const partObjects = Object.entries(groupedByPart).map(([partId, questions]) => ({
      part: parts.find(part => part.id == +partId),
      questions: this.shuffleArray(questions),
    }));

    return partObjects;
  }


  //
  async findOne(id: number) {
    const exam = await this.repo.findOne({ where: { id }, relations: ['questions', 'questions.answers', 'questions.typeQuestion', 'questions.part', 'questions.level', 'subject'] });
    if (!exam) {
      throw new HttpException('Not found', 404);
    }

    //trộn đề 
    const typeQuestionMap = exam?.questions.reduce((acc, question) => {
      const { typeQuestion } = question;
      const { id: typeQuestionId, name } = typeQuestion;
      if (!acc[name]) {
        acc[name] = [];
      }
      acc[name].push(question);
      return acc;
    }, {});

    // Tạo các mảng cho các loại câu hỏi dựa trên typeQuestionId
    // Tạo hai mảng cho các loại câu hỏi dựa trên typeQuestionId
    const MultipleChoiceScore = typeQuestionMap['Trắc nghiệm'] || [];
    const EssayScore = typeQuestionMap['Tự luận'] || [];

    // Tạo đối tượng kết quả
    const result = {
      ...exam,
      MultipleChoiceScore,
      EssayScore,
    };
    // console.log(await this.generateSubExams(result));


    return new ItemDto(await this.generateSubExams(result))
  }

  async update(id: number, updateExamDto: Partial<UpdateExamDto>,user:User): Promise<Exam> {

    const exam: Exam = await this.repo.findOne({
      where: {
        id: id
      },
      relations: ['createdBy', 'school', 'questions', 'questions.answers', 'questions.typeQuestion', 'questions.part', 'questions.level'],
    });

    const isOwner = exam?.createdBy?.id === user.id;
    const isSameSchoolType = exam?.school?.schoolType === user.school?.schoolType;

    if (!user.isAdmin && !isOwner) {
      throw new ForbiddenException('Không có quyền ');
    }

    if (user.isAdmin && !isSameSchoolType) {
      throw new ForbiddenException('Không có quyền ');
    }

    if (exam?.createdBy.id !== user.id) {
      throw new ForbiddenException('Không có quyền ');
    }

    const questionIds = updateExamDto.questionIds
    let questions = []
    for (let i = 0; i < questionIds.length; i++) {
      const question: Question = await this.repoQuestion.findOne({ where: { id: questionIds[i] } })
      questions.push(question)
    }
    
    if (!exam) {
      throw new NotFoundException('exam does not exits!');
    }
    exam.questions = questions
    const data = this.repo.merge(
      exam,
      updateExamDto,
    );
    return await this.repo.save(data);
  }
  

  async remove(id: number, user: User) {
    const example: Exam = await this.repo.findOne({
      where: { id },
      relations: ['createdBy', 'school'],
    });

    if (!example) {
      throw new NotFoundException('Không tìm thấy tài nguyên');
    }

    const isOwner = example?.createdBy?.id === user.id;
    const isSameSchoolType = example?.school?.schoolType === user.school?.schoolType;

    if (!user.isAdmin && !isOwner) {
      throw new ForbiddenException('Không có quyền ');
    }

    if (user.isAdmin && !isSameSchoolType) {
      throw new ForbiddenException('Không có quyền');
    }

    if (example?.createdBy.id !== user.id) {
      throw new ForbiddenException('Không có quyền');
    }

    if (example?.createdBy?.id !== user.id) {
      console.log(user);
      throw new ForbiddenException('Không có quyền');
    }
    await this.repo.delete(id);
    return new ItemDto(await this.repo.delete(id));
  }
}
