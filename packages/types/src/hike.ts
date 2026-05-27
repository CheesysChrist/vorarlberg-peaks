export interface Hike {
  id: string;
  userId: string;
  mountainId: string;
  mountain?: import('./mountain').Mountain;
  hikedAt: string;
  notes: string | null;
  rating: number | null;
  createdAt: string;
}

export interface CreateHikeDto {
  mountainId: string;
  hikedAt: string;
  notes?: string;
  rating?: number;
}
