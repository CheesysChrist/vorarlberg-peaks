import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  summitCount: number;
  isCurrentUser: boolean;
}

@Injectable()
export class LeaderboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getLeaderboard(limit = 10, currentUserId?: string): Promise<LeaderboardEntry[]> {
    const grouped = await this.prisma.hike.groupBy({
      by: ['userId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: limit,
    });

    if (grouped.length === 0) return [];

    const userIds = grouped.map((g) => g.userId);
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, username: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u.username]));

    return grouped.map((g, idx) => ({
      rank: idx + 1,
      userId: g.userId,
      username: userMap.get(g.userId) ?? 'Unknown',
      summitCount: g._count.id,
      isCurrentUser: g.userId === currentUserId,
    }));
  }
}
