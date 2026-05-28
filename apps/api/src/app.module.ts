import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { MountainsModule } from './mountains/mountains.module';
import { RegionsModule } from './regions/regions.module';
import { HikesModule } from './hikes/hikes.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    MountainsModule,
    RegionsModule,
    HikesModule,
    LeaderboardModule,
  ],
})
export class AppModule {}
