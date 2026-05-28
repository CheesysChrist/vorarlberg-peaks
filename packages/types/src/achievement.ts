export const ACHIEVEMENT_KEYS = [
  'first_summit',
  'summit_5',
  'summit_10',
  'summit_25',
  'summit_50',
  'region_complete',
  'high_2500',
  'high_3000',
  'all_difficulties',
  'five_star',
  'storyteller',
] as const;

export type AchievementKey = (typeof ACHIEVEMENT_KEYS)[number];

export interface AchievementRecord {
  id: string;
  userId: string;
  key: AchievementKey;
  unlockedAt: string;
}
