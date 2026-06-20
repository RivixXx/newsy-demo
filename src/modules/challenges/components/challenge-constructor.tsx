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
  Users,
  Info,
  Zap
} from 'lucide-react';
import { ChallengeStep, Challenge, ChallengeCategory } from '../types';
import { StepEditor } from './step-editor';
import { ChallengeCard } from './challenge-card';

export const ChallengeConstructor: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');
  
  const [challenge, setChallenge] = useState<Partial<Challenge>>({
    title: '',
    description: '',
    category: 'Quest',
    imageUrl: '',
    steps: [],
    isCooperative: false,
    partnerBrands: [],
    pointsReward: 0,
    organizer: 'Your Brand',
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

  // Mock for preview
  const previewChallenge: Challenge = {
    id: 'preview',
    title: challenge.title || 'Название челенджа',
    organizer: challenge.organizer || 'Организатор',
    category: challenge.category || 'Quest',
    pointsReward: challenge.steps?.reduce((acc, s) => acc + s.points, 0) || 0,
    imageUrl: challenge.imageUrl || 'https://via.placeholder.com/600x400?text=Загрузите+Изображение',
    participantsCount: 0,
    isJoined: false,
    badges: challenge.isCooperative ? ['cooperative'] : [],
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

            <section className="editor-section">
              <div className="section-header">
                <Users size={20} className="section-icon" />
                <h2>Командные настройки</h2>
              </div>
              <div className="card shadow-sm cooperative-card">
                <div className="toggle-row">
                  <div className="toggle-info">
                    <h3>Совместный челендж</h3>
                    <p>Создавайте челенджи вместе с партнерами</p>
                  </div>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={challenge.isCooperative}
                      onChange={e => updateChallenge({ isCooperative: e.target.checked })}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>
                {challenge.isCooperative && (
                  <div className="input-group">
                    <label>Бренды-партнеры</label>
                    <input 
                      type="text" 
                      placeholder="Введите имя бренда и нажмите Enter..."
                    />
                  </div>
                )}
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
                          <span>{step.points} баллов • {step.type}</span>
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

        .cooperative-card {
          gap: 16px;
        }

        .toggle-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .toggle-info h3 {
          font-size: 16px;
          font-weight: 700;
          margin: 0;
        }

        .toggle-info p {
          font-size: 14px;
          color: var(--text-muted);
          margin: 4px 0 0 0;
        }

        /* Switch Styles */
        .switch {
          position: relative;
          display: inline-block;
          width: 52px;
          height: 28px;
        }

        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: var(--line);
          transition: .4s;
        }

        .slider:before {
          position: absolute;
          content: "";
          height: 20px;
          width: 20px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          transition: .4s;
        }

        input:checked + .slider {
          background-color: var(--brand);
        }

        input:checked + .slider:before {
          transform: translateX(24px);
        }

        .slider.round {
          border-radius: 34px;
        }

        .slider.round:before {
          border-radius: 50%;
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
        }
      `}</style>
    </div>
  );
};
