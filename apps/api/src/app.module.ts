import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { MountainsModule } from './mountains/mountains.module';
import { RegionsModule } from './regions/regions.module';
import { HikesModule } from './hikes/hikes.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    MountainsModule,
    RegionsModule,
    HikesModule,
  ],
})
export class AppModule {}
