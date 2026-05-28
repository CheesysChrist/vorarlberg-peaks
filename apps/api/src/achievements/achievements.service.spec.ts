import { Test, TestingModule } from '@nestjs/testing';
import { AchievementsService } from './achievements.service';
import { PrismaService } from '../prisma/prisma.service';

const makePrismaMock = (hikes: any[], mountains: any[], existing: any[] = []) => ({
  hike: {
    findMany: jest.fn().mockResolvedValue(hikes),
  },
  mountain: {
    findMany: jest.fn().mockResolvedValue(mountains),
  },
  achievement: {
    findMany: jest.fn().mockResolvedValue(existing),
    upsert: jest.fn().mockResolvedValue({}),
  },
  $transaction: jest.fn((ops: any[]) => Promise.all(ops)),
});

const mountain = (id: string, regionId: string, altitude: number, difficulty: string) => ({
  id,
  regionId,
  altitude,
  difficulty,
});

const hike = (mountainId: string, rating: number | null = null, notes: string | null = null) => ({
  mountainId,
  rating,
  notes,
});

describe('AchievementsService', () => {
  let service: AchievementsService;
  let prismaMock: ReturnType<typeof makePrismaMock>;

  async function buildService(hikes: any[], mountains: any[]) {
    prismaMock = makePrismaMock(hikes, mountains);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AchievementsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();
    service = module.get<AchievementsService>(AchievementsService);
  }

  it('unlocks first_summit after one hike', async () => {
    const m1 = mountain('m1', 'r1', 1000, 'easy');
    await buildService([hike('m1')], [m1]);
    await service.evaluateForUser('u1');
    expect(prismaMock.achievement.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ create: expect.objectContaining({ key: 'first_summit' }) }),
    );
  });

  it('unlocks summit_5 when 5 hikes logged', async () => {
    const mountains = ['m1', 'm2', 'm3', 'm4', 'm5'].map((id) => mountain(id, 'r1', 1000, 'easy'));
    const hikes = mountains.map((m) => hike(m.id));
    await buildService(hikes, mountains);
    await service.evaluateForUser('u1');
    const keys = prismaMock.achievement.upsert.mock.calls.map((c: any) => c[0].create.key);
    expect(keys).toContain('summit_5');
    expect(keys).toContain('first_summit');
  });

  it('unlocks five_star when a hike has rating 5', async () => {
    const m1 = mountain('m1', 'r1', 1000, 'easy');
    await buildService([hike('m1', 5)], [m1]);
    await service.evaluateForUser('u1');
    const keys = prismaMock.achievement.upsert.mock.calls.map((c: any) => c[0].create.key);
    expect(keys).toContain('five_star');
  });

  it('unlocks storyteller when a hike has notes', async () => {
    const m1 = mountain('m1', 'r1', 1000, 'easy');
    await buildService([hike('m1', null, 'great hike')], [m1]);
    await service.evaluateForUser('u1');
    const keys = prismaMock.achievement.upsert.mock.calls.map((c: any) => c[0].create.key);
    expect(keys).toContain('storyteller');
  });

  it('unlocks high_2500 and high_3000 when altitude qualifies', async () => {
    const m1 = mountain('m1', 'r1', 3100, 'hard');
    await buildService([hike('m1')], [m1]);
    await service.evaluateForUser('u1');
    const keys = prismaMock.achievement.upsert.mock.calls.map((c: any) => c[0].create.key);
    expect(keys).toContain('high_2500');
    expect(keys).toContain('high_3000');
  });

  it('unlocks region_complete when all mountains in a region are hiked', async () => {
    const mountains = [
      mountain('m1', 'r1', 1000, 'easy'),
      mountain('m2', 'r1', 1200, 'moderate'),
      mountain('m3', 'r2', 1500, 'hard'),
    ];
    // only hike r1 mountains (complete that region)
    await buildService([hike('m1'), hike('m2')], mountains);
    await service.evaluateForUser('u1');
    const keys = prismaMock.achievement.upsert.mock.calls.map((c: any) => c[0].create.key);
    expect(keys).toContain('region_complete');
  });

  it('does not unlock region_complete when region is incomplete', async () => {
    const mountains = [
      mountain('m1', 'r1', 1000, 'easy'),
      mountain('m2', 'r1', 1200, 'moderate'),
    ];
    await buildService([hike('m1')], mountains);
    await service.evaluateForUser('u1');
    const keys = prismaMock.achievement.upsert.mock.calls.map((c: any) => c[0].create.key);
    expect(keys).not.toContain('region_complete');
  });

  it('unlocks all_difficulties when all 4 difficulty levels are hiked', async () => {
    const mountains = [
      mountain('m1', 'r1', 1000, 'easy'),
      mountain('m2', 'r1', 1200, 'moderate'),
      mountain('m3', 'r1', 1500, 'hard'),
      mountain('m4', 'r1', 2000, 'expert'),
    ];
    await buildService(mountains.map((m) => hike(m.id)), mountains);
    await service.evaluateForUser('u1');
    const keys = prismaMock.achievement.upsert.mock.calls.map((c: any) => c[0].create.key);
    expect(keys).toContain('all_difficulties');
  });

  it('does nothing when no hikes exist', async () => {
    await buildService([], [mountain('m1', 'r1', 1000, 'easy')]);
    await service.evaluateForUser('u1');
    expect(prismaMock.achievement.upsert).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('findAllByUser returns user achievements', async () => {
    await buildService([], []);
    await service.findAllByUser('u1');
    expect(prismaMock.achievement.findMany).toHaveBeenCalledWith({
      where: { userId: 'u1' },
      orderBy: { unlockedAt: 'asc' },
    });
  });
});
