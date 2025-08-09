import { CreateVoiceDto } from './dto/create-voice.dto';
import { UpdateVoiceDto } from './dto/update-voice.dto';
import * as path from 'path';
import { existsSync, statSync, unlinkSync, promises as fs } from 'fs';
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
import { Grade } from 'src/grade/entities/grade.entity';
import { GradeService } from 'src/grade/grade.service';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/role/role.enum';
import { School } from 'src/schools/entities/school.entity';
import { schoolTypes } from 'src/common/constant/type-school-query';
import { Voice } from './entities/voice.entity';
import { File } from 'src/file/entities/file.entity';
import { TypeVoice } from 'src/type-voice/entities/type-voice.entity';

@Injectable()
export class VoiceService {
  constructor(
    @InjectRepository(Voice) private repo: Repository<Voice>,
    @InjectRepository(School) private repoSchool: Repository<School>,
    @InjectRepository(File) private repoFile: Repository<File>,
    @InjectRepository(TypeVoice) private repoTypeVoice: Repository<TypeVoice>,
  ) {}
  async create(
    createVoiceDto: CreateVoiceDto,
    user: User,
  ): Promise<Voice> {

    createVoiceDto.schoolId = user?.school?.id;
    const school = await this.repoSchool.findOne({
      where: { id: createVoiceDto.schoolId },
    });

   
    const { name, fileId, typeVoiceId, order, isGeneral, link } = createVoiceDto;
    const file = await this.repoFile.findOne({
      where: { id: fileId },
    });
    const typeVoice = await this.repoTypeVoice.findOne({
      where: { id: typeVoiceId },
    });
    if (await this.repo.findOne({ where: { name } })) {
      throw new HttpException('Tên đã tồn tại', 409);
    }
    

    const newVoice = this.repo.create({
      ...createVoiceDto,
      createdBy: user,
      file,
      typeVoice,
      school: school,
    });
    return await this.repo.save(newVoice);
  }

  async findAll(
    pageOptions: PageOptionsDto,
    query: Partial<Voice>,
    user: User,
  ): Promise<PageDto<Voice>> {
    const queryBuilder = this.repo
      .createQueryBuilder('Voice')
      .leftJoinAndSelect('Voice.school', 'school') // Lấy thông tin trường
      .leftJoinAndSelect('Voice.file', 'file')
      .leftJoinAndSelect('Voice.typeVoice', 'typeVoice')
      .leftJoinAndSelect('school.users', 'users'); // Lấy danh sách giáo viên phụ trách môn học

    const { page, take, skip, order, search } = pageOptions;
    const pagination: string[] = ['page', 'take', 'skip', 'order', 'search'];

      

    // 🎯 Lọc theo điều kiện tìm kiếm (bỏ qua các tham số phân trang)
    if (!!query && Object.keys(query).length > 0) {
      Object.keys(query).forEach((key) => {
        if (key && !pagination.includes(key)) {
          console.log(key);
          queryBuilder.andWhere(`Voice.${key} = :${key}`, {
            [key]: query[key],
          });
        }
      });
    }

    
    // 🎯 Tìm kiếm theo tên môn học (bỏ dấu)
    if (search) {
      queryBuilder.andWhere(
        `LOWER(unaccent("Voice".name)) ILIKE LOWER(unaccent(:search))`,
        {
          search: `%${search}%`,
        },
      );
    }

    // 🎯 Phân trang và sắp xếp
    queryBuilder.orderBy('Voice.createdAt', order).skip(skip).take(take);

    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();

    return new PageDto(
      entities,
      new PageMetaDto({ pageOptionsDto: pageOptions, itemCount }),
    );
  }

  async findOne(id: number): Promise<ItemDto<Voice>> {
    const example = await this.repo.findOne({ where: { id }, relations:['topics'] });
    if (!example) {
      throw new HttpException('Not found', 404);
    }
    return new ItemDto(example);
  }


  async update(id: number, updateVoiceDto: UpdateVoiceDto,user:User, isFile: boolean = true) {
    const { name, link } = updateVoiceDto;
    
    const example: Voice = await this.repo.findOne({ where: { id }, relations: ['createdBy', 'school', 'file', 'typeVoice'] });
    if (isFile) {
      const oldImagePath = path.join(__dirname, '..', '..', example.link);
      if (existsSync(oldImagePath) && example.link) {
        unlinkSync(oldImagePath);
      }

    }

    this.repo.merge(example, { ...updateVoiceDto });

    await this.repo.update(id, example);

    return new ItemDto(example);
  }

  async remove(id: number, user:User) {
    const example: Voice = await this.repo.findOne({
      where: { id },
      relations: ['createdBy', 'school'],
    });

    if (!example) {
      throw new NotFoundException('Không tìm thấy tài nguyên');
    }

    if (example?.createdBy?.id !== user?.id) {
      throw new ForbiddenException('Không có quyền xóa');
    }
    await this.repo.delete(id);
    return new ItemDto(await this.repo.delete(id));
  }
}
