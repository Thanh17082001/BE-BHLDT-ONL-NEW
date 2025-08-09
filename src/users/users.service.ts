import { BadRequestException, HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { PageOptionsDto } from 'src/common/pagination/page-option-dto';
import { ItemDto, PageDto } from 'src/common/pagination/page.dto';
import { PageMetaDto } from 'src/common/pagination/page.metadata.dto';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserUtil } from 'src/common/bryct/config.bryct';
import { School } from 'src/schools/entities/school.entity';
import { Grade } from 'src/grade/entities/grade.entity';
import { Subject } from 'src/subjects/entities/subject.entity';
import { ChangePassDto } from './dto/change-pass.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private repo: Repository<User>,
    @InjectRepository(School) private schoolRepository: Repository<School>,
    @InjectRepository(Grade)
    private readonly gradeRepository: Repository<Grade>,

    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
  ) {}
  async create(
    createUserDto: CreateUserDto
  ) {

    const { fullName, username, password, schoolId, gradeIds, subjectIds, role='Giáo viên', isAdmin } = createUserDto;


    // Tìm trường học
    const school = await this.schoolRepository.findOne({ where: { id: schoolId } });

    // Tìm danh sách lớp theo `classIds`
    const grades = await this.gradeRepository.findByIds(gradeIds);
    if (grades.length !== gradeIds.length) {
      throw new Error('Some classes not found');
    }

    // Tìm danh sách môn học theo `subjectIds`
    const subjects = await this.subjectRepository.findByIds(subjectIds);
    if (subjects.length !== subjectIds.length) {
      throw new Error('Some subjects not found');
    }

    const existUser: any = await this.repo.findOne({ where: { username, school: { id: schoolId } } });

    if (existUser) {
      throw new BadRequestException('Tên tài khoản đã tồn tại');
      }


    const user = await this.repo.save({
      fullname: fullName,
      username,
      password: UserUtil.hashPassword(password),
      school: school ?? null,
      grades,
      subjects,
      role,
      isAdmin: isAdmin ?? false,
    });
    return user
  }

  async findAll(pageOptions: PageOptionsDto, query: Partial<User>): Promise<PageDto<User>> {
    const queryBuilder = this.repo.createQueryBuilder('user');
    const { page, take, skip, order, search } = pageOptions;
    const pagination: string[] = ['page', 'take', 'skip', 'order', 'search']
    if (!!query && Object.keys(query).length > 0) {
      const arrayQuery: string[] = Object.keys(query);
      arrayQuery.forEach((key) => {
        if (key && !pagination.includes(key)) {
          queryBuilder.andWhere(`user.${key} = :${key}`, { [key]: query[key] });
        }
      });
    }

    //search document
    if (search) {
      queryBuilder.andWhere(`LOWER(unaccent(user.name)) ILIKE LOWER(unaccent(:search))`, {
        search: `%${search}%`,
      });
    }


    queryBuilder.orderBy(`user.createdAt`, order)
      .skip(skip)
      .take(take);

    const itemCount = await queryBuilder.getCount();
    const pageMetaDto = new PageMetaDto({ pageOptionsDto: pageOptions, itemCount });
    const { entities } = await queryBuilder.getRawAndEntities();

    return new PageDto(entities, pageMetaDto);
  }

  async findOne(username: string): Promise<User> {
    console.log(username,'thienhahaha');
    const user = await this.repo.findOne({ where: { username }});
    if (!user) {
      throw new HttpException('Not found', 404);
    }
    return user;
  }

  

  async remove(id: number) {
    const user = this.repo.findOne({ where: { id } });
    if(!user){
      throw new NotFoundException('Không tìm thấy tài nguyên');
    }
    await this.repo.delete(id);
    return new ItemDto(await this.repo.delete(id));
  }

  async changePassword(dto: ChangePassDto): Promise<User> {
    const { userId, password, newPassword } = dto;

    // 1️⃣ Tìm user theo `userId`
    const user = await this.repo.findOne({ where: { id: +userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 2️⃣ Kiểm tra mật khẩu cũ
    const isMatch = await UserUtil.comparePassword(password, user.password);
    if (!isMatch) {
      throw new BadRequestException('Mật khẩu cũ không chính xác');
    }

    // 3️⃣ Mã hóa mật khẩu mới
    const hashedPassword = await UserUtil.hashPassword(newPassword);

    // 4️⃣ Lưu mật khẩu mới vào database
    user.password = hashedPassword;
    const newUser = await this.repo.save(user);

    return newUser;
  }
}
