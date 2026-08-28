'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X, Users, Calendar, Clock, Upload, Camera,
  Navigation, MessageSquare, Send, Trophy, Gift, ChevronDown,
  AlertTriangle, CheckCircle2
} from 'lucide-react';
import { Spinner } from '@/shared/components/spinner';
import { ShareButtons } from '@/shared/components/share-buttons';
import { MapTooltip } from '@/shared/components/map-tooltip';
import { CountdownTimer } from '@/shared/components/countdown-timer';
import { useSession } from '@/shared/components/session-provider';
import { useToast } from '@/shared/components/toast';

export type ParticipationStatus = 'none' | 'active' | 'completed' | 'failed';
export type StageStatus = 'pending' | 'active' | 'completed';

export interface ChallengeStage {
  id: string;
  title: string;
  description: string;
  type: 'ДЕЙСТВИЕ' | 'ГЕО' | 'ФОТО' | 'ФАЙЛ' | 'ВОПРОС' | 'ЗАГРУЗКА' | 'ОПРОС';
  status: StageStatus;
  config?: Record<string, unknown> | null;
}

export interface ModalChallenge {
  id: string;
  title: string;
  organizer: string;
  category: string;
  imageUrl: string;
  participantsCount: number;
  maxParticipants: number | null;
  endDate: string;
  startDate?: string | null;
  overallStatus?: 'registration' | 'active' | 'completed';
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  achievement: string;
  reward: string;
  description: string;
  requirements: string;
  refundPolicy: string;
  stages: ChallengeStage[];
  media?: { id: string; url: string; type: string; altText: string | null }[];
  galleryPhotos?: string[];
  isJoined?: boolean;
}

interface ChallengeModalProps {
  challenge: ModalChallenge;
  onClose: () => void;
}

export interface ChatMessage {
  id: string;
  user: string;
  userId: string;
  text: string;
  time: string;
  createdAt: string;
}

export function ChallengeModal({ challenge, onClose }: ChallengeModalProps) {
  const [status, setStatus] = useState<ParticipationStatus>(challenge.isJoined ? 'active' : 'none');
  const [stages, setStages] = useState<ChallengeStage[]>(challenge.stages);
  const [startDate, setStartDate] = useState<string | null>(challenge.startDate || null);
  const [overallStatus, setOverallStatus] = useState<'registration' | 'active' | 'completed'>(challenge.overallStatus || 'active');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [activeTab, setActiveTab] = useState<'info' | 'chat' | 'gallery'>('info');
  const [expandedStage, setExpandedStage] = useState<string | null>(null);
  const [stageInputs, setStageInputs] = useState<Record<string, string>>({});
  const [questionInputs, setQuestionInputs] = useState<Record<string, any>>({});
  const [loadingChat, setLoadingChat] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [galleryPhotos, setGalleryPhotos] = useState<string[]>(challenge.galleryPhotos || []);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const session = useSession();
  const { toast } = useToast();

  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Escape key handler
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  // Focus trap
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || !modalRef.current) return;
    const focusable = modalRef.current.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }, []);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);
    setTimeout(() => closeButtonRef.current?.focus(), 50);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [handleEscape]);

  useEffect(() => {
    fetch(`/api/challenges/${challenge.id}`)
      .then(r => r.json())
      .then(d => {
        if (d.stages) {
          setStages(d.stages);
          if (d.isJoined) setStatus('active');
        }
        if (d.startDate) setStartDate(d.startDate);
        if (d.overallStatus) setOverallStatus(d.overallStatus);
        setLoadingDetail(false);
      })
      .catch(() => setLoadingDetail(false));
  }, [challenge.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    if (activeTab !== 'chat') return;
    setLoadingChat(true);
    let mounted = true;

    const loadChat = () => {
      fetch(`/api/challenges/${challenge.id}/chat`)
        .then(r => r.json())
        .then(d => {
          if (!mounted) return;
          setChatMessages(d.messages || []);
          setLoadingChat(false);
        })
        .catch(() => { if (mounted) setLoadingChat(false); });
    };

    loadChat();
    const interval = setInterval(loadChat, 5000);
    return () => { mounted = false; clearInterval(interval); };
  }, [activeTab, challenge.id]);

  const refetchStages = () => {
    fetch(`/api/challenges/${challenge.id}`)
      .then(r => r.json())
      .then(d => {
        if (d.stages) setStages(d.stages);
        if (d.startDate) setStartDate(d.startDate);
        if (d.overallStatus) setOverallStatus(d.overallStatus);
      })
      .catch(() => {});
  };

  const handleJoin = async () => {
    if (!session) {
      window.location.assign(`/register?next=${encodeURIComponent('/explore')}`);
      return;
    }

    try {
      const res = await fetch(`/api/challenges/${challenge.id}/join`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setStatus('active');
        refetchStages();
        toast('success', 'Вы присоединились к челленджу!');
      } else {
        toast('warning', data.error || 'Не удалось присоединиться к челленджу');
      }
    } catch {
      toast('warning', 'Не удалось присоединиться. Попробуйте ещё раз.');
    }
  };

  const handleCompleteStage = async (stageId: string) => {
    const stage = stages.find(s => s.id === stageId);
    const cfg = stage?.config as Record<string, unknown> || {};
    const qt = cfg.questionType as string | undefined;

    // Determine submission based on stage type
    let submission: any = stageInputs[stageId] || null;

    // Build question submission
    if (stage?.type === 'ВОПРОС' || stage?.type === 'ОПРОС') {
      if (qt === 'text') {
        submission = stageInputs[stageId] || '';
        if (cfg.maxLength && submission.length > (cfg.maxLength as number)) {
          toast('warning', `Максимальная длина текста — ${cfg.maxLength} символов`);
          return;
        }
        if (cfg.minLength && submission.trim().length < (cfg.minLength as number)) {
          toast('warning', `Минимальная длина текста — ${cfg.minLength} символов`);
          return;
        }
      } else if (qt === 'multiple') {
        submission = questionInputs[stageId] || [];
        if (!Array.isArray(submission) || submission.length === 0) {
          toast('warning', 'Выберите хотя бы один вариант');
          return;
        }
      } else if (qt === 'rating') {
        submission = questionInputs[stageId];
        if (submission == null) {
          toast('warning', 'Поставьте оценку');
          return;
        }
      } else if (qt === 'yesno') {
        submission = questionInputs[stageId];
        if (submission == null) {
          toast('warning', 'Выберите Да или Нет');
          return;
        }
      } else {
        // single or default
        submission = questionInputs[stageId];
        if (submission == null) {
          toast('warning', 'Выберите один из вариантов ответа');
          return;
        }
      }
    } else {
      // Non-question types
      if (cfg.requirePhoto && stage?.type === 'ФОТО' && !stageInputs[stageId]) {
        toast('warning', 'Загрузите фото для этого этапа');
        return;
      }
      if (cfg.requireGeo && stage?.type === 'ГЕО' && !stageInputs[stageId]) {
        toast('warning', 'Подтвердите геолокацию для этого этапа');
        return;
      }
      if (cfg.requireOption && !stageInputs[stageId]) {
        toast('warning', 'Выберите один из вариантов ответа');
        return;
      }
      if (stage?.type === 'ДЕЙСТВИЕ' && !stageInputs[stageId]?.trim()) {
        toast('warning', 'Заполните поле перед подтверждением');
        return;
      }
    }

    try {
      const res = await fetch(`/api/challenges/${challenge.id}/complete-step`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stepId: stageId, submission }),
      });
      const data = await res.json();
      if (!res.ok) { toast('error', data.error || 'Ошибка'); return; }
      if (data.success) {
        toast('success', `+${data.pointsEarned} баллов! Этап завершён`);
        setStages(prev => {
          const updated = prev.map(s => s.id === stageId ? { ...s, status: 'completed' as StageStatus } : s);
          const nextIdx = updated.findIndex(s => s.status === 'pending');
          if (nextIdx !== -1) {
            updated[nextIdx] = { ...updated[nextIdx], status: 'active' };
            setExpandedStage(updated[nextIdx].id);
          } else {
            setStatus('completed');
            setExpandedStage(null);
          }
          return updated;
        });
      }
    } catch {}
  };

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const text = chatInput.trim();
    setChatInput('');
    try {
      const res = await fetch(`/api/challenges/${challenge.id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (data.id) {
        setChatMessages(prev => [...prev, data]);
      }
    } catch {}
  };

  const maxSlots = challenge.maxParticipants ?? Infinity;
  const availableSlots = maxSlots === Infinity ? null : Math.max(0, maxSlots - challenge.participantsCount);

  const canJoin = status === 'none' && overallStatus === 'registration';
  const registrationClosed = status === 'none' && overallStatus !== 'registration';

  const getButtonLabel = () => {
    if (status === 'none' && registrationClosed) return 'Регистрация закрыта';
    if (status === 'none') return 'Участвовать';
    if (status === 'active') return 'В процессе';
    if (status === 'completed') return 'Завершён ✓';
    return 'Не завершён';
  };

  const getButtonClass = () => {
    if (status === 'active') return 'join-btn active';
    if (status === 'completed') return 'join-btn completed';
    if (status === 'failed') return 'join-btn failed';
    if (registrationClosed) return 'join-btn closed';
    return 'join-btn';
  };

  const getStageColor = (s: ChallengeStage) => {
    if (s.status === 'completed') return '#22c55e';
    if (s.status === 'active') return '#FF385C';
    return '#d1d5db';
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose} aria-hidden="true" />
      <div
        className="modal-shell"
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onKeyDown={handleKeyDown}
      >
        <div className="modal-inner">

          {/* CLOSE */}
          <button className="modal-close" onClick={onClose} ref={closeButtonRef} aria-label="Закрыть модальное окно">
            <X size={20} aria-hidden="true" />
          </button>

          {/* RIGHT PANE — Title + Stages */}
          <div className="modal-right">
            <div className="modal-title-block">
              <h2 className="modal-title" id="modal-title">{challenge.title}</h2>
              <p className="modal-organizer">Организатор: <strong>{challenge.organizer}</strong></p>
            </div>

            {/* TABS */}
            <div className="modal-tabs" role="tablist" aria-label="Информация о челлендже">
              <button
                className={`modal-tab ${activeTab === 'info' ? 'active' : ''}`}
                onClick={() => setActiveTab('info')}
                role="tab"
                aria-selected={activeTab === 'info'}
                id="tab-info"
                aria-controls="panel-info"
              >
                Этапы
              </button>
              <button
                className={`modal-tab ${activeTab === 'chat' ? 'active' : ''}`}
                onClick={() => setActiveTab('chat')}
                role="tab"
                aria-selected={activeTab === 'chat'}
                id="tab-chat"
                aria-controls="panel-chat"
              >
                <MessageSquare size={14} aria-hidden="true" /> Общий чат
              </button>
              <button
                className={`modal-tab ${activeTab === 'gallery' ? 'active' : ''}`}
                onClick={() => setActiveTab('gallery')}
                role="tab"
                aria-selected={activeTab === 'gallery'}
                id="tab-gallery"
                aria-controls="panel-gallery"
              >
                <Camera size={14} aria-hidden="true" /> Галерея
              </button>
            </div>

            {/* STAGES TAB */}
            {activeTab === 'info' && (
              <div className="stages-list" role="tabpanel" id="panel-info" aria-labelledby="tab-info">
                {loadingDetail ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: 40 }}>
                    <Spinner size={32} />
                    <span style={{ fontSize: 13, color: '#aaa' }}>Загрузка этапов...</span>
                  </div>
                ) : stages.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 40, color: '#aaa', fontSize: 13 }}>Этапы не найдены</div>
                ) : stages.map((stage, idx) => (
                  <div
                    key={stage.id}
                    className={`stage-item ${stage.status}`}
                    style={{ '--stage-color': getStageColor(stage) } as React.CSSProperties}
                  >
                    <div
                      className="stage-header"
                      onClick={() => setExpandedStage(expandedStage === stage.id ? null : stage.id)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpandedStage(expandedStage === stage.id ? null : stage.id); } }}
                      role="button"
                      tabIndex={0}
                      aria-expanded={expandedStage === stage.id}
                    >
                      <div className="stage-num"
                        style={{ background: getStageColor(stage) }}
                      >
                        {stage.status === 'completed'
                          ? <CheckCircle2 size={14} color="white" />
                          : stage.status === 'active'
                            ? <Spinner size={14} />
                            : <span>{idx + 1}</span>
                        }
                      </div>
                      <div className="stage-head-info">
                        <span className="stage-type-badge"
                          style={{ color: getStageColor(stage) }}
                        >{stage.type}</span>
                        <span className="stage-title">{stage.title}</span>
                      </div>
                      <ChevronDown
                        size={16}
                        className={`stage-chevron ${expandedStage === stage.id ? 'open' : ''}`}
                      />
                    </div>

                    {expandedStage === stage.id && (
                      <div className="stage-body">
                        <p>{stage.description}</p>
                        {stage.config && (
                          <div className="stage-verify-hints">
                            {/* Question type hints */}
                            {stage.config.questionType === 'text' && <span className="verify-hint">✏️ Текстовый ответ{stage.config.maxLength ? ` (до ${String(stage.config.maxLength)} симв.)` : ''}{stage.config.minLength ? ` (мин. ${String(stage.config.minLength)} симв.)` : ''}</span>}
                            {stage.config.questionType === 'single' && <span className="verify-hint">○ Один вариант из списка</span>}
                            {stage.config.questionType === 'multiple' && <span className="verify-hint">☑ Можно выбрать несколько</span>}
                            {stage.config.questionType === 'rating' && <span className="verify-hint">★ Оценка от {String(stage.config.ratingMin ?? 1)} до {String(stage.config.ratingMax ?? 5)}</span>}
                            {stage.config.questionType === 'yesno' && <span className="verify-hint">👍 Да / Нет</span>}
                            {/* Legacy hints */}
                            {!stage.config.questionType && 'minTextLength' in stage.config && stage.config.minTextLength ? <span className="verify-hint">Минимум {String(stage.config.minTextLength)} символов</span> : null}
                            {'minPhotoWidth' in stage.config && stage.config.minPhotoWidth ? <span className="verify-hint">Фото: минимум {String(stage.config.minPhotoWidth)}×{String(stage.config.minPhotoHeight || 0)} px</span> : null}
                            {'requirePhoto' in stage.config && stage.config.requirePhoto && !('minPhotoWidth' in stage.config) ? <span className="verify-hint">Фото обязательно</span> : null}
                            {'maxGeoAccuracy' in stage.config && stage.config.maxGeoAccuracy ? <span className="verify-hint">Точность: не хуже {String(stage.config.maxGeoAccuracy)} м</span> : null}
                            {'requireGeo' in stage.config && stage.config.requireGeo && !('maxGeoAccuracy' in stage.config) ? <span className="verify-hint">Геолокация обязательна</span> : null}
                            {'requireOption' in stage.config && stage.config.requireOption ? <span className="verify-hint">Выбор ответа обязателен</span> : null}
                          </div>
                        )}
                        {stage.status === 'active' && (
                          <div className="stage-actions">
                            {stage.type === 'ФОТО' && (
                              <button className="stage-btn">
                                <Camera size={15} /> Загрузить фото
                              </button>
                            )}
                            {stage.type === 'ФАЙЛ' && (
                              <button className="stage-btn">
                                <Upload size={15} /> Загрузить файл
                              </button>
                            )}
                            {stage.type === 'ГЕО' && (
                              <button className="stage-btn">
                                <Navigation size={15} /> Подтвердить геолокацию
                              </button>
                            )}
                            {stage.type === 'ДЕЙСТВИЕ' && (
                              <>
                                <input
                                  className="stage-text-input"
                                  placeholder="Опиши что ты сделал (или введи email для подтверждения)..."
                                  value={stageInputs[stage.id] || ''}
                                  onChange={e => setStageInputs(prev => ({ ...prev, [stage.id]: e.target.value }))}
                                />
                                <button className="stage-btn">
                                  <CheckCircle2 size={15} /> Подтвердить выполнение
                                </button>
                              </>
                            )}
                            {/* ВОПРОС / ОПРОС — UI вопроса */}
                            {(stage.type === 'ВОПРОС' || stage.type === 'ОПРОС') && stage.config && (
                              <div className="stage-question-wrap">
                                {/* Single choice */}
                                {(stage.config.questionType === 'single' || !stage.config.questionType) && Array.isArray(stage.config.options) && (
                                  <div className="sq-options">
                                    {(stage.config.options as string[]).map((opt, oi) => (
                                      <button
                                        key={oi}
                                        className={`sq-option ${questionInputs[stage.id] === oi ? 'selected' : ''}`}
                                        onClick={() => setQuestionInputs(prev => ({ ...prev, [stage.id]: oi }))}
                                      >
                                        <span className="sq-radio">{questionInputs[stage.id] === oi ? '●' : '○'}</span>
                                        <span>{opt}</span>
                                      </button>
                                    ))}
                                  </div>
                                )}
                                {/* Multiple choice */}
                                {stage.config.questionType === 'multiple' && Array.isArray(stage.config.options) && (
                                  <div className="sq-options">
                                    {(stage.config.options as string[]).map((opt, oi) => {
                                      const selected = Array.isArray(questionInputs[stage.id]) && (questionInputs[stage.id] as number[]).includes(oi);
                                      return (
                                        <button
                                          key={oi}
                                          className={`sq-option ${selected ? 'selected' : ''}`}
                                          onClick={() => {
                                            const current: number[] = Array.isArray(questionInputs[stage.id]) ? [...questionInputs[stage.id]] : [];
                                            const idx = current.indexOf(oi);
                                            const next = idx >= 0 ? current.filter(i => i !== oi) : [...current, oi];
                                            setQuestionInputs(prev => ({ ...prev, [stage.id]: next }));
                                          }}
                                        >
                                          <span className="sq-radio">{selected ? '☑' : '☐'}</span>
                                          <span>{opt}</span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                                {/* Text answer */}
                                {stage.config.questionType === 'text' && (
                                  < div className="sq-text">
                                    <textarea
                                      className="stage-text-input"
                                      placeholder="Введите ваш ответ..."
                                      rows={3}
                                      value={stageInputs[stage.id] || ''}
                                      onChange={e => setStageInputs(prev => ({ ...prev, [stage.id]: e.target.value }))}
                                    />
                                    <div className="sq-char-counter">
                                      {stageInputs[stage.id]?.length || 0}{stage.config.maxLength ? ` / ${stage.config.maxLength}` : ''} символов
                                    </div>
                                  </div>
                                )}
                                {/* Rating */}
                                {stage.config.questionType === 'rating' && (() => {
                                  const rMin = (stage.config!.ratingMin as number) ?? 1;
                                  const rMax = (stage.config!.ratingMax as number) ?? 5;
                                  const rMinLbl = stage.config!.ratingMinLabel as string | undefined;
                                  const rMaxLbl = stage.config!.ratingMaxLabel as string | undefined;
                                  return (
                                    <div className="sq-rating">
                                      {(rMinLbl || rMaxLbl) && (
                                        <div className="sq-rating-labels">
                                          <span>{rMinLbl || ''}</span>
                                          <span>{rMaxLbl || ''}</span>
                                        </div>
                                      )}
                                      <div className="sq-rating-btns">
                                        {Array.from({ length: rMax - rMin + 1 }, (_, i) => rMin + i).map(val => (
                                          <button
                                            key={val}
                                            className={`sq-rating-btn ${questionInputs[stage.id] === val ? 'selected' : ''}`}
                                            onClick={() => setQuestionInputs(prev => ({ ...prev, [stage.id]: val }))}
                                          >
                                            {val}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })()}
                                {/* Yes/No */}
                                {stage.config.questionType === 'yesno' && (
                                  <div className="sq-yesno">
                                    <button
                                      className={`sq-yesno-btn yes ${questionInputs[stage.id] === 0 || questionInputs[stage.id] === '0' || questionInputs[stage.id] === 'Да' ? 'selected' : ''}`}
                                      onClick={() => setQuestionInputs(prev => ({ ...prev, [stage.id]: 0 }))}
                                    >
                                      <span className="sq-yesno-icon">👍</span>
                                      <span>Да</span>
                                    </button>
                                    <button
                                      className={`sq-yesno-btn no ${questionInputs[stage.id] === 1 || questionInputs[stage.id] === '1' || questionInputs[stage.id] === 'Нет' ? 'selected' : ''}`}
                                      onClick={() => setQuestionInputs(prev => ({ ...prev, [stage.id]: 1 }))}
                                    >
                                      <span className="sq-yesno-icon">👎</span>
                                      <span>Нет</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                            <button
                              className="stage-btn complete"
                              onClick={() => handleCompleteStage(stage.id)}
                            >
                              Этап выполнен ✓
                            </button>
                          </div>
                        )}
                        {stage.status === 'completed' && (
                          <div className="stage-done-label">
                            <CheckCircle2 size={14} /> Этап завершён
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                </div>
            )}

            {/* CHAT TAB */}
            {activeTab === 'chat' && (
              <div className="chat-wrap" role="tabpanel" id="panel-chat" aria-labelledby="tab-chat">
                <div className="chat-history">
                  {loadingChat ? (
                    <div style={{ textAlign: 'center', padding: 40, color: '#aaa', fontSize: 13 }}>Загрузка сообщений...</div>
                  ) : chatMessages.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 40, color: '#aaa', fontSize: 13 }}>Пока нет сообщений. Начните общение!</div>
                  ) : chatMessages.map(msg => (
                    <div key={msg.id} className={`chat-msg ${msg.userId === session?.user?.id ? 'me' : 'other'}`}>
                      {msg.userId !== session?.user?.id && <span className="chat-user">{msg.user}</span>}
                      <div className="chat-bubble">
                        {msg.text}
                        <span className="chat-time">{msg.time}</span>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <div className="chat-input-row">
                  <input
                    className="chat-input"
                    placeholder="Написать сообщение..."
                    aria-label="Написать сообщение"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendChat()}
                  />
                  <button className="chat-send" onClick={handleSendChat} aria-label="Отправить сообщение">
                    <Send size={16} color="white" aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}

            {/* GALLERY TAB */}
            {activeTab === 'gallery' && (
              <div className="gallery-tab" role="tabpanel" id="panel-gallery" aria-labelledby="tab-gallery">
                {galleryPhotos.length === 0 ? (
                  <div className="gallery-empty">
                    <Camera size={40} color="#ddd" />
                    <p>Пока нет фото от участников</p>
                    <span>Фото появятся здесь, когда участники начнут выполнять этапы</span>
                  </div>
                ) : (
                  <div className="gallery-grid">
                    {galleryPhotos.map((url, i) => (
                      <div key={i} className="gallery-item">
                        <img src={url} alt={`Фото ${i + 1}`} loading="lazy" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ACTION BAR */}
            <div className="modal-action-bar">
              <div className="slots-info">
                <Users size={14} />
                <span>
                  {availableSlots !== null ? (
                    <>Свободно <strong>{availableSlots}</strong> из {maxSlots} мест</>
                  ) : (
                    <><strong>{challenge.participantsCount}</strong> участников · Без ограничений</>
                  )}
                </span>
              </div>
              <button
                className={getButtonClass()}
                onClick={canJoin ? handleJoin : undefined}
                disabled={!canJoin}
              >
                {getButtonLabel()}
              </button>
            </div>
          </div>

          {/* LEFT PANE — Details */}
          <div className="modal-left">
            <div className="modal-img-wrap">
              <img src={challenge.imageUrl} alt={challenge.title} className="modal-img" />
              <span className="modal-category">{challenge.category}</span>
            </div>

            <div className="modal-meta">
              <div className="meta-row meta-location">
                <MapTooltip
                  address={challenge.location}
                  latitude={challenge.latitude}
                  longitude={challenge.longitude}
                />
              </div>
              <div className="meta-row">
                <Calendar size={15} />
                <span>До {challenge.endDate}</span>
              </div>
              <div className="meta-row">
                <Users size={15} />
                <span>
                  <strong>{challenge.participantsCount}</strong> участников
                  {availableSlots !== null && <> · <strong className={availableSlots <= 5 ? 'few-slots' : ''}>{availableSlots} мест</strong></>}
                </span>
              </div>
            </div>

            {/* Countdown before start */}
            {startDate && overallStatus === 'registration' && (
              <div style={{ padding: '0 20px 12px' }}>
                <CountdownTimer targetDate={startDate} />
              </div>
            )}

            <div className="modal-rewards-block">
              <div className="reward-card achievement">
                <Trophy size={18} />
                <div>
                  <span className="reward-label">Достижение</span>
                  <span className="reward-value">{challenge.achievement}</span>
                </div>
              </div>
              <div className="reward-card gift">
                <Gift size={18} />
                <div>
                  <span className="reward-label">Награда</span>
                  <span className="reward-value">{challenge.reward}</span>
                </div>
              </div>
            </div>

            <div className="modal-desc">
              <h3>Описание</h3>
              <p>{challenge.description}</p>
            </div>

            {challenge.requirements && (
              <div className="modal-desc">
                <h3>Требования</h3>
                <p>{challenge.requirements}</p>
              </div>
            )}

            <div className="modal-refund">
              <AlertTriangle size={15} />
              <p>{challenge.refundPolicy}</p>
            </div>

            <div style={{ padding: '0 20px' }}>
              <ShareButtons challengeId={challenge.id} title={challenge.title} />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(8px);
          z-index: 8000;
          animation: fadeIn 0.25s ease;
        }

        .modal-shell {
          position: fixed;
          inset: 0;
          z-index: 8001;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: slideUp 0.3s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .modal-inner {
          background: #fff;
          border-radius: 28px;
          width: 100%;
          max-width: 980px;
          max-height: 90vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          overflow: hidden;
          box-shadow: 0 50px 120px rgba(0,0,0,0.35);
          position: relative;
        }

        .modal-close {
          position: absolute;
          top: 16px;
          right: 16px;
          z-index: 10;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255,255,255,0.9);
          border: 1px solid #ddd;
          display: grid;
          place-items: center;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .modal-close:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        /* LEFT */
        .modal-left {
          overflow-y: auto;
          border-left: 1px solid #f0f0f0;
          scrollbar-width: none;
        }
        .modal-left::-webkit-scrollbar { display: none; }

        .modal-img-wrap {
          position: relative;
          height: 220px;
          overflow: hidden;
        }

        .modal-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .modal-category {
          position: absolute;
          bottom: 14px;
          left: 14px;
          background: rgba(255,255,255,0.92);
          padding: 5px 12px;
          border-radius: 99px;
          font-size: 12px;
          font-weight: 700;
          backdrop-filter: blur(4px);
        }

        .modal-meta {
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          border-bottom: 1px solid #f0f0f0;
        }

        .meta-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #555;
        }

        .few-slots { color: #ef4444; }

        /* Location map tooltip */
        .meta-location { position: relative; cursor: default; }
        .map-tooltip {
          position: absolute; top: 100%; left: 0; z-index: 100;
          margin-top: 8px; background: white; border-radius: 14px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.15); overflow: hidden;
          animation: mapFadeIn 0.2s ease;
        }
        .map-tooltip-address {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 12px; font-size: 12px; font-weight: 600; color: #333;
          border-top: 1px solid #f0f0f0;
        }
        .map-tooltip-address svg { color: #FF385C; flex-shrink: 0; }
        @keyframes mapFadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }

        /* Gallery tab */
        .gallery-tab { padding: 16px 20px; flex: 1; overflow-y: auto; }
        .gallery-empty {
          display: flex; flex-direction: column; align-items: center;
          gap: 8px; padding: 40px 20px; text-align: center;
        }
        .gallery-empty p { font-size: 15px; font-weight: 700; color: #333; margin: 0; }
        .gallery-empty span { font-size: 12px; color: #999; margin: 0; }
        .gallery-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;
        }
        .gallery-item {
          aspect-ratio: 1; border-radius: 10px; overflow: hidden;
          cursor: pointer; transition: transform 0.2s;
        }
        .gallery-item:hover { transform: scale(1.03); }
        .gallery-item img { width: 100%; height: 100%; object-fit: cover; }

        .modal-rewards-block {
          padding: 16px 20px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          border-bottom: 1px solid #f0f0f0;
        }

        .reward-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 14px;
        }

        .reward-card.achievement {
          background: linear-gradient(135deg, #fff7ed, #fef3c7);
          color: #92400e;
        }

        .reward-card.gift {
          background: linear-gradient(135deg, #f0fdf4, #dcfce7);
          color: #166534;
        }

        .reward-card > :global(svg) {
          flex-shrink: 0;
        }

        .reward-label {
          display: block;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          opacity: 0.65;
        }

        .reward-value {
          display: block;
          font-size: 13px;
          font-weight: 800;
          line-height: 1.2;
          margin-top: 2px;
        }

        .modal-desc {
          padding: 16px 20px;
          border-bottom: 1px solid #f0f0f0;
        }

        .modal-desc h3 {
          font-size: 13px;
          font-weight: 800;
          color: #111;
          margin: 0 0 8px 0;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .modal-desc p {
          font-size: 13px;
          color: #555;
          line-height: 1.6;
          margin: 0;
        }

        .modal-refund {
          padding: 14px 20px;
          display: flex;
          gap: 8px;
          background: #fff7ed;
        }

        .modal-refund :global(svg) { color: #f59e0b; flex-shrink: 0; margin-top: 2px; }
        .modal-refund p { font-size: 12px; color: #78350f; line-height: 1.5; margin: 0; }

        /* RIGHT */
        .modal-right {
          display: flex;
          flex-direction: column;
          max-height: 90vh;
          overflow: hidden;
          min-width: 0;
        }

        .modal-title-block {
          padding: 24px 24px 0;
        }

        .modal-title {
          font-size: clamp(18px, 2.5vw, 24px);
          font-weight: 900;
          margin: 0 0 6px 0;
          color: #111;
          line-height: 1.25;
          padding-right: 44px;
        }

        .modal-organizer {
          font-size: 13px;
          color: #777;
          margin: 0;
        }

        /* TABS */
        .modal-tabs {
          display: flex;
          gap: 4px;
          padding: 16px 24px 0;
          border-bottom: 1px solid #f0f0f0;
        }

        .modal-tab {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 99px;
          border: none;
          background: transparent;
          font-size: 13px;
          font-weight: 700;
          color: #888;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
          margin-bottom: -1px;
        }

        .modal-tab.active {
          background: #FF385C;
          color: white;
        }

        /* STAGES */
        .stages-list {
          flex: 1;
          overflow-y: auto;
          padding: 16px 24px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          scrollbar-width: thin;
        }

        .stage-item {
          border-radius: 16px;
          border: 2px solid #f0f0f0;
          overflow: hidden;
          transition: border-color 0.2s;
        }

        .stage-item.active { border-color: #FF385C; }
        .stage-item.completed { border-color: #22c55e; }

        .stage-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          cursor: pointer;
          background: #fff;
          transition: background 0.15s;
        }

        .stage-header:hover { background: #f9f9f9; }

        .stage-num {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          font-size: 13px;
          font-weight: 800;
          color: white;
          flex-shrink: 0;
          transition: background 0.3s;
        }

        .stage-head-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .stage-type-badge {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .stage-title {
          font-size: 14px;
          font-weight: 700;
          color: #111;
        }

        .stage-chevron {
          transition: transform 0.2s;
          color: #aaa;
        }

        .stage-chevron.open { transform: rotate(180deg); }

        .stage-body {
          padding: 12px 16px 16px;
          background: #fafafa;
          border-top: 1px solid #f0f0f0;
        }

        .stage-body p {
          font-size: 13px;
          color: #555;
          line-height: 1.5;
          margin: 0 0 14px 0;
        }

        .stage-verify-hints {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 14px;
        }
        .verify-hint {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 8px;
          background: #fffbeb;
          border: 1px solid #fde68a;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          color: #92400e;
        }

        .stage-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .stage-text-input {
          width: 100%;
          padding: 10px 14px;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          font-size: 13px;
          outline: none;
          transition: border-color 0.2s;
          font-family: inherit;
          resize: none;
        }

        .stage-text-input:focus {
          border-color: #FF385C;
          box-shadow: 0 0 0 3px rgba(255,56,92,0.06);
        }

        .stage-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 9px 14px;
          border-radius: 10px;
          border: 1px solid #e5e7eb;
          background: white;
          font-size: 13px;
          font-weight: 700;
          color: #374151;
          cursor: pointer;
          transition: background 0.15s, transform 0.1s;
        }

        .stage-btn:hover { background: #f3f4f6; transform: translateY(-1px); }

        .stage-btn.complete {
          background: #22c55e;
          color: white;
          border-color: #22c55e;
        }

        .stage-btn.complete:hover { background: #16a34a; }

        .stage-done-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 700;
          color: #22c55e;
        }

        /* QUESTION UI */
        .stage-question-wrap {
          width: 100%;
          margin: 8px 0;
        }
        .sq-options {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .sq-option {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          border: 1.5px solid #e5e7eb;
          border-radius: 12px;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 13px;
          font-weight: 600;
          color: #374151;
          text-align: left;
        }
        .sq-option:hover {
          border-color: #FF385C;
          background: #fff5f7;
        }
        .sq-option.selected {
          border-color: #FF385C;
          background: #fef2f4;
          color: #FF385C;
        }
        .sq-radio {
          font-size: 16px;
          width: 20px;
          text-align: center;
          flex-shrink: 0;
        }
        .sq-text {
          display: flex;
          flex-direction: column;
          gap: 4px;
          width: 100%;
        }
        .sq-char-counter {
          font-size: 11px;
          color: #9ca3af;
          text-align: right;
        }
        .sq-rating {
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: center;
        }
        .sq-rating-labels {
          display: flex;
          justify-content: space-between;
          width: 100%;
          font-size: 11px;
          color: #9ca3af;
          font-weight: 600;
        }
        .sq-rating-btns {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .sq-rating-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 1.5px solid #e5e7eb;
          background: white;
          font-size: 16px;
          font-weight: 800;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s;
        }
        .sq-rating-btn:hover {
          border-color: #FF385C;
          color: #FF385C;
          transform: scale(1.1);
        }
        .sq-rating-btn.selected {
          border-color: #FF385C;
          background: #FF385C;
          color: white;
          box-shadow: 0 4px 12px rgba(255,56,92,0.3);
        }
        .sq-yesno {
          display: flex;
          gap: 12px;
          width: 100%;
        }
        .sq-yesno-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 16px;
          border-radius: 14px;
          border: 1.5px solid #e5e7eb;
          background: white;
          font-size: 16px;
          font-weight: 800;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s;
        }
        .sq-yesno-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
        }
        .sq-yesno-btn.yes.selected {
          border-color: #22c55e;
          background: #f0fdf4;
          color: #16a34a;
        }
        .sq-yesno-btn.no.selected {
          border-color: #ef4444;
          background: #fef2f2;
          color: #dc2626;
        }
        .sq-yesno-icon {
          font-size: 22px;
        }

        /* CHAT */
        .chat-wrap {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          min-height: 0;
        }

        .chat-history {
          flex: 1;
          overflow-y: auto;
          padding: 16px 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          scrollbar-width: thin;
          min-height: 0;
        }

        .chat-msg {
          display: flex;
          flex-direction: column;
          max-width: 75%;
          flex-shrink: 0;
        }

        .chat-msg.me { align-self: flex-end; align-items: flex-end; }
        .chat-msg.other { align-self: flex-start; }

        .chat-user {
          font-size: 11px;
          font-weight: 700;
          color: #888;
          margin-bottom: 4px;
          padding: 0 6px;
        }

        .chat-bubble {
          padding: 10px 14px;
          border-radius: 16px;
          font-size: 14px;
          line-height: 1.4;
          position: relative;
        }

        .chat-msg.me .chat-bubble {
          background: #FF385C;
          color: white;
          border-bottom-right-radius: 4px;
        }

        .chat-msg.other .chat-bubble {
          background: #f3f4f6;
          color: #111;
          border-bottom-left-radius: 4px;
        }

        .chat-time {
          display: block;
          font-size: 10px;
          opacity: 0.6;
          margin-top: 4px;
          text-align: right;
        }

        .chat-input-row {
          padding: 12px 24px;
          display: flex;
          gap: 10px;
          border-top: 1px solid #f0f0f0;
        }

        .chat-input {
          flex: 1;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 10px 14px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }

        .chat-input:focus { border-color: #FF385C; }

        .chat-send {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: #FF385C;
          border: none;
          display: grid;
          place-items: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: background 0.15s, transform 0.1s;
        }

        .chat-send:hover { background: #E31C5F; transform: scale(1.05); }

        /* ACTION BAR */
        .modal-action-bar {
          padding: 16px 24px;
          border-top: 1px solid #f0f0f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          background: white;
        }

        .slots-info {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #555;
        }

        .join-btn {
          padding: 13px 28px;
          border-radius: 14px;
          border: none;
          background: #FF385C;
          color: white;
          font-size: 15px;
          font-weight: 800;
          cursor: pointer;
          transition: transform 0.15s, background 0.2s;
          white-space: nowrap;
        }

        .join-btn:hover { background: #E31C5F; transform: translateY(-1px); }

        .join-btn.active {
          background: linear-gradient(135deg, #f59e0b, #ef4444);
          cursor: default;
        }

        .join-btn.closed {
          background: #6b7280;
          cursor: default;
        }

        .join-btn.completed {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          cursor: default;
        }

        .join-btn.failed {
          background: #6b7280;
          cursor: default;
        }

        .join-btn:disabled { opacity: 1; }

        /* Spinner */
        :global(.spin) {
          animation: spin 1s linear infinite;
        }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @media (max-width: 768px) {
          .modal-shell {
            align-items: flex-end;
            padding: max(10px, env(safe-area-inset-top)) max(10px, env(safe-area-inset-right)) 0 max(10px, env(safe-area-inset-left));
          }
          .modal-inner {
            grid-template-columns: 1fr;
            width: 100%;
            max-height: calc(100dvh - max(10px, env(safe-area-inset-top)));
            border-radius: 20px 20px 0 0;
            padding-bottom: env(safe-area-inset-bottom);
          }
          .modal-left { max-height: 35vh; }
          .modal-img-wrap { height: 160px; }
          .modal-title { font-size: 18px; padding-right: 40px; }
          .modal-title-block { padding: 16px 16px 0; }
          .modal-tabs { padding: 12px 16px 0; }
          .stages-list { padding: 12px 16px; }
          .chat-history { padding: 12px 16px; }
          .chat-input-row { padding: 10px 16px max(10px, env(safe-area-inset-bottom)); }
          .modal-action-bar { padding: 12px 16px; flex-direction: column; gap: 10px; }
          .join-btn { width: 100%; text-align: center; }
          .sq-rating-btn { width: 44px; height: 44px; font-size: 14px; }
          .sq-yesno-btn { padding: 14px; font-size: 14px; }
        }

        @media (max-width: 480px) {
          .modal-shell { padding: 0; }
          .modal-inner { border-radius: 16px 16px 0 0; max-height: 100dvh; }
          .modal-left { max-height: 30vh; }
          .modal-img-wrap { height: 130px; }
          .modal-meta { padding: 12px 14px; }
          .modal-rewards-block { padding: 12px 14px; grid-template-columns: 1fr; }
          .modal-desc { padding: 12px 14px; }
          .modal-refund { padding: 10px 14px; }
          .stage-header { padding: 10px 12px; }
          .stage-body { padding: 10px 12px 12px; }
          .stage-actions { flex-direction: column; }
          .stage-btn { width: 100%; justify-content: center; }
          .sq-yesno { flex-direction: column; gap: 8px; }
          .sq-yesno-btn { padding: 14px; font-size: 15px; justify-content: center; }
          .sq-rating-btn { width: 44px; height: 44px; font-size: 13px; }
          .sq-option { padding: 12px 14px; font-size: 14px; min-height: 44px; }
        }
      `}</style>
    </>
  );
}
