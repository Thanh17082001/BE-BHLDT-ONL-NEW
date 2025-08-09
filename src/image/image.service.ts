import { Injectable } from '@nestjs/common';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { Image } from './entities/image.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from 'src/file/entities/file.entity';
import { FileService } from 'src/file/file.service';

@Injectable()
export class ImageService {

  constructor(
    @InjectRepository(Image) private repo: Repository<Image>,
    @InjectRepository(File) private fileRepository: Repository<File>,
    private readonly fileService: FileService,
    
    ) { }
  async create(createImageDto: Partial<CreateImageDto>): Promise<Image> {
    const { name, fileId, path } = createImageDto;
    const file = await this.fileRepository.findOne({ where: { id: +fileId }, relations: ['images'] });


    const cls = this.repo.create({ name, file, path });
    if (!file.images) {
      file.images = [];
    }
    file.images.push(cls)

    await this.fileService.update(file.id, file)
    return cls
  }

  findAll() {
    return `This action returns all image`;
  }

  findOne(id: number) {
    return `This action returns a #${id} image`;
  }

  update(id: number, updateImageDto: UpdateImageDto) {
    return `This action updates a #${id} image`;
  }

  remove(id: number) {
    return `This action removes a #${id} image`;
  }
}
