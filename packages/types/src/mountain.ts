export interface Mountain {
  id: string;
  name: string;
  nameDe: string | null;
  altitude: number;
  latitude: number;
  longitude: number;
  regionId: string;
  region?: Region;
  difficulty: MountainDifficulty | null;
  description: string | null;
  routeNotes: string | null;
  imageUrl: string | null;
  externalId: string | null;
  createdAt: string;
  updatedAt: string;
}

export type MountainDifficulty = 'easy' | 'moderate' | 'hard' | 'expert';

export interface MountainWithHikeStatus extends Mountain {
  hiked: boolean;
  hikedAt: string | null;
}

export interface MountainsFilter {
  regionId?: string;
  difficulty?: MountainDifficulty;
  hiked?: boolean;
  search?: string;
}

import type { Region } from './region';
