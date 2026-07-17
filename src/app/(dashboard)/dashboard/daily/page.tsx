import Link from 'next/link';
import type { CSSProperties } from 'react';
import { prisma } from '@/lib/db';
import { getCurrentAuthSession } from '@/lib/session';
import { PageShell } from '@/shared/components/page-shell';
import { ArrowLeft, Calendar, CheckCircle2, Flame, Lock, Star } from 'lucide-react';

interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  completed: boolean;
}

async function getDailyChallenges(userId?: string): Promise<DailyChallenge[]> {
  if (!userId) return [];

  try {
    // Получаем сегодняшние ежедневные задания
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Используем статические задания для MVP
    const DAILY_CHALLENGES: DailyChallenge[] = [
      {
        id: 'daily-photo',
        title: '📸 Фото дня',
        description: 'Сфотографируйте что-то интересное рядом с вами',
        category: 'creative',
        difficulty: 'easy',
        points: 10,
        completed: false,
      },
      {
        id: 'daily-steps',
        title: '🏃 5000 шагов',
        description: 'Пройдите минимум 5000 шагов сегодня',
        category: 'sport',
        difficulty: 'medium',
        points: 20,
        completed: false,
      },
      {
        id: 'daily-read',
        title: '📚 20 минут чтения',
        description: 'Почитайте книгу или статью 20 минут',
        category: 'education',
        difficulty: 'easy',
        points: 15,
        completed: false,
      },
      {
        id: 'daily-water',
        title: '💧 8 стаканов воды',
        description: 'Выпейте минимум 2 литра воды сегодня',
        category: 'health',
        difficulty: 'easy',
        points: 10,
        completed: false,
      },
      {
        id: 'daily-workout',
        title: '💪 Мини-тренировка',
        description: 'Сделайте 50 отжиманий или 100 приседаний',
        category: 'sport',
        difficulty: 'hard',
        points: 30,
        completed: false,
      },
      {
        id: 'daily-quiz',
        title: '🧠 Викторина',
        description: 'Ответьте на 5 вопросов из разных категорий',
        category: 'education',
        difficulty: 'medium',
        points: 20,
        completed: false,
      },
    ];

    // Возвращаем 3 случайных задания на сегодня
    const shuffled = DAILY_CHALLENGES.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  } catch {
    return [];
  }
}

async function getStreak(userId?: string): Promise<number> {
  if (!userId) return 0;
  // MVP: заглушка
  return 3;
}

function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'easy': return '#22c55e';
    case 'medium': return '#f59e0b';
    case 'hard': return '#ef4444';
    default: return '#6b7280';
  }
}

function getDifficultyLabel(difficulty: string): string {
  switch (difficulty) {
    case 'easy': return 'Легко';
    case 'medium': return 'Средне';
    case 'hard': return 'Сложно';
    default: return difficulty;
  }
}

export default async function DailyPage() {
  const session = await getCurrentAuthSession();
  const challenges = await getDailyChallenges(session?.user.id);
  const streak = await getStreak(session?.user.id);

  return (
    <PageShell>
      <main style={styles.page}>
        <Link href="/dashboard" style={styles.backLink}>
          <ArrowLeft size={16} /> Назад к дашборду
        </Link>

        <header style={styles.header}>
          <Calendar size={32} color="#FF385C" />
          <div>
            <h1 style={styles.title}>Ежедневные задания</h1>
            <p style={styles.subtitle}>Выполняйте каждый день и получайте бонусы!</p>
          </div>
        </header>

        {/* Серия дней */}
        <div style={styles.streakCard}>
          <Flame size={32} color="#FF385C" />
          <div>
            <span style={styles.streakValue}>{streak} дн.</span>
            <span style={styles.streakLabel}>Серия подряд</span>
          </div>
        </div>

        {/* Задания на сегодня */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <Star size={18} /> Сегодня
          </h2>
          <div style={styles.challengesList}>
            {challenges.map(challenge => (
              <div key={challenge.id} style={{
                ...styles.challengeCard,
                borderLeftColor: getDifficultyColor(challenge.difficulty),
              }}>
                <div style={styles.challengeHeader}>
                  <div>
                    <h3 style={styles.challengeTitle}>{challenge.title}</h3>
                    <p style={styles.challengeDesc}>{challenge.description}</p>
                  </div>
                  <div style={styles.pointsBadge}>+{challenge.points}</div>
                </div>
                <div style={styles.challengeFooter}>
                  <span style={{
                    ...styles.difficultyBadge,
                    background: getDifficultyColor(challenge.difficulty) + '18',
                    color: getDifficultyColor(challenge.difficulty),
                  }}>
                    {getDifficultyLabel(challenge.difficulty)}
                  </span>
                  <span style={styles.categoryBadge}>{challenge.category}</span>
                  <button style={styles.completeBtn}>
                    <CheckCircle2 size={16} /> Выполнено
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* История */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Как это работает</h2>
          <div style={styles.howItWorks}>
            <div style={styles.howStep}>
              <div style={styles.howNum}>1</div>
              <p>Каждый день появляются 3 новых задания</p>
            </div>
            <div style={styles.howStep}>
              <div style={styles.howNum}>2</div>
              <p>Выполняйте и отмечайте как выполненные</p>
            </div>
            <div style={styles.howStep}>
              <div style={styles.howNum}>3</div>
              <p>Собирайте серию дней и получайте бонусы</p>
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    padding: '20px clamp(12px, 3vw, 24px)',
    maxWidth: 700,
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 14,
    fontWeight: 600,
    color: '#666',
    textDecoration: 'none',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  title: {
    margin: 0,
    fontSize: 'clamp(24px, 3vw, 32px)',
    fontWeight: 900,
    letterSpacing: '-0.02em',
  },
  subtitle: {
    margin: 0,
    fontSize: 14,
    color: '#888',
  },
  streakCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: 24,
    background: 'linear-gradient(135deg, #FFF1F2, #FFE4E6)',
    borderRadius: 20,
    border: '2px solid #FECDD3',
  },
  streakValue: {
    display: 'block',
    fontSize: 28,
    fontWeight: 900,
    color: '#FF385C',
  },
  streakLabel: {
    display: 'block',
    fontSize: 13,
    color: '#9F1239',
    fontWeight: 600,
  },
  section: {
    background: 'rgba(255,255,255,0.85)',
    border: '1px solid rgba(29,26,22,0.08)',
    borderRadius: 20,
    padding: 24,
  },
  sectionTitle: {
    margin: '0 0 16px 0',
    fontSize: 16,
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  challengesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  challengeCard: {
    padding: 16,
    background: '#fafafa',
    borderRadius: 14,
    borderLeft: '4px solid',
  },
  challengeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  challengeTitle: {
    margin: 0,
    fontSize: 16,
    fontWeight: 700,
  },
  challengeDesc: {
    margin: '4px 0 0',
    fontSize: 13,
    color: '#666',
  },
  pointsBadge: {
    padding: '4px 10px',
    background: '#FF385C',
    color: 'white',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 800,
    flexShrink: 0,
  },
  challengeFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  difficultyBadge: {
    padding: '4px 8px',
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 700,
  },
  categoryBadge: {
    padding: '4px 8px',
    background: '#f3f4f6',
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 600,
    color: '#666',
  },
  completeBtn: {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    padding: '8px 14px',
    background: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    color: '#22c55e',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  howItWorks: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  howStep: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  howNum: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    background: '#FF385C',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 800,
    flexShrink: 0,
  },
};
