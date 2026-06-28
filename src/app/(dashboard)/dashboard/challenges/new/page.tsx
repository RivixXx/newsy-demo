'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ChevronLeft, ChevronRight, Plus, Trash2, GripVertical,
  Camera, MapPin, HelpCircle, Type, Trophy, Zap, Users,
  Calendar, DollarSign, Target, X, Upload, Eye,
  Check, ArrowRight, Award, Settings2, Smartphone, Tablet, Monitor
} from 'lucide-react';
import { PageShell } from '@/shared/components/page-shell';
import { createChallengeAction } from '@/modules/challenges/actions/create';
import { FileUpload } from '@/shared/components/file-upload';

type StepType = 'action' | 'photo' | 'geo' | 'question';
type Device = 'mobile' | 'tablet' | 'desktop';

interface Step { id: string; type: StepType; title: string; description: string; points: number; options?: string[]; correctIndex?: number; location?: string; }
interface FormData { title: string; description: string; category: string; coverImage: string; startDate: string; endDate: string; maxParticipants: number; entryFee: number; isCooperative: boolean; steps: Step[]; rewardTitle: string; rewardDescription: string; }

const CATEGORIES = [
  { key: 'sport', label: 'Спорт', icon: <Zap size={18} />, color: '#16a34a' },
  { key: 'education', label: 'Обучение', icon: <Settings2 size={18} />, color: '#2563eb' },
  { key: 'quest', label: 'Квесты', icon: <Target size={18} />, color: '#d97706' },
  { key: 'art', label: 'Искусство', icon: <Camera size={18} />, color: '#7c3aed' },
  { key: 'tech', label: 'Технологии', icon: <Monitor size={18} />, color: '#db2777' },
];

const STEP_TYPES: { key: StepType; icon: React.ReactNode; label: string; desc: string; color: string }[] = [
  { key: 'action', icon: <Type size={20} />, label: 'Действие', desc: 'Текстовое задание', color: '#FF385C' },
  { key: 'photo', icon: <Camera size={20} />, label: 'Фото', desc: 'Загрузка фото', color: '#16a34a' },
  { key: 'geo', icon: <MapPin size={20} />, label: 'Локация', desc: 'Геопозиция', color: '#2563eb' },
  { key: 'question', icon: <HelpCircle size={20} />, label: 'Вопрос', desc: 'Тест', color: '#d97706' },
];

const PLACEHOLDER = 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=80';
const uid = () => Math.random().toString(36).slice(2, 10);

export default function NewChallengePage() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>({ title: '', description: '', category: '', coverImage: '', startDate: '', endDate: '', maxParticipants: 100, entryFee: 0, isCooperative: false, steps: [], rewardTitle: '', rewardDescription: '' });
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [device, setDevice] = useState<Device>('mobile');
  const [animDir, setAnimDir] = useState<'in' | 'out'>('in');

  const update = (p: Partial<FormData>) => setData(d => ({ ...d, ...p }));
  const go = (to: number) => { setAnimDir('out'); setTimeout(() => { setStep(to); setAnimDir('in'); }, 180); };
  const addStep = (type: StepType) => update({ steps: [...data.steps, { id: uid(), type, title: '', description: '', points: 50, options: type === 'question' ? ['', ''] : undefined }] });
  const updateStep = (id: string, p: Partial<Step>) => update({ steps: data.steps.map(s => s.id === id ? { ...s, ...p } : s) });
  const removeStep = (id: string) => update({ steps: data.steps.filter(s => s.id !== id) });
  const moveStep = (f: number, t: number) => { const a = [...data.steps]; const [item] = a.splice(f, 1); a.splice(t, 0, item); update({ steps: a }); };

  const totalPts = data.steps.reduce((s, st) => s + st.points, 0);
  const canNext = step === 0 ? !!data.title && !!data.category : step === 1 ? data.steps.length > 0 : true;
  const progress = ((step + 1) / 5) * 100;

  const handlePublish = async () => {
    setPublishing(true); setError(null);
    try {
      const r = await createChallengeAction({ title: data.title, description: data.description, category: data.category, coverImage: data.coverImage, startDate: data.startDate, endDate: data.endDate, maxParticipants: data.maxParticipants, entryFee: data.entryFee, isCooperative: data.isCooperative, rewardTitle: data.rewardTitle, rewardDescription: data.rewardDescription, steps: data.steps.map(s => ({ type: s.type, title: s.title, description: s.description, points: s.points, options: s.options, correctIndex: s.correctIndex, location: s.location })) });
      if (r?.error) { setError(r.error); return; }
      if (!r?.success || !r?.challengeId) { setError('Ошибка создания челенджа'); return; }
      window.location.href = `/dashboard/challenges/${r.challengeId}/publish`;
    } catch { setError('Ошибка сети'); } finally { setPublishing(false); }
  };

  const LABELS = ['Основы', 'Этапы', 'Настройки', 'Награда', 'Обзор'];
  const catObj = CATEGORIES.find(c => c.key === data.category);

  const previewW = device === 'mobile' ? 375 : device === 'tablet' ? 768 : '100%';
  const previewH = device === 'mobile' ? 667 : device === 'tablet' ? 600 : 500;
  const previewRadius = device === 'mobile' ? 36 : device === 'tablet' ? 24 : 16;
  const previewBorder = device === 'mobile' ? 8 : device === 'tablet' ? 6 : 0;

  return (
    <PageShell>
      <div className="cc">
        {/* Stepper header */}
        <header className="cc-header">
          <Link href="/dashboard" className="cc-h-back"><ChevronLeft size={18} /> Назад</Link>
          <div className="cc-stepper">
            {LABELS.map((l, i) => (
              <button key={i} className={`cc-s ${i === step ? 'on' : ''} ${i < step ? 'done' : ''}`} onClick={() => i <= step && go(i)}>
                <div className="cc-s-circle">{i < step ? <Check size={13} /> : i + 1}</div>
                <span className="cc-s-text">{l}</span>
              </button>
            ))}
            <div className="cc-s-track"><div className="cc-s-fill" style={{ width: `${progress}%` }} /></div>
          </div>
          <button className="cc-h-preview" onClick={() => setPreview(!preview)}><Eye size={15} /> Превью</button>
        </header>

        <div className="cc-layout">
          {/* Main */}
          <main className="cc-main">
            <div className={`cc-slide ${animDir}`}>

              {step === 0 && (
                <section className="cc-section">
                  <div className="cc-sh"><div className="cc-sh-icon" style={{ background: '#FF385C' }}><Target size={18} color="#fff" /></div><div><h2>Основы челенджа</h2><p>Начни с главного</p></div></div>
                  <div className="cc-f"><label>Название *</label><input className="cc-in cc-in--lg" placeholder="Например: Забег на 5 км" value={data.title} onChange={e => update({ title: e.target.value })} maxLength={100} /><span className="cc-f-hint">{data.title.length}/100</span></div>
                  <div className="cc-f"><label>Описание</label><textarea className="cc-ta" rows={3} placeholder="Расскажи о челендже..." value={data.description} onChange={e => update({ description: e.target.value })} /></div>
                  <div className="cc-f"><label>Категория *</label>
                    <div className="cc-cats">{CATEGORIES.map(c => (
                      <button key={c.key} className={`cc-cat ${data.category === c.key ? 'on' : ''}`} onClick={() => update({ category: c.key })} style={{ '--c': c.color } as any}>
                        <span className="cc-cat-icon" style={{ color: c.color }}>{c.icon}</span><span>{c.label}</span>
                        {data.category === c.key && <span className="cc-cat-ok"><Check size={11} /></span>}
                      </button>
                    ))}</div>
                  </div>
                  <div className="cc-f"><label>Обложка</label>
                    <FileUpload
                      onUpload={(url) => update({ coverImage: url })}
                      bucket="challenges"
                      folder="covers"
                      accept="image/jpeg,image/png,image/webp"
                      maxSize={10}
                      label="Загрузить обложку (1200×800 px)"
                    />
                  </div>
                </section>
              )}

              {step === 1 && (
                <section className="cc-section">
                  <div className="cc-sh"><div className="cc-sh-icon" style={{ background: '#16a34a' }}><Target size={18} color="#fff" /></div><div><h2>Этапы</h2><p>{data.steps.length} этапов · {totalPts} баллов</p></div></div>
                  <div className="cc-types">{STEP_TYPES.map(t => (
                    <button key={t.key} className="cc-type" onClick={() => addStep(t.key)}>
                      <div className="cc-type-icon" style={{ background: t.color, color: '#fff' }}>{t.icon}</div>
                      <div className="cc-type-text"><strong>{t.label}</strong><span>{t.desc}</span></div>
                    </button>
                  ))}</div>
                  <div className="cc-list">
                    {data.steps.length === 0 && <div className="cc-list-empty"><Target size={32} color="#ddd" /><p>Добавь первый этап</p></div>}
                    {data.steps.map((s, i) => {
                      const st = STEP_TYPES.find(t => t.key === s.type)!;
                      return (
                        <div key={s.id} className={`cc-card ${dragIdx === i ? 'drag' : ''} ${dragOver === i ? 'over' : ''}`} draggable onDragStart={() => setDragIdx(i)} onDragOver={e => { e.preventDefault(); setDragOver(i); }} onDragLeave={() => setDragOver(null)} onDrop={() => { if (dragIdx !== null && dragIdx !== i) moveStep(dragIdx, i); setDragIdx(null); setDragOver(null); }} onDragEnd={() => { setDragIdx(null); setDragOver(null); }}>
                          <div className="cc-card-grip"><GripVertical size={14} /></div>
                          <div className="cc-card-num" style={{ background: st.color }}>{i + 1}</div>
                          <div className="cc-card-body">
                            <div className="cc-card-top"><span className="cc-card-badge" style={{ color: st.color, background: `${st.color}10` }}>{st.icon} {st.label}</span><button className="cc-card-del" onClick={() => removeStep(s.id)}><Trash2 size={13} /></button></div>
                            <input className="cc-card-title" placeholder="Название этапа..." value={s.title} onChange={e => updateStep(s.id, { title: e.target.value })} />
                            <textarea className="cc-card-desc" rows={1} placeholder="Инструкция..." value={s.description} onChange={e => updateStep(s.id, { description: e.target.value })} />
                            <div className="cc-card-foot">
                              <div className="cc-card-pts"><Zap size={11} /><input type="number" value={s.points} onChange={e => updateStep(s.id, { points: parseInt(e.target.value) || 0 })} /><span>баллов</span></div>
                              {s.type === 'question' && <div className="cc-opts">{(s.options || []).map((o, oi) => (<div key={oi} className="cc-opt"><button className={`cc-opt-r ${s.correctIndex === oi ? 'on' : ''}`} onClick={() => updateStep(s.id, { correctIndex: oi })}><Check size={9} /></button><input placeholder={`Вариант ${oi + 1}`} value={o} onChange={e => { const opts = [...(s.options || [])]; opts[oi] = e.target.value; updateStep(s.id, { options: opts }); }} />{(s.options || []).length > 2 && <button className="cc-opt-x" onClick={() => updateStep(s.id, { options: (s.options || []).filter((_, j) => j !== oi) })}><X size={10} /></button>}</div>))}<button className="cc-opt-add" onClick={() => updateStep(s.id, { options: [...(s.options || []), ''] })}><Plus size={10} /> Вариант</button></div>}
                              {s.type === 'geo' && <input className="cc-card-geo" placeholder="Локация..." value={s.location || ''} onChange={e => updateStep(s.id, { location: e.target.value })} />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {step === 2 && (
                <section className="cc-section">
                  <div className="cc-sh"><div className="cc-sh-icon" style={{ background: '#2563eb' }}><Settings2 size={18} color="#fff" /></div><div><h2>Настройки</h2><p>Даты, лимиты, формат</p></div></div>
                  <div className="cc-grid-2">
                    <div className="cc-set"><div className="cc-set-i" style={{ background: '#FF385C12', color: '#FF385C' }}><Calendar size={16} /></div><div className="cc-set-b"><label>Начало</label><input type="date" value={data.startDate} onChange={e => update({ startDate: e.target.value })} /></div></div>
                    <div className="cc-set"><div className="cc-set-i" style={{ background: '#dc262612', color: '#dc2626' }}><Calendar size={16} /></div><div className="cc-set-b"><label>Окончание</label><input type="date" value={data.endDate} onChange={e => update({ endDate: e.target.value })} /></div></div>
                    <div className="cc-set"><div className="cc-set-i" style={{ background: '#16a34a12', color: '#16a34a' }}><Users size={16} /></div><div className="cc-set-b"><label>Макс. участников</label><input type="number" value={data.maxParticipants} onChange={e => update({ maxParticipants: parseInt(e.target.value) || 0 })} /></div></div>
                    <div className="cc-set"><div className="cc-set-i" style={{ background: '#d9770612', color: '#d97706' }}><DollarSign size={16} /></div><div className="cc-set-b"><label>Взнос (₽)</label><input type="number" value={data.entryFee} onChange={e => update({ entryFee: parseInt(e.target.value) || 0 })} /></div></div>
                  </div>
                  <div className="cc-toggle-row"><div className="cc-toggle-info"><Users size={16} /><div><strong>Кооперативный</strong><span>Командное участие</span></div></div><button className={`cc-toggle ${data.isCooperative ? 'on' : ''}`} onClick={() => update({ isCooperative: !data.isCooperative })}><div className="cc-toggle-knob" /></button></div>
                </section>
              )}

              {step === 3 && (
                <section className="cc-section">
                  <div className="cc-sh"><div className="cc-sh-icon" style={{ background: '#d97706' }}><Award size={18} color="#fff" /></div><div><h2>Награда</h2><p>Что получат победители</p></div></div>
                  <div className="cc-reward-banner"><div className="cc-reward-badge"><Trophy size={24} /></div><div><div className="cc-reward-pts">+{totalPts} баллов</div><div className="cc-reward-sub">суммарно за все этапы</div></div></div>
                  <div className="cc-f"><label>Название награды</label><input className="cc-in" placeholder="Кроссовки Nike Air Max" value={data.rewardTitle} onChange={e => update({ rewardTitle: e.target.value })} /></div>
                  <div className="cc-f"><label>Описание</label><textarea className="cc-ta" rows={2} placeholder="Что получит победитель..." value={data.rewardDescription} onChange={e => update({ rewardDescription: e.target.value })} /></div>
                </section>
              )}

              {step === 4 && (
                <section className="cc-section">
                  <div className="cc-sh"><div className="cc-sh-icon" style={{ background: '#7c3aed' }}><Eye size={18} color="#fff" /></div><div><h2>Обзор</h2><p>Проверь перед публикацией</p></div></div>
                  <div className="cc-rv">
                    <div className="cc-rv-head"><img src={data.coverImage || PLACEHOLDER} alt="" /><div><span>{catObj?.label || 'Без категории'}</span><h3>{data.title || 'Без названия'}</h3><p>{data.description || 'Без описания'}</p></div></div>
                    <div className="cc-rv-stats">{[{ v: data.steps.length, l: 'этапов' }, { v: totalPts, l: 'баллов' }, { v: data.maxParticipants, l: 'мест' }, { v: data.entryFee ? `${data.entryFee}₽` : '0₽', l: 'взнос' }].map((s, i) => (<div key={i} className="cc-rv-s"><strong>{s.v}</strong><span>{s.l}</span></div>))}</div>
                    {data.steps.length > 0 && <div className="cc-rv-list">{data.steps.map((s, i) => { const st = STEP_TYPES.find(t => t.key === s.type)!; return <div key={s.id} className="cc-rv-step"><div className="cc-rv-step-n" style={{ background: st.color }}>{i + 1}</div><div><strong>{s.title || 'Без названия'}</strong><span>{st.label} · {s.points} баллов</span></div></div>; })}</div>}
                    {data.rewardTitle && <div className="cc-rv-reward"><Award size={16} /><div><strong>{data.rewardTitle}</strong><span>{data.rewardDescription}</span></div></div>}
                  </div>
                  {error && <div className="cc-error">{error}</div>}
                </section>
              )}
            </div>

            {/* Footer nav */}
            <div className="cc-nav">
              {step > 0 && <button className="cc-btn cc-btn--back" onClick={() => go(step - 1)}><ChevronLeft size={15} /> Назад</button>}
              <div style={{ flex: 1 }} />
              {step < 4 ? (
                <button className="cc-btn cc-btn--next" disabled={!canNext} onClick={() => go(step + 1)}>Далее <ArrowRight size={15} /></button>
              ) : (
                <button className="cc-btn cc-btn--pub" onClick={handlePublish} disabled={publishing}>{publishing ? <span className="cc-spinner" /> : <><Zap size={15} /> Опубликовать</>}</button>
              )}
            </div>
          </main>

          {/* Preview panel */}
          {preview && (
            <aside className="cc-aside">
              <div className="cc-aside-head">
                <span>Превью</span>
                <div className="cc-devices">
                  <button className={`cc-dev ${device === 'mobile' ? 'on' : ''}`} onClick={() => setDevice('mobile')}><Smartphone size={14} /></button>
                  <button className={`cc-dev ${device === 'tablet' ? 'on' : ''}`} onClick={() => setDevice('tablet')}><Tablet size={14} /></button>
                  <button className={`cc-dev ${device === 'desktop' ? 'on' : ''}`} onClick={() => setDevice('desktop')}><Monitor size={14} /></button>
                </div>
              </div>
              <div className="cc-viewport" style={{ width: previewW, maxWidth: '100%', borderRadius: previewRadius, border: previewBorder ? `${previewBorder}px solid #1a1a1a` : 'none' }}>
                <div className="cc-pv-scroll">
                  <div className="cc-pv-card">
                    <img src={data.coverImage || PLACEHOLDER} alt="" className="cc-pv-img" />
                    <div className="cc-pv-body">
                      <span className="cc-pv-cat">{catObj?.label || 'Категория'}</span>
                      <h4>{data.title || 'Название челенджа'}</h4>
                      <p>{data.description || 'Описание...'}</p>
                      <div className="cc-pv-meta"><span><Zap size={10} /> {totalPts} баллов</span><span><Target size={10} /> {data.steps.length} этапов</span></div>
                      {data.steps.length > 0 && <div className="cc-pv-steps">{data.steps.slice(0, 3).map((s, i) => <div key={s.id} className="cc-pv-step"><div className="cc-pv-step-n">{i + 1}</div><span>{s.title || `Этап ${i + 1}`}</span></div>)}{data.steps.length > 3 && <span className="cc-pv-more">+{data.steps.length - 3} ещё</span>}</div>}
                      {data.rewardTitle && <div className="cc-pv-reward"><Trophy size={12} /> {data.rewardTitle}</div>}
                      <button className="cc-pv-btn">Участвовать</button>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>

      <style>{`
        .cc { min-height: 100vh; display: flex; flex-direction: column; background: #f4f4f5; }

        /* Header */
        .cc-header { position: sticky; top: 0; z-index: 50; background: rgba(255,255,255,0.88); backdrop-filter: blur(16px); border-bottom: 1px solid #e4e4e7; padding: 8px clamp(16px, 3vw, 32px); display: flex; align-items: center; gap: 12px; }
        .cc-h-back { display: flex; align-items: center; gap: 2px; font-size: 13px; font-weight: 700; color: #71717a; text-decoration: none; padding: 7px 10px; border-radius: 8px; transition: all 0.15s; flex-shrink: 0; }
        .cc-h-back:hover { background: #f4f4f5; color: #18181b; }
        .cc-h-preview { display: flex; align-items: center; gap: 5px; padding: 7px 12px; border-radius: 8px; border: 1px solid #e4e4e7; background: #fff; font-size: 12px; font-weight: 700; color: #71717a; cursor: pointer; transition: all 0.15s; flex-shrink: 0; }
        .cc-h-preview:hover { border-color: #a1a1aa; color: #18181b; }

        /* Stepper */
        .cc-stepper { flex: 1; display: flex; align-items: center; position: relative; }
        .cc-s { display: flex; flex-direction: column; align-items: center; gap: 3px; background: none; border: none; cursor: pointer; padding: 0 10px; position: relative; z-index: 1; }
        .cc-s-circle { width: 28px; height: 28px; border-radius: 50%; background: #e4e4e7; color: #a1a1aa; display: grid; place-items: center; font-size: 11px; font-weight: 800; transition: all 0.25s cubic-bezier(0.4,0,0.2,1); }
        .cc-s.on .cc-s-circle { background: #FF385C; color: #fff; box-shadow: 0 0 0 4px rgba(255,56,92,0.12); }
        .cc-s.done .cc-s-circle { background: #16a34a; color: #fff; }
        .cc-s-text { font-size: 10px; font-weight: 700; color: #a1a1aa; white-space: nowrap; }
        .cc-s.on .cc-s-text { color: #FF385C; }
        .cc-s.done .cc-s-text { color: #16a34a; }
        .cc-s-track { position: absolute; top: 14px; left: 48px; right: 48px; height: 2px; background: #e4e4e7; z-index: 0; }
        .cc-s-fill { height: 100%; background: linear-gradient(90deg, #16a34a, #FF385C); border-radius: 99px; transition: width 0.4s cubic-bezier(0.4,0,0.2,1); }

        /* Layout */
        .cc-layout { flex: 1; display: flex; }
        .cc-main { flex: 1; max-width: 700px; margin: 0 auto; padding: 24px 16px 100px; min-width: 0; }
        .cc-slide.in { animation: slideIn 0.25s ease both; }
        .cc-slide.out { animation: slideOut 0.15s ease both; }
        @keyframes slideIn { from { opacity: 0; transform: translateX(16px); } to { opacity: 1; transform: none; } }
        @keyframes slideOut { from { opacity: 1; } to { opacity: 0; transform: translateX(-16px); } }

        /* Section */
        .cc-section { display: flex; flex-direction: column; gap: 18px; }
        .cc-sh { display: flex; align-items: center; gap: 12px; }
        .cc-sh-icon { width: 38px; height: 38px; border-radius: 10px; display: grid; place-items: center; flex-shrink: 0; }
        .cc-sh h2 { font-size: 18px; font-weight: 800; margin: 0; color: #18181b; }
        .cc-sh p { font-size: 12px; color: #71717a; margin: 1px 0 0; }

        /* Fields */
        .cc-f { display: flex; flex-direction: column; gap: 5px; }
        .cc-f label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #a1a1aa; }
        .cc-f-hint { font-size: 10px; color: #d4d4d8; text-align: right; }
        .cc-in, .cc-ta { padding: 11px 14px; border: 1.5px solid #e4e4e7; border-radius: 10px; font-size: 14px; background: #fff; outline: none; transition: border-color 0.15s, box-shadow 0.15s; }
        .cc-in:focus, .cc-ta:focus { border-color: #FF385C; box-shadow: 0 0 0 3px rgba(255,56,92,0.06); }
        .cc-in--lg { font-size: 17px; font-weight: 700; padding: 14px; }
        .cc-ta { resize: vertical; font-family: inherit; }

        /* Categories */
        .cc-cats { display: flex; gap: 8px; flex-wrap: wrap; }
        .cc-cat { display: flex; align-items: center; gap: 7px; padding: 10px 14px; border-radius: 10px; border: 1.5px solid #e4e4e7; background: #fff; cursor: pointer; transition: all 0.2s; position: relative; }
        .cc-cat:hover { border-color: var(--c); }
        .cc-cat.on { border-color: var(--c); background: color-mix(in srgb, var(--c) 6%, #fff); }
        .cc-cat-icon { transition: transform 0.2s; }
        .cc-cat.on .cc-cat-icon { transform: scale(1.12); }
        .cc-cat span:not(.cc-cat-icon):not(.cc-cat-ok) { font-size: 13px; font-weight: 700; color: #3f3f46; }
        .cc-cat-ok { position: absolute; top: -5px; right: -5px; width: 16px; height: 16px; border-radius: 50%; background: var(--c); color: #fff; display: grid; place-items: animation: pop 0.2s cubic-bezier(0.34,1.56,0.64,1); }
        @keyframes pop { from { transform: scale(0); } to { transform: scale(1); } }

        /* Cover */
        .cc-cover { border-radius: 12px; overflow: hidden; cursor: pointer; border: 1.5px dashed #d4d4d8; transition: border-color 0.15s; min-height: 120px; }
        .cc-cover:hover { border-color: #FF385C; }
        .cc-cover-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; padding: 28px; color: #a1a1aa; }
        .cc-cover-empty span { font-size: 12px; font-weight: 700; }
        .cc-cover-empty small { font-size: 10px; color: #d4d4d8; }
        .cc-cover-img { position: relative; }
        .cc-cover-img img { width: 100%; height: 140px; object-fit: cover; display: block; }
        .cc-cover-x { position: absolute; top: 6px; right: 6px; width: 22px; height: 22px; border-radius: 50%; background: rgba(0,0,0,0.5); color: #fff; border: none; display: grid; place-items: center; cursor: pointer; }

        /* Types */
        .cc-types { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
        .cc-type { display: flex; align-items: center; gap: 10px; padding: 12px; border-radius: 10px; border: 1.5px solid #e4e4e7; background: #fff; cursor: pointer; transition: all 0.2s; }
        .cc-type:hover { border-color: #a1a1aa; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.04); }
        .cc-type-icon { width: 36px; height: 36px; border-radius: 8px; display: grid; place-items: center; flex-shrink: 0; }
        .cc-type-text { text-align: left; }
        .cc-type-text strong { display: block; font-size: 12px; font-weight: 700; color: #18181b; }
        .cc-type-text span { font-size: 10px; color: #a1a1aa; }

        /* Steps list */
        .cc-list { display: flex; flex-direction: column; gap: 8px; }
        .cc-list-empty { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 36px; color: #d4d4d8; }
        .cc-list-empty p { font-size: 13px; font-weight: 700; color: #a1a1aa; margin: 0; }

        .cc-card { display: flex; gap: 8px; background: #fff; border-radius: 12px; padding: 12px; border: 1.5px solid #f0f0f0; transition: all 0.15s; cursor: grab; }
        .cc-card:hover { border-color: #e4e4e7; }
        .cc-card.drag { opacity: 0.4; }
        .cc-card.over { border-color: #FF385C; background: #fff5f7; }
        .cc-card-grip { color: #d4d4d8; display: flex; align-items: flex-start; padding-top: 2px; }
        .cc-card-num { width: 24px; height: 24px; border-radius: 50%; color: #fff; display: grid; place-items: center; font-size: 10px; font-weight: 800; flex-shrink: 0; }
        .cc-card-body { flex: 1; display: flex; flex-direction: column; gap: 5px; min-width: 0; }
        .cc-card-top { display: flex; justify-content: space-between; align-items: center; }
        .cc-card-badge { display: flex; align-items: center; gap: 4px; font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 5px; }
        .cc-card-del { background: none; border: none; color: #d4d4d8; cursor: pointer; padding: 2px; border-radius: 4px; transition: all 0.1s; }
        .cc-card-del:hover { color: #dc2626; background: #fef2f2; }
        .cc-card-title { border: none; font-size: 13px; font-weight: 700; color: #18181b; outline: none; padding: 0; background: transparent; }
        .cc-card-desc { border: none; font-size: 11px; color: #a1a1aa; outline: none; padding: 0; background: transparent; resize: none; font-family: inherit; }
        .cc-card-foot { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 1px; }
        .cc-card-pts { display: flex; align-items: center; gap: 3px; font-size: 10px; color: #a1a1aa; }
        .cc-card-pts input { width: 44px; border: 1px solid #e4e4e7; border-radius: 5px; padding: 2px 5px; font-size: 11px; font-weight: 700; text-align: center; outline: none; }
        .cc-card-pts input:focus { border-color: #FF385C; }
        .cc-opts { display: flex; flex-direction: column; gap: 3px; width: 100%; }
        .cc-opt { display: flex; align-items: center; gap: 4px; }
        .cc-opt-r { width: 16px; height: 16px; border-radius: 50%; border: 1.5px solid #d4d4d8; background: #fff; display: grid; place-items: center; cursor: pointer; color: transparent; transition: all 0.1s; flex-shrink: 0; }
        .cc-opt-r.on { border-color: #16a34a; background: #16a34a; color: #fff; }
        .cc-opt input { flex: 1; border: 1px solid #e4e4e7; border-radius: 5px; padding: 4px 7px; font-size: 11px; outline: none; }
        .cc-opt input:focus { border-color: #FF385C; }
        .cc-opt-x { background: none; border: none; color: #d4d4d8; cursor: pointer; }
        .cc-opt-x:hover { color: #dc2626; }
        .cc-opt-add { align-self: flex-start; background: none; border: 1px dashed #FF385C; color: #FF385C; padding: 2px 7px; border-radius: 5px; font-size: 10px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 2px; }
        .cc-card-geo { border: 1px solid #e4e4e7; border-radius: 5px; padding: 4px 7px; font-size: 11px; outline: none; width: 100%; }
        .cc-card-geo:focus { border-color: #FF385C; }

        /* Settings */
        .cc-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .cc-set { display: flex; gap: 10px; align-items: center; background: #fff; border-radius: 10px; padding: 14px; border: 1.5px solid #f0f0f0; }
        .cc-set-i { width: 32px; height: 32px; border-radius: 8px; display: grid; place-items: center; flex-shrink: 0; }
        .cc-set-b { flex: 1; display: flex; flex-direction: column; gap: 3px; }
        .cc-set-b label { font-size: 10px; font-weight: 700; color: #a1a1aa; text-transform: uppercase; }
        .cc-set-b input { border: 1px solid #e4e4e7; border-radius: 6px; padding: 7px 8px; font-size: 12px; outline: none; width: 100%; }
        .cc-set-b input:focus { border-color: #FF385C; }

        .cc-toggle-row { display: flex; align-items: center; justify-content: space-between; background: #fff; border-radius: 10px; padding: 14px 16px; border: 1.5px solid #f0f0f0; }
        .cc-toggle-info { display: flex; align-items: center; gap: 10px; color: #71717a; }
        .cc-toggle-info strong { font-size: 13px; font-weight: 700; color: #18181b; }
        .cc-toggle-info span { font-size: 11px; color: #a1a1aa; display: block; margin-top: 1px; }
        .cc-toggle { width: 40px; height: 22px; border-radius: 11px; border: none; background: #d4d4d8; cursor: pointer; position: relative; transition: background 0.2s; padding: 0; }
        .cc-toggle.on { background: #FF385C; }
        .cc-toggle-knob { position: absolute; top: 2px; left: 2px; width: 18px; height: 18px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.12); transition: transform 0.2s cubic-bezier(0.4,0,0.2,1); }
        .cc-toggle.on .cc-toggle-knob { transform: translateX(18px); }

        /* Reward */
        .cc-reward-banner { display: flex; align-items: center; gap: 12px; background: linear-gradient(135deg, #fffbeb, #fef3c7); border-radius: 12px; padding: 16px; border: 1px solid #fde68a; }
        .cc-reward-badge { width: 44px; height: 44px; border-radius: 12px; background: #fff; display: grid; place-items: center; color: #d97706; box-shadow: 0 2px 8px rgba(217,119,6,0.12); }
        .cc-reward-pts { font-size: 17px; font-weight: 900; color: #92400e; }
        .cc-reward-sub { font-size: 11px; color: #b45309; }

        /* Review */
        .cc-rv { display: flex; flex-direction: column; gap: 10px; }
        .cc-rv-head { display: flex; gap: 12px; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #f0f0f0; }
        .cc-rv-head img { width: 160px; height: 120px; object-fit: cover; flex-shrink: 0; }
        .cc-rv-head div { padding: 12px; display: flex; flex-direction: column; gap: 3px; }
        .cc-rv-head span { font-size: 10px; font-weight: 800; color: #FF385C; text-transform: uppercase; }
        .cc-rv-head h3 { font-size: 15px; font-weight: 800; margin: 0; color: #18181b; }
        .cc-rv-head p { font-size: 12px; color: #71717a; margin: 0; }
        .cc-rv-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
        .cc-rv-s { background: #fff; border-radius: 8px; padding: 10px; text-align: center; border: 1px solid #f0f0f0; }
        .cc-rv-s strong { display: block; font-size: 16px; font-weight: 900; color: #18181b; }
        .cc-rv-s span { font-size: 10px; color: #a1a1aa; font-weight: 600; }
        .cc-rv-list { background: #fff; border-radius: 10px; padding: 12px; border: 1px solid #f0f0f0; display: flex; flex-direction: column; gap: 4px; }
        .cc-rv-step { display: flex; align-items: center; gap: 8px; padding: 5px 0; }
        .cc-rv-step-n { width: 20px; height: 20px; border-radius: 50%; color: #fff; display: grid; place-items: center; font-size: 9px; font-weight: 800; flex-shrink: 0; }
        .cc-rv-step strong { font-size: 12px; display: block; color: #18181b; }
        .cc-rv-step span { font-size: 10px; color: #a1a1aa; }
        .cc-rv-reward { display: flex; align-items: center; gap: 8px; background: #fffbeb; border-radius: 10px; padding: 12px; border: 1px solid #fde68a; color: #92400e; }
        .cc-rv-reward div { display: flex; flex-direction: column; }
        .cc-rv-reward strong { font-size: 12px; }
        .cc-rv-reward span { font-size: 10px; color: #b45309; }
        .cc-error { background: #fef2f2; color: #dc2626; padding: 9px 12px; border-radius: 8px; font-size: 12px; font-weight: 700; border: 1px solid #fecaca; }

        /* Nav */
        .cc-nav { display: flex; align-items: center; gap: 8px; padding: 14px 0; position: sticky; bottom: 0; background: linear-gradient(transparent, #f4f4f5 30%); }
        .cc-btn { display: flex; align-items: center; gap: 4px; padding: 10px 20px; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.15s; border: none; }
        .cc-btn--back { background: #fff; color: #71717a; border: 1px solid #e4e4e7; }
        .cc-btn--back:hover { border-color: #a1a1aa; color: #18181b; }
        .cc-btn--next { background: #18181b; color: #fff; }
        .cc-btn--next:hover { background: #27272a; }
        .cc-btn--next:disabled { opacity: 0.3; cursor: default; }
        .cc-btn--pub { background: #FF385C; color: #fff; box-shadow: 0 2px 8px rgba(255,56,92,0.25); }
        .cc-btn--pub:hover { background: #E31C5F; transform: translateY(-1px); }
        .cc-btn--pub:disabled { opacity: 0.5; cursor: default; transform: none; }
        .cc-spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.5s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Preview aside */
        .cc-aside { width: 380px; flex-shrink: 0; padding: 16px 16px 100px 0; position: sticky; top: 52px; height: fit-content; max-height: calc(100vh - 60px); overflow-y: auto; }
        .cc-aside-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
        .cc-aside-head span { font-size: 12px; font-weight: 700; color: #71717a; }
        .cc-devices { display: flex; gap: 4px; background: #e4e4e7; border-radius: 6px; padding: 2px; }
        .cc-dev { width: 28px; height: 26px; border-radius: 5px; border: none; background: transparent; color: #a1a1aa; display: grid; place-items: center; cursor: pointer; transition: all 0.15s; }
        .cc-dev.on { background: #fff; color: #18181b; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
        .cc-viewport { background: #1a1a1a; overflow: hidden; margin: 0 auto; transition: all 0.3s cubic-bezier(0.4,0,0.2,1); }
        .cc-pv-scroll { max-height: calc(100vh - 160px); overflow-y: auto; }
        .cc-pv-scroll::-webkit-scrollbar { width: 0; }
        .cc-pv-card { background: #fff; border-radius: 0; overflow: hidden; }
        .cc-pv-img { width: 100%; height: 180px; object-fit: cover; display: block; }
        .cc-pv-body { padding: 16px; display: flex; flex-direction: column; gap: 8px; }
        .cc-pv-cat { font-size: 10px; font-weight: 800; color: #FF385C; text-transform: uppercase; letter-spacing: 0.05em; }
        .cc-pv-body h4 { font-size: 16px; font-weight: 800; margin: 0; color: #18181b; line-height: 1.3; }
        .cc-pv-body p { font-size: 13px; color: #71717a; margin: 0; line-height: 1.5; }
        .cc-pv-meta { display: flex; gap: 12px; font-size: 11px; color: #a1a1aa; font-weight: 600; }
        .cc-pv-meta span { display: flex; align-items: center; gap: 3px; }
        .cc-pv-steps { display: flex; flex-direction: column; gap: 4px; margin-top: 4px; }
        .cc-pv-step { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #3f3f46; font-weight: 600; }
        .cc-pv-step-n { width: 18px; height: 18px; border-radius: 50%; background: #FF385C; color: #fff; display: grid; place-items: center; font-size: 9px; font-weight: 800; flex-shrink: 0; }
        .cc-pv-more { font-size: 11px; color: #a1a1aa; font-weight: 600; }
        .cc-pv-reward { display: flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 700; color: #d97706; background: #fffbeb; padding: 8px 10px; border-radius: 8px; }
        .cc-pv-btn { width: 100%; padding: 12px; border-radius: 10px; background: #FF385C; color: #fff; font-size: 14px; font-weight: 800; border: none; cursor: pointer; margin-top: 4px; }

        @media (max-width: 1100px) {
          .cc-aside { width: 320px; }
        }
        @media (max-width: 900px) {
          .cc-aside { display: none; }
          .cc-types { grid-template-columns: repeat(2, 1fr); }
          .cc-grid-2 { grid-template-columns: 1fr; }
          .cc-rv-stats { grid-template-columns: repeat(2, 1fr); }
          .cc-s-text { display: none; }
        }
        @media (max-width: 600px) {
          .cc-main { padding: 16px 10px 80px; }
          .cc-sh h2 { font-size: 16px; }
          .cc-cats { gap: 6px; }
          .cc-cat { padding: 8px 10px; font-size: 12px; }
          .cc-rv-head { flex-direction: column; }
          .cc-rv-head img { width: 100%; height: 100px; }
          .cc-btn { padding: 9px 14px; font-size: 12px; }
        }
      `}</style>
    </PageShell>
  );
}
