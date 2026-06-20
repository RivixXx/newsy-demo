'use client';

import Link from 'next/link';
import { Users, Zap, ArrowLeft, Trophy, Clock } from 'lucide-react';
import styles from './challenge-detail.module.css';

export default function ChallengeDetailContent({ challengeId }: { challengeId: string }) {
  const steps = [
    {
      title: 'Регистрация',
      description: 'Зарегистрируйтесь на забег в приложении Nike.',
      type: 'ДЕЙСТВИЕ',
      points: 50,
    },
    {
      title: 'Прибытие на точку',
      description: 'Придите к главному входу в парк Горького.',
      type: 'ГЕО',
      points: 50,
    },
    {
      title: 'Фото с разминки',
      description: 'Сделайте селфи на месте старта с хэштегом #NikeRun',
      type: 'ФОТО',
      points: 100,
    },
    {
      title: 'Финиш',
      description: 'Зафиксируйте время прохождения дистанции в трекере.',
      type: 'ДЕЙСТВИЕ',
      points: 100,
    },
  ];

  return (
    <div className={styles.pageWrapper}>
      {/* HERO БЛОК */}
      <section className={styles.heroSection}>
        <div className={styles.heroBg}>
          <img
            src="https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1600&q=80"
            alt="Challenge"
          />
          <div className={styles.heroOverlay} />
        </div>

        <div className={styles.heroContent}>
          <Link href="/" className={styles.backLink}>
            <ArrowLeft size={20} /> В каталог
          </Link>

          <div className={styles.heroTextBlock}>
            <span className={styles.categoryPill}>Спорт</span>
            <h1 className={styles.heroTitle}>Утренний забег на 5км</h1>

            <div className={styles.organizerBlock}>
              <img
                src={`https://picsum.photos/seed/avatar${challengeId}/100/100`}
                alt="org"
                className={styles.orgAvatar}
              />
              <span>
                Организатор: <strong>Nike Run Club</strong>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ГЛАВНЫЙ КОНТЕНТ */}
      <main className={styles.mainContent}>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statReward}`}>
              <Zap size={24} color="white" />
            </div>
            <div className={styles.statText}>
              <span className={styles.statVal}>300 БАЛЛОВ</span>
              <span className={styles.statLbl}>Общая награда</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statUsers}`}>
              <Users size={24} color="white" />
            </div>
            <div className={styles.statText}>
              <span className={styles.statVal}>1 240</span>
              <span className={styles.statLbl}>Участников</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statTime}`}>
              <Clock size={24} color="white" />
            </div>
            <div className={styles.statText}>
              <span className={styles.statVal}>3 ДНЯ</span>
              <span className={styles.statLbl}>До завершения</span>
            </div>
          </div>
        </div>

        <div className={styles.contentGrid}>
          <div className={styles.infoColumn}>
            <h2 className={styles.sectionHeading}>О челлендже</h2>
            <p className={styles.descriptionText}>
              Присоединяйтесь к нашему еженедельному забегу! Это отличный способ начать день,
              зарядиться энергией и познакомиться с единомышленниками. Мы бежим в спокойном
              темпе, подходящем для всех уровней подготовки.
            </p>

            <div className={styles.rulesBlock}>
              <h3>
                <Trophy size={18} /> Что вы получите
              </h3>
              <p>
                Баллы можно обменять на мерч от Nike, скидку 30% в магазинах-партнерах или
                перевести на благотворительность.
              </p>
            </div>
          </div>

          <div className={styles.stepsColumn}>
            <h2 className={styles.sectionHeading}>Дорожная карта (4 этапа)</h2>

            <div className={styles.timeline}>
              {steps.map((step, index) => (
                <div key={index} className={styles.timelineItem}>
                  <div className={styles.timelineMarker}>
                    <div className={styles.markerCircle}>{index + 1}</div>
                    {index !== 3 && <div className={styles.markerLine} />}
                  </div>

                  <div className={`${styles.timelineContent} ${styles.glassCard}`}>
                    <div className={styles.stepHeader}>
                      <span className={styles.stepTypeBadge}>{step.type}</span>
                      <span className={styles.stepPoints}>+{step.points} баллов</span>
                    </div>
                    <h3 className={styles.stepTitle}>{step.title}</h3>
                    <p className={styles.stepDesc}>{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <div className={styles.stickyActionBar}>
        <div className={styles.actionBarContent}>
          <div className={styles.actionPrice}>
            <span>Призовой фонд:</span>
            <strong>300 баллов</strong>
          </div>
          <button className={styles.joinBtn}>
            Начать челлендж <Zap size={20} fill="currentColor" />
          </button>
        </div>
      </div>
    </div>
  );
}
