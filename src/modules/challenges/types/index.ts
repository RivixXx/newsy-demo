export type ChallengeCategory = 'Sport' | 'Education' | 'Quest' | 'Art' | 'Tech';

export type StepType = 'Question' | 'Photo' | 'Location' | 'Action';

export interface ChallengeStep {
  id: string;
  type: StepType;
  title: string;
  description: string;
  points: number;
  options?: string[]; // For 'Question' type
  correctOptionIndex?: number; // For 'Question' type
  locationLabel?: string; // For 'Location' type
  coordinates?: { lat: number; lng: number }; // For 'Location' type
}

export interface Challenge {
  id: string;
  title: string;
  description?: string;
  organizer: string;
  category: ChallengeCategory;
  pointsReward: number;
  imageUrl: string;
  participantsCount: number;
  isJoined: boolean;
  progress?: number; // 0 to 100
  badges?: string[];
  steps?: ChallengeStep[];
  isCooperative?: boolean;
  partnerBrands?: string[];
  isRecommended?: boolean;
}
