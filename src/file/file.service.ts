import { resizeImage } from './../utils/resize-image';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';

import * as sharp from 'sharp';
import * as path from 'path';
import { existsSync, statSync, unlinkSync, promises as fs } from 'fs';
import { File } from './entities/file.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { CreateImageDto } from 'src/image/dto/create-image.dto';
import { ImageService } from 'src/image/image.service';
import { Image } from 'src/image/entities/image.entity';
import { School } from 'src/schools/entities/school.entity';
import { FileType } from 'src/file-type/entities/file-type.entity';
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
import { RolesGuard } from 'src/role/role.guard';
import { Roles } from 'src/role/role.decorator';
import { fromPath } from "pdf2pic";
import * as pdf from 'pdf-parse';


@Injectable()

export class FileService {
  constructor(
    @InjectRepository(File) private repo: Repository<File>,
    @InjectRepository(Image) private repoImage: Repository<Image>,
    @InjectRepository(School) private repoSchool: Repository<School>,
    @InjectRepository(FileType) private repoFileType: Repository<FileType>,
    @InjectRepository(Topic) private repoTopic: Repository<Topic>,
    @InjectRepository(Subject) private repoSubject: Repository<Subject>,
  ) {}

  async create(createFileDto: CreateFileDto, images: string[] = [], user) {
    console.log(createFileDto);
    createFileDto.createdBy = user;
    createFileDto.schoolId = user?.school?.id;
    const school = await this.repoSchool.findOne({
      where: { id: createFileDto.schoolId ?? -1 },
    });
    const fileType = await this.repoFileType.findOne({
      where: { id: +createFileDto.filetypeId },
    });
    const topic = await this.repoTopic.findOne({
      where: { id: +createFileDto.topicId },
    });
    const subject = await this.repoSubject.findOne({
      where: { id: +createFileDto.subjectId },
    });
    const file = await this.repo.findOne({
      where: { id: +createFileDto.parentId },
    });

    const fileCreate = this.repo.create(createFileDto);
    let resutlImages: Image[] = [];
    if (images.length > 0) {
      for (let i = 0; i < images?.length; i++) {
        const imageDto: CreateImageDto = {
          name: createFileDto.name,
          fileId: fileCreate.id,
          path: images[i] || '',
        };
        const image = await this.repoImage.create(imageDto);
        resutlImages.push(image);
      }
    }
    const data = {
      ...fileCreate,
      images: resutlImages,
      school,
      fileType: fileType ?? null,
      topic: topic ?? null,
      subject: subject ?? null,
      parent: file ? file : null,
      createedBy: user,
    };
    const fileTypeEntity = await this.repo.save(data);
    return fileTypeEntity;
  }

  async findAll(
    pageOptions: PageOptionsDto,
    query: Partial<File>,
    user: User,
  ): Promise<PageDto<File>> {
    const queryBuilder = this.repo
      .createQueryBuilder('file')
      .leftJoinAndSelect('file.fileType', 'fileType')
      .leftJoinAndSelect('file.subject', 'subject')
      .leftJoinAndSelect('subject.grade', 'grade')
      .leftJoinAndSelect('file.topic', 'topic')
      .leftJoinAndSelect('file.images', 'images')
      .leftJoinAndSelect('file.school', 'school') // Lấy thông tin trường
      .leftJoinAndSelect('school.users', 'users')
      .leftJoinAndSelect('users.subjects', 'userSubjects') // Lấy danh sách giáo viên phụ trách môn học
      .leftJoinAndMapMany('file.voices', Voice, 'voices', 'voices.fileId = file.id')
      .leftJoinAndMapOne('voices.typeVoice', 'voices.typeVoice', 'typeVoice');
      
    const { page, take, skip, order, search } = pageOptions;
    const pagination: string[] = ['page', 'take', 'skip', 'order', 'search'];

    // 🎯 Phân quyền dữ liệu
    if (user) {
      const schoolTypesQuery = schoolTypes(user);

      queryBuilder.andWhere(
        new Brackets((qb) => {
          if (user.role === Role.TEACHER) {
            const subjectIds = user.subjects?.map((subject) => subject.id) || [];

            if (subjectIds.length > 0) {
              qb.where(
                new Brackets((q) =>
                  q
                    .where('subject.id IN (:...subjectIds)', { subjectIds })
                    .orWhere('file.created_by = :created_by', { created_by: user.id }),
                ),
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
   

    // 🎯 Lọc theo các trường từ query params (bỏ qua các tham số phân trang)
    if (query) {
      Object.entries(query).forEach(([key, value]) => {

        if ('parent_id' in query && query.parent_id !== undefined && query.parent_id !== null) {
          queryBuilder.andWhere(`file.parent_id = :parent_id`, {
            parent_id: +query.parent_id,
          });
        } else {
          queryBuilder.andWhere('file.parent_id IS NULL');
        }
        if (key && !pagination.includes(key)) {
          
          if (key === 'gradeId') {
            queryBuilder.andWhere('grade.id = :gradeId', {
              gradeId: +value,
            });
          } else  {
            queryBuilder.andWhere(`file.${key} = :${key}`, {
              [key]: isNaN(Number(value)) ? value : +value,
            });
          }
        }
      });
    }

    // 🎯 Tìm kiếm theo tên môn học (bỏ dấu và không phân biệt hoa thường)
    if (search) {
      queryBuilder.andWhere(
        `LOWER(unaccent("file".name)) ILIKE LOWER(unaccent(:search))`,
        {
          search: `%${search}%`,
        },
      );
    }

    // 🎯 Phân trang và sắp xếp
    queryBuilder.orderBy('file.createdAt', order).skip(skip).take(take);

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
      relations: ['images', 'children', 'fileType'],
    });
    return new ItemDto(resource);
  }

  update(id: number, updateFileDto: UpdateFileDto) {
    return `This action updates a #${id} file`;
  }

  async remove(id: number,user:User) {
    const resource = await this.repo.findOne({
      where: { id },
      relations: ['images', 'children', 'createdBy', 'school'],
    });

    if (!resource) {
      throw new NotFoundException('Không tìm thấy tài nguyên');
    }

    if (!user.isAdmin) {
      if(resource?.createdBy?.id !== user.id) {
        throw new ForbiddenException('Không có quyền xóa');
      }
    }


    // Nếu có file con, xóa tất cả đệ quy
    if (resource.children && resource.children.length > 0) {
      for (const child of resource.children) {
        await this.remove(child.id, user);
      }
    }

    const oldImagePath = path.join(__dirname, '..', '..', resource.path);
    if (existsSync(oldImagePath) && resource.path) {
      unlinkSync(oldImagePath);
      for (let i = 0; i < resource?.images?.length; i++) {
        const priviewImageOld = path.join(__dirname, '..', '..', resource.path);
        const imageConvertOld = path.join(
          __dirname,
          '..',
          '..',
          resource.images[i].path,
        );

        if (existsSync(priviewImageOld)) {
          await this.repoImage.delete(resource.images[i].id);
          unlinkSync(priviewImageOld);
        }

        if (existsSync(imageConvertOld)) {
          unlinkSync(imageConvertOld);
        }
      }
    }
    return new ItemDto(await this.repo.delete(id));
  }

  async resizeImage(buffer: Buffer, linkFile: string): Promise<string> {
    try {
      await sharp(buffer)
        .resize(800) // Thay đổi kích thước (nếu cần)
        .jpeg({ quality: 70 }) // Định dạng và chất lượng ảnh
        .toFile(linkFile);
      return linkFile;
    } catch (error) {
      console.log(error.message);
    }
  }

  // async convertPdfToImages(pdfPath: string): Promise<Array<string>> {
  //   try {
  //     const outputDir = path.join(__dirname, '../../public/images-convert');
  //     // const outputFiles: string[] = [];

  //     // Đảm bảo thư mục đầu ra tồn tại
  //     await fs.mkdir(outputDir, { recursive: true });
  //     const existingFiles = new Set(await fs.readdir(outputDir));

  //     // Thiết lập tùy chọn cho việc chuyển đổi
  //     // const options = {
  //     //   format: 'png',
  //     //   out_dir: outputDir,
  //     //   out_prefix: path.basename(pdfPath, path.extname(pdfPath)),
  //     //   page: null, // Chuyển đổi tất cả các trang
  //     // };

  //     const options = {
  //       density: 150,
  //       saveFilename: "page",       // tên file ảnh đầu ra
  //       savePath: "./output",       // thư mục lưu ảnh
  //       format: "png",              // hoặc "jpg"
  //       width: 800,
  //       height: 1000,
  //     };
  //     // Chuyển đổi PDF thành hình ảnh
  //     await pdfPoppler.convert(pdfPath, options);
  //     // Lấy danh sách các tệp đã chuyển đổi
  //     const newFiles = await fs.readdir(outputDir);
  //     const outputFiles: string[] = newFiles
  //       .filter((file) => file.endsWith('.png') && !existingFiles.has(file))
  //       .map((file) => `public/images-convert/${file}`);

  //     return outputFiles;
  //   } catch (error) {
  //     throw new Error(error);
  //   }
  // }

  // async  convertPdfToImages(pdfPath: string): Promise<string[]> {
  // try {
  //   const outputDir = path.join(__dirname, "../../public/images-convert");
  //   await fs.mkdir(outputDir, { recursive: true });

  //   // Tạo prefix duy nhất bằng timestamp
  //   const timestamp = Date.now();

  //   // Đọc số trang
  //   const pdfBuffer = await fs.readFile(pdfPath);
  //   const pdfData = await pdf(pdfBuffer);
  //   const totalPages = pdfData.numpages;

  //   const outputFiles: string[] = [];

  //   for (let i = 1; i <= totalPages; i++) {
  //     const filename = `${timestamp}_page${i}`;
  //     const convert = fromPath(pdfPath, {
  //       density: 150,
  //       saveFilename: filename,
  //       savePath: outputDir,
  //       format: "png",
  //       width: 800,
  //       height: 1000,
  //     });

  //     const result = await convert(i);
  //     const relativePath = path.relative(path.join(__dirname, "../../"), result.path);
  //     outputFiles.push(relativePath.replace(/\\/g, "/"));
  //   }

  //   return outputFiles;
  // } catch (error) {
  //   throw new Error(`Convert PDF failed: ${error}`);
  // }
  // }
  
  async convertPdfToImages(pdfPath: string): Promise<string[]> {
    try {
      // Thư mục đầu ra
      const outputDir = path.join(__dirname, "../../public/images-convert");
      await fs.mkdir(outputDir, { recursive: true });

      // Prefix duy nhất
      const timestamp = Date.now();

      // Đọc số trang
      const pdfBuffer = await fs.readFile(pdfPath);
      const pdfData = await pdf(pdfBuffer);
      const totalPages = pdfData.numpages;

      const outputFiles: string[] = [];

      // Thiết lập option convert
      const convert = fromPath(pdfPath, {
        density: 150,
        saveFilename: "temp", // tên tạm, lát nữa rename
        savePath: outputDir,
        format: "png",
        width: 800,
        height: 1000,
        quality: 100,
      });

      const publicPath = path.resolve(__dirname, "../../public/");
      console.log(publicPath);

      // Lặp qua từng trang
      for (let i = 1; i <= totalPages; i++) {
        const result = await convert(i, { responseType: "image" });
console.log('thienthanh');
        const finalFilename = `${timestamp}_page${i}.png`;
        const finalPath = path.join(outputDir, finalFilename);

        await fs.rename(result.path, finalPath);

        // Trả về path relative
        const relativePath = path.relative(publicPath, finalPath).split(path.sep).join("/");
        outputFiles.push(relativePath);
      }

      console.log("PDF conversion completed.");
      return outputFiles;
    } catch (error) {
      console.error("Error converting PDF to images:", error);
      throw new Error(`Convert PDF failed: ${error}`);
    }
  }



  async convertPdfToImages222(pdfPath: string, outputDir: string): Promise<string[]> {
    try {
      await fs.mkdir(outputDir, { recursive: true });
      console.log(pdfPath);

      const pdfBuffer = await fs.readFile(pdfPath);
      const pdfData = await pdf(pdfBuffer);
      const totalPages = pdfData.numpages;

      const timestamp = Date.now();
      const options = {
        density: 100,
        saveFilename: "temp",
        savePath: outputDir,
        format: "png",
        width: 1000,
        height: 1000,
        quality: 100,
      };

      const convert = fromPath(pdfPath, options);
      const outputFiles: string[] = [];
      const publicPath = path.resolve(__dirname, '../../public/');

      for (let page = 1; page <= totalPages; page++) {
        const result = await convert(page, { responseType: "image" });

        const finalFilename = `${timestamp}_page${page}.png`;
        const finalPath = path.join(outputDir, finalFilename);

        await fs.rename(result.path, finalPath);

        // Chuáº©n hÃ³a path relative so vá»›i thÆ° má»¥c public
        const relativePath = path.relative(publicPath, finalPath).split(path.sep).join('/');
        outputFiles.push(relativePath);
      }

      console.log("PDF conversion completed.");
      return outputFiles;
    } catch (error) {
      console.error("Error converting PDF to images:", error);
      throw error;
    }
  }

}
