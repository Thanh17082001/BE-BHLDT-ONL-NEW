import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';


import { BadRequestException, HttpException, Injectable, NotFoundException, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { PageOptionsDto } from 'src/common/pagination/page-option-dto';
import { ItemDto, PageDto } from 'src/common/pagination/page.dto';
import { PageMetaDto } from 'src/common/pagination/page.metadata.dto';
import { Grade } from 'src/grade/entities/grade.entity';
import { GradeService } from 'src/grade/grade.service';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/role/role.enum';
import { School } from 'src/schools/entities/school.entity';
import { Class } from 'src/class/entities/class.entity';
import { Student } from './entities/student.entity';
import { District } from 'src/district/entities/district.entity';
import { Province } from 'src/province/entities/supplier.entity';
import { Ward } from 'src/ward/entities/ward.entity';
import { PromotedDto } from './dto/promoted-dto';
import { Score } from 'src/score/entities/score.entity';
import { ScoreService } from 'src/score/score.service';
import { scoreAverage } from 'src/utils/avg-score';
import { TypeScore } from 'src/type-score/entities/type-score.entity';
import { clearScreenDown } from 'readline';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student) private repo: Repository<Student>,
    @InjectRepository(Class) private repoClass: Repository<Class>,
    @InjectRepository(School) private repoSchool: Repository<School>,
    @InjectRepository(District) private repoDistrict: Repository<District>,
    @InjectRepository(Province) private repoProvince: Repository<Province>,
    @InjectRepository(Ward) private repoWard: Repository<Ward>,
    @InjectRepository(Score) private repoScore: Repository<Score>,
    @InjectRepository(TypeScore) private repoTypeScore: Repository<TypeScore>,
    private readonly scoreService: ScoreService

  ) { }
  async create(createStudentDto: CreateStudentDto, user: User): Promise<Student> {
    createStudentDto.schoolId = user.school.id;
    const { fullname, code, phone, email,birthday, gender, street } = createStudentDto;
    const school = await this.repoSchool.findOne({ where: { id: createStudentDto.schoolId } });
    const classOfStudent = await this.repoClass.findOne({ where: { id: createStudentDto.classId } });
    const district = await this.repoDistrict.findOne({ where: { id: createStudentDto.district_id } });
    const province = await this.repoProvince.findOne({ where: { id: createStudentDto.province_id } });
    const ward = await this.repoWard.findOne({ where: { id: createStudentDto.ward_id } });
    const studentExist = await this.repo.findOne({ where: { code, class: { id: createStudentDto.classId }, school:{id:user.school.id}} });
    if (studentExist) {
      throw new HttpException('Mã định danh đã tồn tại', 409);
    }
    
    if (!classOfStudent) {
      throw new HttpException('Lớp không tồn tại', 409);
    }
    const newStudent = this.repo.create(
      {
        fullname,
        code,
        phone,
        email,
        birthday: new Date(birthday),
        gender,
        street,
        class: classOfStudent,
        createdBy: user.isAdmin ? null : user, school: school ?? null, district, province, ward
      }
    );
    return await this.repo.save(newStudent);
  }

  async findAll(
    pageOptions: PageOptionsDto,
    query: Partial<Student>,
    user: User
  ): Promise<PageDto<Student>> {
    const queryBuilder = this.repo.createQueryBuilder('student')
      .leftJoinAndSelect('student.school', 'school') // Lấy thông tin trường
      .leftJoinAndSelect('student.province', 'province')
      .leftJoinAndSelect('student.district', 'district')
      .leftJoinAndSelect('student.ward', 'ward')
      .leftJoinAndSelect('school.users', 'users')
      .leftJoinAndSelect('student.class', 'class')
      .leftJoinAndSelect('class.schoolYear', 'schoolYear');

    const { page, take, skip, order, search } = pageOptions;
    const pagination: string[] = ['page', 'take', 'skip', 'order', 'search', 'typeScoreId', 'schoolYearId','subjectId'];


    // 🎯 Phân quyền dữ liệu
    if (user.role === Role.TEACHER) {
      queryBuilder.andWhere(
        '((student.created_by = :userId OR student.created_by IS NULL) OR (school.id = :schoolId OR school.id IS NULL))',
        {
          userId: user.id,
          schoolId: user.school.id
        }
      );
    } else if (user.role === Role.PRINCIPAL) {
      queryBuilder.andWhere('(school.id = :schoolId OR school.id IS NULL)', {
        schoolId: user.school.id
      });
    }

    // 🎯 Lọc theo điều kiện tìm kiếm (bỏ qua các tham số phân trang)
    if (!!query && Object.keys(query).length > 0) {
      Object.keys(query).forEach((key) => {
        if (query[key] != 0) {
          if (key && !pagination.includes(key)) {
            console.log(`student.${key} = : ${key}`, { [key]: +query[key] });
            queryBuilder.andWhere(`student.${key} = :${key}`, { [key]: +query[key] });
          }
        }
      });

    }

    // 🎯 Tìm kiếm theo tên môn học (bỏ dấu)
    if (search) {
      queryBuilder.andWhere(`LOWER(unaccent("student".fullname)) ILIKE LOWER(unaccent(:search))`, {
        search: `%${search}%`,
      });
    }

  

    // 🎯 Phân trang và sắp xếp
    queryBuilder.orderBy('student.createdAt', order).skip(skip).take(take);

    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();

    console.log(entities.length);

    // tính điểm trung bình của từng học sinh

    for (let i = 0; i < entities.length; i++) {
      let queryScore:any = {
        studentId: +entities[i].id || 0,
        classId: +query['classId'] || 0,
        schoolYearId: +query['schoolYearId'] || 0,
        subjectId: +query['subjectId'] || 0,
      }
      if (query['typeScoreId']) {
        queryScore.typeScoreId = +query['typeScoreId']
      }

      const scores = await this.scoreService.find(queryScore);
      const typeScores = await this.repoTypeScore.find();

      if (!query['typeScoreId']) {
        const groupedScores = scores.reduce((acc, score) => {
          const key = score.typeScore.name; // Nhóm theo tên loại điểm
          if (!acc[key]) {
            acc[key] = [];
          }
          acc[key].push(score);
          return acc;
        }, {});

        const scoresTotal = []
        for (let k = 0; k < typeScores.length; k++) {
          const total = scoreAverage(groupedScores[typeScores[k].name])
          scoresTotal.push({
            score: total,
            coefficient: typeScores[k].coefficient,
            name: typeScores[k].name 
          })

        }
        // console.log(groupedScores[typeScores[0].name]);
        const totalAVG = scoreAverage(scoresTotal);
        (entities[i] as any).avg = scoresTotal;
        (entities[i] as any).totalAVG = totalAVG || 0;
      }

      // điểm từng học kỳ
      else {
        const totalScore = scoreAverage(scores);
        (entities[i] as any).scores = scores;
        (entities[i] as any).scoreAvg = totalScore;
      }
      
    }
    return new PageDto(entities, new PageMetaDto({ pageOptionsDto: pageOptions, itemCount }));
  }



  async findOne(id: number): Promise<ItemDto<Student>> {

    const example = await this.repo.findOne({ where: { id } });
    if (!example) {
      throw new HttpException('Not found', 404)
    }
    return new ItemDto(example);
  }

  
  async update(id: number, updateStudentDto: UpdateStudentDto, user:User) {
    const { fullname, code } = updateStudentDto;
  
    const classOfStudent = await this.repoClass.findOne({ where: { id: updateStudentDto.classId } });
    const district = await this.repoDistrict.findOne({ where: { id: updateStudentDto.district_id } });
    const province = await this.repoProvince.findOne({ where: { id: updateStudentDto.province_id } });
    const ward = await this.repoWard.findOne({ where: { id: updateStudentDto.ward_id } });
    const example: Student = await this.repo.findOne({ where: { id },relations:['class', 'school', 'ward', 'district', 'province'] });

    if (!example) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
    const studentExist = await this.repo.findOne({ where: { code, class: { id: updateStudentDto.classId }, school: { id: user.school.id } } });
    if (studentExist) {
      throw new HttpException('Mã định danh đã tồn tại', 409);
    }
   
const a=this.repo.merge(example, {...updateStudentDto, fullname: updateStudentDto.fullname, district, province, ward, class: classOfStudent })

    await this.repo.update(id, a)

    return new ItemDto(example);;
  }

  async changeClassStudent(id: number, classId: number): Promise<Student> {
    const student: Student = await this.repo.findOne({
      where: {
        id: id,
      },
    });
    const classOfStudent = await this.repoClass.findOne({ where: { id: +classId } });
    if (!classOfStudent) {
      throw new NotFoundException('class not found');
    }

    if (!student) {
      throw new NotFoundException('student not found');
    }
    const data = this.repo.merge(
      student,
      { class: classOfStudent },
    );
    return await this.repo.save(data);
  }

  async promotedStudent(id: number, newClass): Promise<Student> {
    const student: Student = await this.repo.findOne({
      where: { id: id },
      relations: ['class', 'school', 'ward', 'district', 'province']
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Tạo một bản sao mới
    const newStudent = this.repo.create({
      ...student, // Sao chép toàn bộ thông tin từ student cũ
      id: undefined, // Để TypeORM tự tạo ID mới
      isChange: false, // Giá trị cập nhật mới
      createdAt: undefined, // Reset lại thời gian tạo
      updatedAt: undefined, // Reset lại thời gian cập nhật
      class: newClass
    });

    return await this.repo.save(newStudent);
  }

  // chuyen lop
  async updateStudent(query: PromotedDto):Promise<Student> {
    const { stundentId, newClassId, oldSchoolYearId, newSchoolYearId, oldClassId } = query;
    const oldClass: Class = await this.repoClass.findOne({
      where: {
        id: oldClassId,
      }
    })
    const newClass: Class = await this.repoClass.findOne({
      where: {
        id: newClassId,
        schoolYear: { id: newSchoolYearId },
      }
    })
    if (!newClass) {
      throw new NotFoundException('New class not found');
    }
    if (!oldClass) {
      throw new NotFoundException('Old class not found');
    }
    const student: Student = await this.repo.findOne({
      where: {
        class: oldClass,
        id: stundentId,
      },
      relations: ['class', 'school', 'ward', 'district', 'province'],
    })

    if (!student) {
      throw new NotFoundException('Student not found')
    }

    if (student?.isChange) {
      throw new BadRequestException('Students have already move up in class')
    }
    const newStudent = await this.promotedStudent(+student.id, newClass)
    return newStudent
  }

  async remove(id: number) {
    const example = await this.repo.findOne({ where: { id } });
    const scores = await this.repoScore.find({ where: { student: { id } } });
    if (!example) {
      throw new NotFoundException('Không tìm thấy tài nguyên');
    }

    if (scores.length > 0) {
      throw new BadRequestException('Không thể xóa học sinh này vì đã có điểm số');
    }
    await this.repo.delete(id);
    return new ItemDto(await this.repo.delete(id));
  }
}
