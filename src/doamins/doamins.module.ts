import { Module } from '@nestjs/common';
import { DoaminsService } from './doamins.service';
import { DoaminsController } from './doamins.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doamin } from './entities/doamin.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Doamin])],
  controllers: [DoaminsController],
  providers: [DoaminsService],
  exports: [DoaminsService, TypeOrmModule],
})
export class DoaminsModule {}
