import React from 'react';
import { UserProfile } from '@/modules/identity/components/user-profile';
import { GamifiedProfile } from '@/modules/identity/types/gamification';
import { PageShell } from '@/shared/components/page-shell';

const MOCK_PROFILE: GamifiedProfile = {
  level: 12,
  experience: 750,
  nextLevelExperience: 1000,
  totalPoints: 12540,
  rating: 42,
  completedChallengesCount: 15,
  activeChallengesCount: 3,
  badgesCount: 8,
  achievements: [
    {
      id: '1',
      title: 'First Step',
      description: 'Complete your first challenge step',
      icon: '🚀',
      isEarned: true,
      earnedAt: '2023-10-01'
    },
    {
      id: '2',
      title: 'Social Butterfly',
      description: 'Share 5 challenges with friends',
      icon: '🦋',
      isEarned: true,
      earnedAt: '2023-10-05'
    },
    {
      id: '3',
      title: 'Night Owl',
      description: 'Complete a challenge after midnight',
      icon: '🦉',
      isEarned: true,
      earnedAt: '2023-10-10'
    },
    {
      id: '4',
      title: 'Top Contributor',
      description: 'Reach top 100 in global rating',
      icon: '🏆',
      isEarned: true,
      earnedAt: '2023-10-15'
    },
    {
      id: '5',
      title: 'Marathoner',
      description: 'Complete 50 steps',
      icon: '🏃',
      isEarned: false,
      milestoneCurrent: 32,
      milestoneTotal: 50
    },
    {
      id: '6',
      title: 'Explorer',
      description: 'Visit 10 different locations',
      icon: '🗺️',
      isEarned: false,
      milestoneCurrent: 4,
      milestoneTotal: 10
    },
    {
      id: '7',
      title: 'Team Player',
      description: 'Join a cooperative challenge',
      icon: '🤝',
      isEarned: false,
      milestoneCurrent: 0,
      milestoneTotal: 1
    },
    {
      id: '8',
      title: 'Early Bird',
      description: 'Complete a challenge before 8 AM',
      icon: '☀️',
      isEarned: false,
      milestoneCurrent: 0,
      milestoneTotal: 1
    }
  ],
  recentActivity: [
    {
      id: 'a1',
      type: 'STEP_COMPLETED',
      title: 'Shared "Morning Coffee" challenge',
      timestamp: new Date().toISOString(),
      points: 50
    },
    {
      id: 'a2',
      type: 'CHALLENGE_COMPLETED',
      title: 'Completed "City Explorer" quest',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      points: 500
    },
    {
      id: 'a3',
      type: 'BADGE_EARNED',
      title: 'Earned "Top Contributor" trophy',
      timestamp: new Date(Date.now() - 172800000).toISOString()
    }
  ]
};

export default function ProfilePage() {
  return (
    <PageShell>
      <UserProfile 
        profile={MOCK_PROFILE} 
        userName="Alex Rivera" 
        avatarUrl="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
      />
    </PageShell>
  );
}
