import { forwardRef, Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { ImageController } from './image.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileModule } from 'src/file/file.module';
import { Image } from './entities/image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Image]), forwardRef(() => FileModule),],
  controllers: [ImageController],
  providers: [ImageService],
  exports:[TypeOrmModule,ImageService]
})
export class ImageModule {}
