'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Settings, 
  Eye, 
  Smartphone, 
  Monitor, 
  Save, 
  ChevronLeft,
  Image as ImageIcon,
  Info,
  Zap,
  Globe,
  MapPin,
  Trophy,
  Gift,
  Map,
  LayoutTemplate,
  X,
} from 'lucide-react';
import { ChallengeStep, Challenge, ChallengeCategory } from '../types';
import { StepEditor } from './step-editor';
import { ChallengeCard } from './challenge-card';
import { CHALLENGE_TEMPLATES, type ChallengeTemplate } from '@/shared/data/challenge-templates';

export const ChallengeConstructor: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');
  const [showTemplates, setShowTemplates] = useState(false);
  
  const [challenge, setChallenge] = useState<Partial<Challenge>>({
    title: '',
    description: '',
    category: 'Quest',
    imageUrl: '',
    steps: [],
    organizer: 'Your Brand',
    format: 'ONLINE',
    address: '',
    achievement: '',
    reward: '',
    brandPrimaryColor: '#FF385C',
  });

  const updateChallenge = (updates: Partial<Challenge>) => {
    setChallenge(prev => ({ ...prev, ...updates }));
  };

  const addStep = () => {
    const newStep: ChallengeStep = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'Action',
      title: '',
      description: '',
      points: 10,
    };
    updateChallenge({ steps: [...(challenge.steps || []), newStep] });
  };

  const updateStep = (index: number, updatedStep: ChallengeStep) => {
    const steps = [...(challenge.steps || [])];
    steps[index] = updatedStep;
    updateChallenge({ steps });
  };

  const removeStep = (index: number) => {
    const steps = (challenge.steps || []).filter((_, i) => i !== index);
    updateChallenge({ steps });
  };

  const applyTemplate = (template: ChallengeTemplate) => {
    const steps: ChallengeStep[] = template.steps.map((s, i) => ({
      id: Math.random().toString(36).substr(2, 9),
      type: s.type as any,
      title: s.title,
      description: s.description,
      points: 10,
    }));
    setChallenge({
      title: template.name,
      description: template.description,
      category: template.category as ChallengeCategory,
      format: template.format,
      steps,
      achievement: template.achievement,
      reward: template.reward,
      organizer: 'Your Brand',
    });
    setShowTemplates(false);
  };

  // Mock for preview
  const previewChallenge: Challenge = {
    id: 'preview',
    title: challenge.title || 'Название челенджа',
    organizer: challenge.organizer || 'Организатор',
    category: challenge.category || 'Quest',
    pointsReward: 0,
    imageUrl: challenge.imageUrl || '/images/challenge-placeholder.svg',
    participantsCount: 0,
    isJoined: false,
    badges: [],
  };

  return (
    <div className="constructor-container">
      <header className="constructor-header">
        <div className="header-left">
          <button className="back-btn">
            <ChevronLeft size={20} />
          </button>
          <div className="header-titles">
            <h1>Конструктор Челенджей</h1>
            <p>Создайте увлекательный многоэтапный квест</p>
          </div>
        </div>
        <div className="header-actions">
          <div className="tab-switcher">
            <button 
              className={activeTab === 'editor' ? 'active' : ''} 
              onClick={() => setActiveTab('editor')}
            >
              <Settings size={18} /> Редактор
            </button>
            <button 
              className={activeTab === 'preview' ? 'active' : ''} 
              onClick={() => setActiveTab('preview')}
            >
              <Eye size={18} /> Превью
            </button>
          </div>
          <button className="save-btn secondary" onClick={() => setShowTemplates(true)}>
            <LayoutTemplate size={18} /> Шаблон
          </button>
          <button className="save-btn secondary">
            <Save size={18} /> В черновик
          </button>
          <button 
            className="publish-btn" 
            onClick={async () => {
              try {
                const response = await fetch('/api/payments/create', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ challengeId: 'preview' }), // In real app, use challenge.id
                });
                const data = await response.json();
                if (data.checkoutUrl) {
                  window.location.href = data.checkoutUrl;
                } else {
                  alert('Error: ' + (data.error || 'Failed to create payment'));
                }
              } catch (e) {
                alert('Network error');
              }
            }}
          >
            <Zap size={18} fill="currentColor" /> Опубликовать (Платный)
          </button>
        </div>
      </header>

      <main className="constructor-main">
        {activeTab === 'editor' ? (
          <div className="editor-layout">
            <section className="editor-section">
              <div className="section-header">
                <Info size={20} className="section-icon" />
                <h2>Основная информация</h2>
              </div>
              <div className="card shadow-sm">
                <div className="input-row">
                  <div className="input-group flex-2">
                    <label>Название челенджа</label>
                    <input 
                      type="text" 
                      value={challenge.title}
                      onChange={e => updateChallenge({ title: e.target.value })}
                      placeholder="Придумайте яркое название..."
                    />
                  </div>
                  <div className="input-group flex-1">
                    <label>Категория</label>
                    <select 
                      value={challenge.category}
                      onChange={e => updateChallenge({ category: e.target.value as ChallengeCategory })}
                    >
                      <option value="Quest">Квест</option>
                      <option value="Sport">Спорт</option>
                      <option value="Education">Обучение</option>
                      <option value="Art">Искусство</option>
                      <option value="Tech">Техно</option>
                    </select>
                  </div>
                </div>
                <div className="input-group">
                  <label>Описание</label>
                  <textarea 
                    rows={3}
                    value={challenge.description}
                    onChange={e => updateChallenge({ description: e.target.value })}
                    placeholder="Расскажите участникам о сути челенджа..."
                  />
                </div>
                <div className="image-upload-placeholder">
                  <ImageIcon size={32} />
                  <span>Нажмите, чтобы загрузить обложку</span>
                  <p>Рекомендуется: 1200x800px</p>
                </div>
              </div>
            </section>

            {/* Формат */}
            <section className="editor-section">
              <div className="section-header">
                <Globe size={20} className="section-icon" />
                <h2>Формат</h2>
              </div>
              <div className="card shadow-sm">
                <div className="format-options">
                  {[
                    { value: 'ONLINE', label: 'Онлайн', icon: '🌐', desc: 'Участники выполняют задания удалённо' },
                    { value: 'OFFLINE', label: 'Офлайн', icon: '📍', desc: 'Задания выполняются в конкретном месте' },
                    { value: 'HYBRID', label: 'Гибрид', icon: '🔄', desc: 'Сочетание онлайн и офлайн заданий' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`format-option ${challenge.format === opt.value ? 'active' : ''}`}
                      onClick={() => updateChallenge({ format: opt.value as 'ONLINE' | 'OFFLINE' | 'HYBRID' })}
                    >
                      <span className="format-icon">{opt.icon}</span>
                      <span className="format-label">{opt.label}</span>
                      <span className="format-desc">{opt.desc}</span>
                    </button>
                  ))}
                </div>
                {challenge.format !== 'ONLINE' && (
                  <div className="input-group">
                    <label><MapPin size={14} /> Адрес проведения</label>
                    <input 
                      type="text" 
                      value={challenge.address || ''}
                      onChange={e => updateChallenge({ address: e.target.value })}
                      placeholder="г. Москва, ул. Примерная, д. 1"
                    />
                  </div>
                )}
              </div>
            </section>

            {/* Награды */}
            <section className="editor-section">
              <div className="section-header">
                <Trophy size={20} className="section-icon" />
                <h2>Награды</h2>
              </div>
              <div className="card shadow-sm">
                <div className="rewards-grid">
                  <div className="input-group">
                    <label><Trophy size={14} /> Достижение</label>
                    <input 
                      type="text" 
                      value={challenge.achievement || ''}
                      onChange={e => updateChallenge({ achievement: e.target.value })}
                      placeholder="напр., Мастер спорта"
                    />
                    <p className="input-hint">Название достижения за выполнение челленджа</p>
                  </div>
                  <div className="input-group">
                    <label><Gift size={14} /> Награда</label>
                    <input 
                      type="text" 
                      value={challenge.reward || ''}
                      onChange={e => updateChallenge({ reward: e.target.value })}
                      placeholder="напр., Сертификат на 5000₽"
                    />
                    <p className="input-hint">Приз для лучших участников</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Брендирование */}
            <section className="editor-section">
              <div className="section-header">
                <Zap size={20} className="section-icon" />
                <h2>Брендирование</h2>
                <span className="step-count" style={{ background: '#8b5cf6' }}>Premium</span>
              </div>
              <div className="card shadow-sm">
                <div className="input-row">
                  <div className="input-group">
                    <label>Основной цвет</label>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input
                        type="color"
                        value={challenge.brandPrimaryColor || '#FF385C'}
                        onChange={e => updateChallenge({ brandPrimaryColor: e.target.value })}
                        style={{ width: 40, height: 40, border: 'none', borderRadius: 8, cursor: 'pointer' }}
                      />
                      <input
                        type="text"
                        value={challenge.brandPrimaryColor || '#FF385C'}
                        onChange={e => updateChallenge({ brandPrimaryColor: e.target.value })}
                        placeholder="#FF385C"
                        style={{ flex: 1 }}
                      />
                    </div>
                  </div>
                  <div className="input-group">
                    <label>Дополнительный цвет</label>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input
                        type="color"
                        value={challenge.brandSecondaryColor || '#ffffff'}
                        onChange={e => updateChallenge({ brandSecondaryColor: e.target.value })}
                        style={{ width: 40, height: 40, border: 'none', borderRadius: 8, cursor: 'pointer' }}
                      />
                      <input
                        type="text"
                        value={challenge.brandSecondaryColor || '#ffffff'}
                        onChange={e => updateChallenge({ brandSecondaryColor: e.target.value })}
                        placeholder="#ffffff"
                        style={{ flex: 1 }}
                      />
                    </div>
                  </div>
                </div>
                <div className="input-group">
                  <label>Название спонсора</label>
                  <input
                    type="text"
                    value={challenge.sponsorName || ''}
                    onChange={e => updateChallenge({ sponsorName: e.target.value })}
                    placeholder="напр., Coca-Cola"
                  />
                </div>
                <div className="input-group">
                  <label>Ссылка на спонсора</label>
                  <input
                    type="url"
                    value={challenge.sponsorUrl || ''}
                    onChange={e => updateChallenge({ sponsorUrl: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>
                <div className="image-upload-placeholder" style={{ height: 120 }}>
                  <ImageIcon size={24} />
                  <span>Логотип бренда</span>
                  <p>Рекомендуется: 200x200px, PNG с прозрачным фоном</p>
                </div>
              </div>
            </section>

            <section className="editor-section">
              <div className="section-header">
                <Settings size={20} className="section-icon" />
                <h2>Управление этапами</h2>
                <span className="step-count">{(challenge.steps || []).length} этапов</span>
              </div>
              <div className="steps-list">
                {(challenge.steps || []).map((step, index) => (
                  <StepEditor 
                    key={step.id}
                    step={step}
                    index={index}
                    onUpdate={(updated) => updateStep(index, updated)}
                    onRemove={() => removeStep(index)}
                  />
                ))}
                <button className="add-step-btn" onClick={addStep}>
                  <Plus size={20} /> Добавить новый этап
                </button>
              </div>
            </section>

          </div>
        ) : (
          <div className="preview-layout">
            <div className="preview-controls">
              <button 
                className={previewDevice === 'mobile' ? 'active' : ''}
                onClick={() => setPreviewDevice('mobile')}
              >
                <Smartphone size={18} /> Смартфон
              </button>
              <button 
                className={previewDevice === 'desktop' ? 'active' : ''}
                onClick={() => setPreviewDevice('desktop')}
              >
                <Monitor size={18} /> Десктоп
              </button>
            </div>
            
            <div className={`preview-container ${previewDevice}`}>
              <div className="preview-content">
                <ChallengeCard challenge={previewChallenge} />
                <div className="preview-steps-info">
                  <h3>Этапы челенджа ({(challenge.steps || []).length})</h3>
                  <ul className="preview-steps-list">
                    {(challenge.steps || []).map((step, i) => (
                      <li key={i}>
                        <span className="p-step-num">{i + 1}</span>
                        <div className="p-step-body">
                          <strong>{step.title || 'Этап без названия'}</strong>
                          <span>{step.type}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Модалка шаблонов */}
      {showTemplates && (
        <div className="templates-overlay" onClick={() => setShowTemplates(false)}>
          <div className="templates-modal" onClick={e => e.stopPropagation()}>
            <div className="templates-header">
              <h2>Выберите шаблон</h2>
              <button onClick={() => setShowTemplates(false)} className="templates-close">
                <X size={20} />
              </button>
            </div>
            <div className="templates-grid">
              {CHALLENGE_TEMPLATES.map(template => (
                <button
                  key={template.id}
                  className="template-card"
                  onClick={() => applyTemplate(template)}
                >
                  <div className="template-name">{template.name}</div>
                  <div className="template-desc">{template.description}</div>
                  <div className="template-meta">
                    <span>{template.steps.length} этапов</span>
                    <span>{template.format}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .constructor-container {
          min-height: 100vh;
          background: var(--bg);
          display: flex;
          flex-direction: column;
        }

        .constructor-header {
          background: var(--surface);
          border-bottom: 2px solid var(--line);
          padding: 16px 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .back-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1px solid var(--line);
          background: var(--surface);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text);
        }

        .header-titles h1 {
          font-size: 24px;
          font-weight: 800;
          margin: 0;
          color: var(--text);
        }

        .header-titles p {
          font-size: 14px;
          color: var(--text-muted);
          margin: 0;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .tab-switcher {
          background: var(--bg-accent);
          padding: 4px;
          border-radius: var(--radius-md);
          display: flex;
          gap: 4px;
        }

        .tab-switcher button {
          border: none;
          background: none;
          padding: 8px 16px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-muted);
          transition: all 0.2s;
        }

        .tab-switcher button.active {
          background: var(--surface);
          color: var(--brand);
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .save-btn {
          background: var(--brand);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: var(--radius-md);
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .save-btn:hover {
          background: var(--brand-strong);
        }

        .save-btn.secondary {
          background: var(--bg-accent);
          color: var(--text);
          border: 1px solid var(--line);
        }

        .publish-btn {
          background: linear-gradient(135deg, #00c853, #64dd17);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: var(--radius-md);
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(0, 200, 83, 0.3);
          transition: all 0.2s;
        }

        .publish-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 200, 83, 0.4);
        }

        .constructor-main {
          padding: 40px;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
          flex: 1;
        }

        .editor-layout {
          display: flex;
          flex-direction: column;
          gap: 48px;
        }

        .editor-section {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .section-icon {
          color: var(--brand);
        }

        .section-header h2 {
          font-size: 18px;
          font-weight: 800;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .step-count {
          background: var(--brand);
          color: white;
          font-size: 12px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 10px;
        }

        .card {
          background: var(--surface);
          border-radius: var(--radius-xl);
          padding: 32px;
          border: 1px solid var(--line);
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .shadow-sm {
          box-shadow: 0 4px 20px rgba(0,0,0,0.02);
        }

        .input-row {
          display: flex;
          gap: 20px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .input-group label {
          font-size: 13px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        input[type="text"],
        textarea,
        select {
          padding: 14px 20px;
          border: 1px solid var(--line);
          border-radius: var(--radius-md);
          background: var(--surface-muted);
          font-size: 16px;
          outline: none;
          transition: border-color 0.2s;
        }

        input:focus,
        textarea:focus {
          border-color: var(--brand);
        }

        .flex-1 { flex: 1; }
        .flex-2 { flex: 2; }

        .image-upload-placeholder {
          height: 200px;
          border: 2px dashed var(--line);
          border-radius: var(--radius-lg);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s;
        }

        .image-upload-placeholder:hover {
          border-color: var(--brand);
          background: var(--bg-accent);
          color: var(--brand);
        }

        .image-upload-placeholder span {
          font-weight: 700;
        }

        .image-upload-placeholder p {
          font-size: 12px;
          margin: 0;
        }

        .steps-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .add-step-btn {
          padding: 20px;
          border: 2px dashed var(--line);
          border-radius: var(--radius-lg);
          background: var(--surface);
          color: var(--text-muted);
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          transition: all 0.2s;
        }

        .add-step-btn:hover {
          border-color: var(--brand);
          color: var(--brand);
          background: var(--bg-accent);
        }

        /* Preview Styles */
        .preview-layout {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 32px;
        }

        .preview-controls {
          background: var(--surface);
          padding: 6px;
          border-radius: var(--radius-md);
          display: flex;
          gap: 8px;
          border: 1px solid var(--line);
        }

        .preview-controls button {
          border: none;
          background: none;
          padding: 10px 20px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-muted);
        }

        .preview-controls button.active {
          background: var(--text);
          color: white;
        }

        .preview-container {
          background: var(--bg-accent);
          border: 8px solid var(--text);
          border-radius: 40px;
          overflow: hidden;
          box-shadow: 0 40px 100px rgba(0,0,0,0.2);
          transition: all 0.3s ease;
        }

        .preview-container.mobile {
          width: 375px;
          height: 667px;
          overflow-y: auto;
        }

        .preview-container.desktop {
          width: 1000px;
          height: 600px;
          overflow-y: auto;
        }

        .preview-content {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .preview-steps-info {
          background: var(--surface);
          padding: 24px;
          border-radius: var(--radius-lg);
        }

        .preview-steps-info h3 {
          font-size: 16px;
          font-weight: 800;
          margin: 0 0 16px 0;
          text-transform: uppercase;
        }

        .preview-steps-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .preview-steps-list li {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .p-step-num {
          width: 24px;
          height: 24px;
          background: var(--brand);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 800;
          flex-shrink: 0;
        }

        .p-step-body {
          display: flex;
          flex-direction: column;
        }

        .p-step-body strong {
          font-size: 14px;
        }

        .p-step-body span {
          font-size: 12px;
          color: var(--text-muted);
        }

        .format-options {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .format-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 20px 16px;
          border: 2px solid var(--line);
          border-radius: var(--radius-lg);
          background: var(--surface);
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
        }

        .format-option:hover {
          border-color: var(--brand);
        }

        .format-option.active {
          border-color: var(--brand);
          background: var(--bg-accent);
        }

        .format-icon {
          font-size: 28px;
        }

        .format-label {
          font-size: 14px;
          font-weight: 700;
          color: var(--text);
        }

        .format-desc {
          font-size: 12px;
          color: var(--text-muted);
          line-height: 1.4;
        }

        .rewards-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .input-hint {
          font-size: 12px;
          color: var(--text-muted);
          margin: 4px 0 0 0;
        }

        .templates-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .templates-modal {
          background: var(--surface);
          border-radius: 24px;
          width: 100%;
          max-width: 700px;
          max-height: 80vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .templates-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid var(--line);
        }

        .templates-header h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 800;
        }

        .templates-close {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-muted);
          padding: 4px;
        }

        .templates-grid {
          padding: 16px;
          overflow-y: auto;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 12px;
        }

        .template-card {
          background: var(--bg-accent);
          border: 2px solid var(--line);
          border-radius: 16px;
          padding: 16px;
          cursor: pointer;
          text-align: left;
          transition: all 0.2s;
        }

        .template-card:hover {
          border-color: var(--brand);
          background: var(--surface);
        }

        .template-name {
          font-size: 15px;
          font-weight: 800;
          margin-bottom: 6px;
        }

        .template-desc {
          font-size: 13px;
          color: var(--text-muted);
          margin-bottom: 10px;
          line-height: 1.4;
        }

        .template-meta {
          display: flex;
          gap: 12px;
          font-size: 12px;
          color: var(--text-muted);
        }

        @media (max-width: 800px) {
          .constructor-header {
            padding: 16px 20px;
          }
          .constructor-main {
            padding: 20px;
          }
          .input-row {
            flex-direction: column;
          }
          .header-actions {
            gap: 12px;
          }
          .header-titles p {
            display: none;
          }
          .format-options {
            grid-template-columns: 1fr;
          }
          .rewards-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
