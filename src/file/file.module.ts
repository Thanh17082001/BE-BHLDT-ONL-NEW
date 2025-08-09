import { forwardRef, Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from './entities/file.entity';
import { ImageModule } from 'src/image/image.module';
import { SchoolsModule } from 'src/schools/schools.module';
import { FileTypeModule } from 'src/file-type/file-type.module';
import { TopicsModule } from 'src/topics/topics.module';
import { SubjectsModule } from 'src/subjects/subjects.module';

@Module({
  imports: [TypeOrmModule.forFeature([File]), forwardRef(() => ImageModule), SchoolsModule, FileTypeModule,TopicsModule, SubjectsModule],
  controllers: [FileController],
  providers: [FileService],
  exports:[FileService,TypeOrmModule]
})
export class FileModule {}
