import type { Hike, MountainWithHikeStatus } from '@vorarlberg-peaks/types';
import { t } from '@/lib/i18n';

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
  hikedThisYear: number;
  level: { number: number; title: string; currentMin: number; nextAt: number | null };
}

const l = t.achievements.levels;
export const LEVELS = [
  { min: 0, title: l[0], nextAt: 5 },
  { min: 5, title: l[1], nextAt: 10 },
  { min: 10, title: l[2], nextAt: 25 },
  { min: 25, title: l[3], nextAt: 50 },
  { min: 50, title: l[4], nextAt: 100 },
  { min: 100, title: l[5], nextAt: null },
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
  const currentYear = new Date().getFullYear();
  const hikedThisYear = hikes.filter((h) => new Date(h.hikedAt).getFullYear() === currentYear).length;
  const levelData = [...LEVELS].reverse().find((l) => totalSummits >= l.min) ?? LEVELS[0];

  return {
    totalSummits,
    totalElevation,
    highestPeak,
    regionsExplored,
    hikedThisYear,
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

  const titles = t.achievements.achievementTitles;
  const descs = t.achievements.achievementDescriptions;
  return [
    {
      id: 'first_summit',
      title: titles.first_summit,
      description: descs.first_summit,
      icon: '🏔️',
      unlocked: n >= 1,
    },
    {
      id: 'summit_5',
      title: titles.summit_5,
      description: descs.summit_5,
      icon: '🥾',
      unlocked: n >= 5,
      progress: { current: Math.min(n, 5), total: 5 },
    },
    {
      id: 'summit_10',
      title: titles.summit_10,
      description: descs.summit_10,
      icon: '🎯',
      unlocked: n >= 10,
      progress: { current: Math.min(n, 10), total: 10 },
    },
    {
      id: 'summit_25',
      title: titles.summit_25,
      description: descs.summit_25,
      icon: '🗺️',
      unlocked: n >= 25,
      progress: { current: Math.min(n, 25), total: 25 },
    },
    {
      id: 'summit_50',
      title: titles.summit_50,
      description: descs.summit_50,
      icon: '👑',
      unlocked: n >= 50,
      progress: { current: Math.min(n, 50), total: 50 },
    },
    {
      id: 'region_complete',
      title: titles.region_complete,
      description: descs.region_complete,
      icon: '🏆',
      unlocked: regionComplete,
    },
    {
      id: 'high_2500',
      title: titles.high_2500,
      description: descs.high_2500,
      icon: '✈️',
      unlocked: highestHiked >= 2500,
    },
    {
      id: 'high_3000',
      title: titles.high_3000,
      description: descs.high_3000,
      icon: '⚡',
      unlocked: highestHiked >= 3000,
    },
    {
      id: 'all_difficulties',
      title: titles.all_difficulties,
      description: descs.all_difficulties,
      icon: '🌈',
      unlocked: diffHikedCount === 4,
      progress: { current: diffHikedCount, total: 4 },
    },
    {
      id: 'five_star',
      title: titles.five_star,
      description: descs.five_star,
      icon: '⭐',
      unlocked: hikes.some((h) => h.rating === 5),
    },
    {
      id: 'storyteller',
      title: titles.storyteller,
      description: descs.storyteller,
      icon: '📝',
      unlocked: hikes.some((h) => !!h.notes?.trim()),
    },
  ];
}
