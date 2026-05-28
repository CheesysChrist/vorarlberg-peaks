import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LeaderboardService } from './leaderboard.service';
import { OptionalJwtGuard } from '../auth/guards/optional-jwt.guard';
import type { AuthUser } from '../auth/types';

@ApiTags('leaderboard')
@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get()
  @UseGuards(OptionalJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Top hikers by summit count' })
  getLeaderboard(@Query('limit') limitStr?: string, @Req() req?: any) {
    const limit = Math.min(parseInt(limitStr ?? '10', 10) || 10, 50);
    const user = req?.user as AuthUser | undefined;
    return this.leaderboardService.getLeaderboard(limit, user?.id);
  }
}
