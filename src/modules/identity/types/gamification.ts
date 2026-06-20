export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // Emoji or Lucide icon name
  isEarned: boolean;
  earnedAt?: string;
  milestoneTotal?: number;
  milestoneCurrent?: number;
}

export interface UserActivity {
  id: string;
  type: 'CHALLENGE_COMPLETED' | 'STEP_COMPLETED' | 'BADGE_EARNED';
  title: string;
  timestamp: string;
  points?: number;
}

export interface GamifiedProfile {
  level: number;
  experience: number;
  nextLevelExperience: number;
  totalPoints: number;
  rating: number;
  completedChallengesCount: number;
  activeChallengesCount: number;
  badgesCount: number;
  achievements: Achievement[];
  recentActivity: UserActivity[];
}
