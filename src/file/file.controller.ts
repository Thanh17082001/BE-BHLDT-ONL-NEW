import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, Req, Query, UseGuards } from '@nestjs/common';
import { FileService } from './file.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions, storage } from 'src/config/multer';
import { generateImageFromVideo } from 'src/utils/generate-thumbnail-video';
import { resizeImage } from 'src/utils/resize-image';
import { ReplacePathFile } from 'src/utils/replace-path-file';
import { Public } from 'src/auth/auth.decorator';
import { PageOptionsDto } from 'src/common/pagination/page-option-dto';
import { Roles } from 'src/role/role.decorator';
import { Role } from 'src/role/role.enum';
import { RolesGuard } from 'src/role/role.guard';

@Controller('file')
  @UseGuards(RolesGuard)
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post()
    @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Upload file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File upload',
    type: CreateFileDto,
  })
  @UseInterceptors(FileInterceptor('file', { storage: storage('', true), ...multerOptions }))
  async create(@UploadedFile() file: Express.Multer.File, @Body() createFileDto: CreateFileDto, @Req() request: Request) {
    const user = request['user'] ?? null;

    let images = [];
    createFileDto.path = '';
    let fileSize = file?.size / (1024 * 1024) || 0;
    if (file) {
      createFileDto.isFolder = false
      createFileDto.mimetype = file.mimetype;
      if (file.mimetype == 'application/pdf') {
        const convertPdftoimage = await this.fileService.convertPdfToImages(file?.path);
        images = convertPdftoimage;
        createFileDto.path = `public/pdf/${file.filename}`;
        createFileDto.previewImage = images.length > 0 ? images[0] : createFileDto.path;
      } else if (file.mimetype == 'video/mp4') {
        const generateImage = await generateImageFromVideo(`/video/${file.filename}`);
        createFileDto.previewImage = generateImage.path;
        fileSize += generateImage.sizeMB;
        createFileDto.path = `public/video/${file.filename}`;
      } else if (file.mimetype == 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
        createFileDto.path = `public/ptt/${file.filename}`;
        createFileDto.previewImage = 'public/default/default-ptt.jpg';
      } else if (file.mimetype == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        createFileDto.path = `public/word/${file.filename}`;
        createFileDto.previewImage = 'public/default/default-word.jpg';
      } else {
        const link: string = await resizeImage(file);
        createFileDto.path = `/public/image/${file.filename}`;
        createFileDto.previewImage = ReplacePathFile(link);
     
   }
    }
    return await this.fileService.create(createFileDto, images,user);

  }

  @Get()
    @Roles(Role.TEACHER)
    async findAll(@Query() pageOptionDto: PageOptionsDto, @Query() query: Partial<File>, @Req() request: Request) {
      const user = request['user'] ?? null;
      return this.fileService.findAll(pageOptionDto, query, user);
    }

  @Get(':id')
  @Roles(Role.TEACHER)

  findOne(@Param('id') id: string) {
    return this.fileService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Role.TEACHER)

  update(@Param('id') id: string, @Body() updateFileDto: UpdateFileDto) {
    return this.fileService.update(+id, updateFileDto);
  }

  @Delete(':id')
  @Roles(Role.TEACHER)
  remove(@Param('id') id: string, @Req() request: Request) {
    const user = request['user'] ?? null;
    return this.fileService.remove(+id, user);
  }
}
