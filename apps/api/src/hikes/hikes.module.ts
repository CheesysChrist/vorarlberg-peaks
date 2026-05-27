import { Module } from '@nestjs/common';
import { HikesController } from './hikes.controller';
import { HikesService } from './hikes.service';

@Module({
  controllers: [HikesController],
  providers: [HikesService],
})
export class HikesModule {}
