import { FileType } from './entities/file-type.entity';
import { Module } from '@nestjs/common';
import { FileTypeService } from './file-type.service';
import { FileTypeController } from './file-type.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports:[TypeOrmModule.forFeature([FileType])],
  controllers: [FileTypeController],
  providers: [FileTypeService],
  exports: [FileTypeService,TypeOrmModule]
})
export class FileTypeModule {}
