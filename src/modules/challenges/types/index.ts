export type ChallengeCategory = 'Sport' | 'Education' | 'Quest' | 'Art' | 'Tech';

export type StepType = 'Question' | 'Photo' | 'Location' | 'Action' | 'VideoStory';

export type QuestionSubType = 'single' | 'multiple' | 'text' | 'rating' | 'yesno';

export interface ChallengeStep {
  id: string;
  type: StepType;
  title: string;
  description: string;
  points: number;
  // Question type fields
  questionType?: QuestionSubType; // Sub-type for 'Question' steps
  options?: string[]; // For 'single' and 'multiple' question types
  correctOptionIndex?: number; // For 'single' question type
  correctOptionIndices?: number[]; // For 'multiple' question type
  minLength?: number; // For 'text' question type
  maxLength?: number; // For 'text' question type
  ratingMin?: number; // For 'rating' question type
  ratingMax?: number; // For 'rating' question type
  ratingMinLabel?: string; // For 'rating' question type
  ratingMaxLabel?: string; // For 'rating' question type
  // Location type fields
  locationLabel?: string; // For 'Location' type
  coordinates?: { lat: number; lng: number }; // For 'Location' type
  // A/B testing
  variant?: 'A' | 'B';
  parentStepId?: string;
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
  achievement?: string;
  reward?: string;
  maxParticipants?: number;
  endDate?: string;
  format?: 'ONLINE' | 'OFFLINE' | 'HYBRID';
  address?: string;
  latitude?: number;
  longitude?: number;
  // Branded Challenge fields
  brandLogoUrl?: string;
  brandPrimaryColor?: string;
  brandSecondaryColor?: string;
  brandBannerUrl?: string;
  sponsorName?: string;
  sponsorUrl?: string;
}
