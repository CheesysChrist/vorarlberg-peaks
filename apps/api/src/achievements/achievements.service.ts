import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const ACHIEVEMENT_EVALUATORS: {
  key: string;
  check: (ctx: EvalContext) => boolean;
}[] = [
  { key: 'first_summit', check: ({ n }) => n >= 1 },
  { key: 'summit_5', check: ({ n }) => n >= 5 },
  { key: 'summit_10', check: ({ n }) => n >= 10 },
  { key: 'summit_25', check: ({ n }) => n >= 25 },
  { key: 'summit_50', check: ({ n }) => n >= 50 },
  {
    key: 'region_complete',
    check: ({ byRegion }) =>
      Object.values(byRegion).some((r) => r.total > 0 && r.total === r.hiked),
  },
  { key: 'high_2500', check: ({ maxAltitude }) => maxAltitude >= 2500 },
  { key: 'high_3000', check: ({ maxAltitude }) => maxAltitude >= 3000 },
  {
    key: 'all_difficulties',
    check: ({ difficulties }) =>
      ['easy', 'moderate', 'hard', 'expert'].every((d) => difficulties.has(d)),
  },
  { key: 'five_star', check: ({ hikes }) => hikes.some((h) => h.rating === 5) },
  {
    key: 'storyteller',
    check: ({ hikes }) => hikes.some((h) => !!h.notes?.trim()),
  },
];

interface EvalContext {
  n: number;
  hikes: { rating: number | null; notes: string | null }[];
  maxAltitude: number;
  difficulties: Set<string>;
  byRegion: Record<string, { total: number; hiked: number }>;
}

@Injectable()
export class AchievementsService {
  constructor(private readonly prisma: PrismaService) {}

  findAllByUser(userId: string) {
    return this.prisma.achievement.findMany({
      where: { userId },
      orderBy: { unlockedAt: 'asc' },
    });
  }

  async evaluateForUser(userId: string): Promise<void> {
    const [hikes, mountains] = await Promise.all([
      this.prisma.hike.findMany({
        where: { userId },
        select: { mountainId: true, rating: true, notes: true },
      }),
      this.prisma.mountain.findMany({
        select: { id: true, regionId: true, difficulty: true, altitude: true },
      }),
    ]);

    const hikedIds = new Set(hikes.map((h) => h.mountainId));
    const hikedMountains = mountains.filter((m) => hikedIds.has(m.id));

    const byRegion = mountains.reduce<Record<string, { total: number; hiked: number }>>((acc, m) => {
      if (!acc[m.regionId]) acc[m.regionId] = { total: 0, hiked: 0 };
      acc[m.regionId].total++;
      if (hikedIds.has(m.id)) acc[m.regionId].hiked++;
      return acc;
    }, {});

    const ctx: EvalContext = {
      n: hikedMountains.length,
      hikes,
      maxAltitude: hikedMountains.reduce((max, m) => Math.max(max, m.altitude), 0),
      difficulties: new Set(hikedMountains.map((m) => m.difficulty).filter(Boolean) as string[]),
      byRegion,
    };

    const toUnlock = ACHIEVEMENT_EVALUATORS.filter((e) => e.check(ctx)).map((e) => e.key);

    if (toUnlock.length === 0) return;

    await this.prisma.$transaction(
      toUnlock.map((key) =>
        this.prisma.achievement.upsert({
          where: { userId_key: { userId, key } },
          create: { userId, key },
          update: {},
        }),
      ),
    );
  }
}
