'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  X, MapPin, Users, Calendar, Clock, Upload, Camera,
  Navigation, MessageSquare, Send, Trophy, Gift, ChevronDown,
  AlertTriangle, CheckCircle2, Loader2
} from 'lucide-react';
import { ShareButtons } from '@/shared/components/share-buttons';
import { useSession } from '@/shared/components/session-provider';
import { useToast } from '@/shared/components/toast';

export type ParticipationStatus = 'none' | 'active' | 'completed' | 'failed';
export type StageStatus = 'pending' | 'active' | 'completed';

export interface ChallengeStage {
  id: string;
  title: string;
  description: string;
  type: 'ДЕЙСТВИЕ' | 'ГЕО' | 'ФОТО' | 'ФАЙЛ';
  status: StageStatus;
}

export interface ModalChallenge {
  id: string;
  title: string;
  organizer: string;
  category: string;
  imageUrl: string;
  participantsCount: number;
  maxParticipants: number;
  endDate: string;
  location: string;
  achievement: string;
  reward: string;
  description: string;
  requirements: string;
  refundPolicy: string;
  stages: ChallengeStage[];
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
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [activeTab, setActiveTab] = useState<'info' | 'chat'>('info');
  const [expandedStage, setExpandedStage] = useState<string | null>(null);
  const [stageInputs, setStageInputs] = useState<Record<string, string>>({});
  const [loadingChat, setLoadingChat] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const session = useSession();
  const { toast } = useToast();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    fetch(`/api/challenges/${challenge.id}`)
      .then(r => r.json())
      .then(d => {
        if (d.stages) {
          setStages(d.stages);
          if (d.isJoined) setStatus('active');
        }
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
      })
      .catch(() => {});
  };

  const handleJoin = async () => {
    try {
      const res = await fetch(`/api/challenges/${challenge.id}/join`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setStatus('active');
        refetchStages();
        toast('success', 'Вы присоединились к челленджу!');
      }
    } catch {}
  };

  const handleCompleteStage = async (stageId: string) => {
    const stage = stages.find(s => s.id === stageId);
    if (stage?.type === 'ДЕЙСТВИЕ' && !stageInputs[stageId]?.trim()) {
      toast('warning', 'Заполните поле перед подтверждением');
      return;
    }
    try {
      const res = await fetch(`/api/challenges/${challenge.id}/complete-step`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stepId: stageId, submission: stageInputs[stageId] || null }),
      });
      const data = await res.json();
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

  const availableSlots = challenge.maxParticipants - challenge.participantsCount;

  const getButtonLabel = () => {
    if (status === 'none') return 'Участвовать';
    if (status === 'active') return 'В процессе';
    if (status === 'completed') return 'Завершён ✓';
    return 'Не завершён';
  };

  const getButtonClass = () => {
    if (status === 'active') return 'join-btn active';
    if (status === 'completed') return 'join-btn completed';
    if (status === 'failed') return 'join-btn failed';
    return 'join-btn';
  };

  const getStageColor = (s: ChallengeStage) => {
    if (s.status === 'completed') return '#22c55e';
    if (s.status === 'active') return '#FF385C';
    return '#d1d5db';
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-shell">
        <div className="modal-inner">

          {/* CLOSE */}
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>

          {/* RIGHT PANE — Title + Stages */}
          <div className="modal-right">
            <div className="modal-title-block">
              <h2 className="modal-title">{challenge.title}</h2>
              <p className="modal-organizer">Организатор: <strong>{challenge.organizer}</strong></p>
            </div>

            {/* TABS */}
            <div className="modal-tabs">
              <button
                className={`modal-tab ${activeTab === 'info' ? 'active' : ''}`}
                onClick={() => setActiveTab('info')}
              >
                Этапы
              </button>
              <button
                className={`modal-tab ${activeTab === 'chat' ? 'active' : ''}`}
                onClick={() => setActiveTab('chat')}
              >
                <MessageSquare size={14} /> Общий чат
              </button>
            </div>

            {/* STAGES TAB */}
            {activeTab === 'info' && (
              <div className="stages-list">
                {loadingDetail ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: 40 }}>
                    <div className="mini-spinner" />
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
                    >
                      <div className="stage-num"
                        style={{ background: getStageColor(stage) }}
                      >
                        {stage.status === 'completed'
                          ? <CheckCircle2 size={14} color="white" />
                          : stage.status === 'active'
                            ? <Loader2 size={14} color="white" className="spin" />
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
              <div className="chat-wrap">
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
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendChat()}
                  />
                  <button className="chat-send" onClick={handleSendChat}>
                    <Send size={16} color="white" />
                  </button>
                </div>
              </div>
            )}

            {/* ACTION BAR */}
            <div className="modal-action-bar">
              <div className="slots-info">
                <Users size={14} />
                <span>
                  Свободно <strong>{availableSlots}</strong> из {challenge.maxParticipants} мест
                </span>
              </div>
              <button
                className={getButtonClass()}
                onClick={status === 'none' ? handleJoin : undefined}
                disabled={status !== 'none'}
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
              <div className="meta-row">
                <MapPin size={15} />
                <span>{challenge.location}</span>
              </div>
              <div className="meta-row">
                <Calendar size={15} />
                <span>До {challenge.endDate}</span>
              </div>
              <div className="meta-row">
                <Users size={15} />
                <span>
                  <strong>{challenge.participantsCount}</strong> участников ·{' '}
                  <strong className={availableSlots <= 5 ? 'few-slots' : ''}>{availableSlots} мест</strong>
                </span>
              </div>
            </div>

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

            <div className="modal-desc">
              <h3>Требования</h3>
              <p>{challenge.requirements}</p>
            </div>

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

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .mini-spinner {
          width: 32px; height: 32px; border-radius: 50%;
          border: 3px solid #f0f0f0; border-top-color: #FF385C;
          animation: spin 0.8s linear infinite;
        }

        @media (max-width: 768px) {
          .modal-shell { padding: 10px; }
          .modal-inner {
            grid-template-columns: 1fr;
            max-height: 95vh;
            border-radius: 20px;
          }
          .modal-left { max-height: 35vh; }
          .modal-img-wrap { height: 160px; }
          .modal-title { font-size: 18px; padding-right: 40px; }
          .modal-title-block { padding: 16px 16px 0; }
          .modal-tabs { padding: 12px 16px 0; }
          .stages-list { padding: 12px 16px; }
          .chat-history { padding: 12px 16px; }
          .chat-input-row { padding: 10px 16px; }
          .modal-action-bar { padding: 12px 16px; flex-direction: column; gap: 10px; }
          .join-btn { width: 100%; text-align: center; }
        }

        @media (max-width: 480px) {
          .modal-shell { padding: 0; }
          .modal-inner { border-radius: 16px; max-height: 100vh; }
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
        }
      `}</style>
    </>
  );
}
