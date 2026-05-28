import type { Hike, MountainWithHikeStatus } from '@vorarlberg-peaks/types';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: { current: number; total: number };
}

export interface UserStats {
  totalSummits: number;
  totalElevation: number;
  highestPeak: MountainWithHikeStatus | null;
  regionsExplored: number;
  level: { number: number; title: string; currentMin: number; nextAt: number | null };
}

export const LEVELS = [
  { min: 0, title: 'Wanderer', nextAt: 5 },
  { min: 5, title: 'Hiker', nextAt: 10 },
  { min: 10, title: 'Trail Runner', nextAt: 25 },
  { min: 25, title: 'Summit Seeker', nextAt: 50 },
  { min: 50, title: 'Peak Bagger', nextAt: 100 },
  { min: 100, title: 'Mountain Legend', nextAt: null },
];

export function computeStats(hikes: Hike[], mountains: MountainWithHikeStatus[]): UserStats {
  const hiked = mountains.filter((m) => m.hiked);
  const totalElevation = hiked.reduce((sum, m) => sum + m.altitude, 0);
  const highestPeak = hiked.reduce<MountainWithHikeStatus | null>(
    (max, m) => (!max || m.altitude > max.altitude ? m : max),
    null
  );
  const regionsExplored = new Set(hiked.map((m) => m.regionId)).size;
  const totalSummits = hiked.length;
  const levelData = [...LEVELS].reverse().find((l) => totalSummits >= l.min) ?? LEVELS[0];

  return {
    totalSummits,
    totalElevation,
    highestPeak,
    regionsExplored,
    level: {
      number: LEVELS.indexOf(levelData) + 1,
      title: levelData.title,
      currentMin: levelData.min,
      nextAt: levelData.nextAt,
    },
  };
}

export function computeAchievements(hikes: Hike[], mountains: MountainWithHikeStatus[]): Achievement[] {
  const hiked = mountains.filter((m) => m.hiked);
  const n = hiked.length;

  const byRegion = mountains.reduce<Record<string, { total: number; hiked: number }>>((acc, m) => {
    const rid = m.regionId;
    if (!acc[rid]) acc[rid] = { total: 0, hiked: 0 };
    acc[rid].total++;
    if (m.hiked) acc[rid].hiked++;
    return acc;
  }, {});
  const regionComplete = Object.values(byRegion).some((r) => r.total > 0 && r.total === r.hiked);

  const difficulties = ['easy', 'moderate', 'hard', 'expert'] as const;
  const diffHikedCount = difficulties.filter((d) => hiked.some((m) => m.difficulty === d)).length;

  const highestHiked = hiked.reduce((max, m) => Math.max(max, m.altitude), 0);

  return [
    {
      id: 'first_summit',
      title: 'First Summit',
      description: 'Log your very first hike',
      icon: '🏔️',
      unlocked: n >= 1,
    },
    {
      id: 'summit_5',
      title: 'Trail Blazer',
      description: 'Reach 5 summits',
      icon: '🥾',
      unlocked: n >= 5,
      progress: { current: Math.min(n, 5), total: 5 },
    },
    {
      id: 'summit_10',
      title: 'Summit Hunter',
      description: 'Reach 10 summits',
      icon: '🎯',
      unlocked: n >= 10,
      progress: { current: Math.min(n, 10), total: 10 },
    },
    {
      id: 'summit_25',
      title: 'Peak Collector',
      description: 'Reach 25 summits',
      icon: '🗺️',
      unlocked: n >= 25,
      progress: { current: Math.min(n, 25), total: 25 },
    },
    {
      id: 'summit_50',
      title: 'Mountain Master',
      description: 'Reach 50 summits',
      icon: '👑',
      unlocked: n >= 50,
      progress: { current: Math.min(n, 50), total: 50 },
    },
    {
      id: 'region_complete',
      title: 'Region Conqueror',
      description: 'Complete all peaks in any single region',
      icon: '🏆',
      unlocked: regionComplete,
    },
    {
      id: 'high_2500',
      title: 'High Flyer',
      description: 'Summit a peak above 2500m',
      icon: '✈️',
      unlocked: highestHiked >= 2500,
    },
    {
      id: 'high_3000',
      title: 'Skywalker',
      description: 'Summit a peak above 3000m',
      icon: '⚡',
      unlocked: highestHiked >= 3000,
    },
    {
      id: 'all_difficulties',
      title: 'Well Rounded',
      description: 'Hike peaks of every difficulty level',
      icon: '🌈',
      unlocked: diffHikedCount === 4,
      progress: { current: diffHikedCount, total: 4 },
    },
    {
      id: 'five_star',
      title: 'Five Star Summit',
      description: 'Give a 5-star rating to a summit',
      icon: '⭐',
      unlocked: hikes.some((h) => h.rating === 5),
    },
    {
      id: 'storyteller',
      title: 'Storyteller',
      description: 'Add notes to a hike',
      icon: '📝',
      unlocked: hikes.some((h) => !!h.notes?.trim()),
    },
  ];
}
