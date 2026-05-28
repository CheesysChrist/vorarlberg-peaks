import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './api-client';
import type { MountainWithHikeStatus, PaginatedResponse, Region, CreateHikeDto, Hike } from '@vorarlberg-peaks/types';

export const queryKeys = {
  mountains: (params?: object) => ['mountains', params] as const,
  regions: () => ['regions'] as const,
  hikes: () => ['hikes'] as const,
  leaderboard: () => ['leaderboard'] as const,
};

export function useMountains(params?: {
  regionId?: string;
  difficulty?: string;
  search?: string;
  hiked?: boolean;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: queryKeys.mountains(params),
    queryFn: () =>
      apiClient.get<PaginatedResponse<MountainWithHikeStatus>>('/mountains', { params }).then((r) => r.data),
  });
}

export function useRegions() {
  return useQuery({
    queryKey: queryKeys.regions(),
    queryFn: () => apiClient.get<Region[]>('/regions').then((r) => r.data),
  });
}

export function useLogHike() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateHikeDto) => apiClient.post('/hikes', dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.mountains() });
      queryClient.invalidateQueries({ queryKey: queryKeys.hikes() });
    },
  });
}

export function useHikes(enabled = true) {
  return useQuery({
    queryKey: queryKeys.hikes(),
    queryFn: () => apiClient.get<Hike[]>('/hikes').then((r) => r.data),
    enabled,
  });
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  summitCount: number;
  isCurrentUser: boolean;
}

export function useLeaderboard() {
  return useQuery({
    queryKey: queryKeys.leaderboard(),
    queryFn: () => apiClient.get<LeaderboardEntry[]>('/leaderboard?limit=10').then((r) => r.data),
    staleTime: 60_000,
  });
}

export function useRemoveHike() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (mountainId: string) => apiClient.delete(`/hikes/${mountainId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.mountains() });
      queryClient.invalidateQueries({ queryKey: queryKeys.hikes() });
    },
  });
}
