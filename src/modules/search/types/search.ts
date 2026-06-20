import type { UUID } from '@/shared/types';
import { ChallengeStatus } from '@prisma/client';

export interface SearchFilters {
  category?: string;
  organizerId?: string;
  status?: ChallengeStatus;
}

export interface SearchState {
  sessionKey: string;
  query?: string | null;
  filters: SearchFilters;
  sort?: string | null;
  page?: number | null;
  scrollPosition?: number | null;
}

export interface SearchResultItem {
  id: UUID;
  title: string;
  organizer: string;
  category: string;
  pointsReward: number;
  imageUrl?: string | null;
  status: ChallengeStatus;
}

export interface SearchResultPage {
  items: SearchResultItem[];
  total: number;
  page: number;
  pageSize: number;
}
