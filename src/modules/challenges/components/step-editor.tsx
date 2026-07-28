import React from 'react';
import {
  Trash2,
  GripVertical,
  HelpCircle,
  Camera,
  MapPin,
  Type,
  Plus,
  X,
  CheckSquare,
  AlignLeft,
  Star,
  ThumbsUp
} from 'lucide-react';
import { ChallengeStep, StepType, QuestionSubType } from '../types';

interface StepEditorProps {
  step: ChallengeStep;
  index: number;
  onUpdate: (step: ChallengeStep) => void;
  onRemove: () => void;
}

export const StepEditor: React.FC<StepEditorProps> = ({ 
  step, 
  index, 
  onUpdate, 
  onRemove 
}) => {
  const handleChange = (field: keyof ChallengeStep, value: any) => {
    onUpdate({ ...step, [field]: value });
  };

  const handleTypeChange = (type: StepType) => {
    const updates: Partial<ChallengeStep> = { type };
    if (type === 'Question' && !step.options) {
      updates.questionType = 'single';
      updates.options = ['', ''];
      updates.correctOptionIndex = 0;
    }
    if (type !== 'Question') {
      updates.questionType = undefined;
    }
    onUpdate({ ...step, ...updates });
  };

  const handleQuestionTypeChange = (qt: QuestionSubType) => {
    const updates: Partial<ChallengeStep> = { questionType: qt };
    if (qt === 'single' && !step.options) {
      updates.options = ['', ''];
      updates.correctOptionIndex = 0;
    } else if (qt === 'multiple' && !step.options) {
      updates.options = ['', ''];
      updates.correctOptionIndices = [];
    } else if (qt === 'rating') {
      updates.ratingMin = 1;
      updates.ratingMax = 5;
    }
    // For 'text' and 'yesno' no extra init needed
    onUpdate({ ...step, ...updates });
  };

  const addOption = () => {
    const options = [...(step.options || []), ''];
    handleChange('options', options);
  };

  const updateOption = (optIndex: number, value: string) => {
    const options = [...(step.options || [])];
    options[optIndex] = value;
    handleChange('options', options);
  };

  const removeOption = (optIndex: number) => {
    const options = (step.options || []).filter((_, i) => i !== optIndex);
    handleChange('options', options);
  };

  const toggleMultipleCorrect = (optIndex: number) => {
    const current = step.correctOptionIndices || [];
    const idx = current.indexOf(optIndex);
    const next = idx >= 0 ? current.filter(i => i !== optIndex) : [...current, optIndex];
    handleChange('correctOptionIndices', next);
  };

  return (
    <div className="step-editor">
      <div className="drag-handle">
        <GripVertical size={20} />
      </div>

      <div className="step-content">
        <div className="step-header">
          <span className="step-number">Этап {index + 1}</span>
          <button className="remove-btn" onClick={onRemove} title="Удалить этап">
            <Trash2 size={18} />
          </button>
        </div>

        <div className="input-group">
          <label>Тип задания</label>
          <div className="type-selector">
            {[
              { type: 'Action', icon: <Type size={16} />, label: 'Действие' },
              { type: 'Question', icon: <HelpCircle size={16} />, label: 'Вопрос' },
              { type: 'Photo', icon: <Camera size={16} />, label: 'Фото' },
              { type: 'Location', icon: <MapPin size={16} />, label: 'Геопозиция' },
            ].map((t) => (
              <button
                key={t.type}
                className={`type-btn ${step.type === t.type ? 'active' : ''}`}
                onClick={() => handleTypeChange(t.type as StepType)}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="input-group">
          <label>Заголовок</label>
          <input 
            type="text" 
            value={step.title} 
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="напр., Сделай фото на фоне памятника"
          />
        </div>

        <div className="input-group">
          <label>Инструкция</label>
          <textarea 
            value={step.description} 
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Опишите, что именно нужно сделать..."
          />
        </div>

        {step.type === 'Question' && (
          <>
            {/* Question sub-type selector */}
            <div className="input-group">
              <label>Тип вопроса</label>
              <div className="question-type-selector">
                {[
                  { type: 'single' as QuestionSubType, icon: <HelpCircle size={14} />, label: 'Один из списка' },
                  { type: 'multiple' as QuestionSubType, icon: <CheckSquare size={14} />, label: 'Несколько из списка' },
                  { type: 'text' as QuestionSubType, icon: <AlignLeft size={14} />, label: 'Текстовый ответ' },
                  { type: 'rating' as QuestionSubType, icon: <Star size={14} />, label: 'Оценка' },
                  { type: 'yesno' as QuestionSubType, icon: <ThumbsUp size={14} />, label: 'Да / Нет' },
                ].map((qt) => (
                  <button
                    key={qt.type}
                    className={`type-btn ${(step.questionType || 'single') === qt.type ? 'active' : ''}`}
                    onClick={() => handleQuestionTypeChange(qt.type)}
                  >
                    {qt.icon}
                    <span>{qt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Single choice */}
            {(step.questionType || 'single') === 'single' && (
              <div className="question-options">
                <label>Варианты ответа</label>
                {(step.options || []).map((opt, i) => (
                  <div key={i} className="option-row">
                    <input
                      type="radio"
                      checked={step.correctOptionIndex === i}
                      onChange={() => handleChange('correctOptionIndex', i)}
                      title="Пометить как правильный ответ"
                    />
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => updateOption(i, e.target.value)}
                      placeholder={`Вариант ${i + 1}`}
                    />
                    <button className="icon-btn" onClick={() => removeOption(i)}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <button className="add-opt-btn" onClick={addOption}>
                  <Plus size={14} /> Добавить вариант
                </button>
              </div>
            )}

            {/* Multiple choice */}
            {step.questionType === 'multiple' && (
              <div className="question-options">
                <label>Варианты ответа</label>
                {(step.options || []).map((opt, i) => (
                  <div key={i} className="option-row">
                    <input
                      type="checkbox"
                      checked={(step.correctOptionIndices || []).includes(i)}
                      onChange={() => toggleMultipleCorrect(i)}
                      title="Пометить как правильный ответ"
                    />
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => updateOption(i, e.target.value)}
                      placeholder={`Вариант ${i + 1}`}
                    />
                    <button className="icon-btn" onClick={() => removeOption(i)}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <button className="add-opt-btn" onClick={addOption}>
                  <Plus size={14} /> Добавить вариант
                </button>
                {(step.correctOptionIndices || []).length > 0 && (
                  <span className="hint-text">Отмечено правильных: {(step.correctOptionIndices || []).length}</span>
                )}
              </div>
            )}

            {/* Text answer */}
            {step.questionType === 'text' && (
              <div className="question-options">
                <label>Настройки текстового ответа</label>
                <div className="option-row" style={{ gap: 16 }}>
                  <div className="input-group" style={{ flex: 1 }}>
                    <label>Мин. длина</label>
                    <input
                      type="number"
                      min={0}
                      value={step.minLength ?? ''}
                      onChange={(e) => handleChange('minLength', e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="0"
                    />
                  </div>
                  <div className="input-group" style={{ flex: 1 }}>
                    <label>Макс. длина</label>
                    <input
                      type="number"
                      min={1}
                      value={step.maxLength ?? ''}
                      onChange={(e) => handleChange('maxLength', e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="500"
                    />
                  </div>
                </div>
                <span className="hint-text">Участник введёт текстовый ответ. Настройте ограничения длины текста.</span>
              </div>
            )}

            {/* Rating */}
            {step.questionType === 'rating' && (
              <div className="question-options">
                <label>Настройки оценки</label>
                <div className="option-row" style={{ gap: 16 }}>
                  <div className="input-group" style={{ flex: 1 }}>
                    <label>От</label>
                    <input
                      type="number"
                      min={0}
                      value={step.ratingMin ?? 1}
                      onChange={(e) => handleChange('ratingMin', Number(e.target.value))}
                    />
                  </div>
                  <div className="input-group" style={{ flex: 1 }}>
                    <label>До</label>
                    <input
                      type="number"
                      min={2}
                      max={100}
                      value={step.ratingMax ?? 5}
                      onChange={(e) => handleChange('ratingMax', Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className="option-row" style={{ gap: 16 }}>
                  <div className="input-group" style={{ flex: 1 }}>
                    <label>Подпись минимума (необязательно)</label>
                    <input
                      type="text"
                      value={step.ratingMinLabel ?? ''}
                      onChange={(e) => handleChange('ratingMinLabel', e.target.value || undefined)}
                      placeholder="напр., Плохо"
                    />
                  </div>
                  <div className="input-group" style={{ flex: 1 }}>
                    <label>Подпись максимума (необязательно)</label>
                    <input
                      type="text"
                      value={step.ratingMaxLabel ?? ''}
                      onChange={(e) => handleChange('ratingMaxLabel', e.target.value || undefined)}
                      placeholder="напр., Отлично"
                    />
                  </div>
                </div>
                <span className="hint-text">Участник поставит оценку от {step.ratingMin ?? 1} до {step.ratingMax ?? 5}.</span>
              </div>
            )}

            {/* Yes/No */}
            {step.questionType === 'yesno' && (
              <div className="question-options">
                <label>Правильный ответ</label>
                <div className="option-row" style={{ gap: 12 }}>
                  <button
                    className={`type-btn ${step.correctOptionIndex === 0 ? 'active' : ''}`}
                    onClick={() => {
                      handleChange('correctOptionIndex', 0);
                      handleChange('options', ['Да', 'Нет']);
                    }}
                  >
                    <ThumbsUp size={14} /> Да
                  </button>
                  <button
                    className={`type-btn ${step.correctOptionIndex === 1 ? 'active' : ''}`}
                    onClick={() => {
                      handleChange('correctOptionIndex', 1);
                      handleChange('options', ['Да', 'Нет']);
                    }}
                  >
                    <ThumbsUp size={14} style={{ transform: 'rotate(180deg)' }} /> Нет
                  </button>
                </div>
                <span className="hint-text">Участник выберет Да или Нет. Отметьте правильный ответ выше.</span>
              </div>
            )}
          </>
        )}

        {step.type === 'Location' && (
          <div className="input-group">
            <label>Целевая локация</label>
            <input 
              type="text" 
              value={step.locationLabel || ''} 
              onChange={(e) => handleChange('locationLabel', e.target.value)}
              placeholder="напр., Вход в Центральный парк"
            />
          </div>
        )}
      </div>

      <style jsx>{`
        .step-editor {
          background: var(--surface);
          border: 2px solid var(--line);
          border-radius: var(--radius-lg);
          padding: 20px;
          display: flex;
          gap: 16px;
          position: relative;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .step-editor:hover {
          border-color: var(--brand);
          box-shadow: 0 8px 20px rgba(180, 95, 52, 0.05);
        }

        .drag-handle {
          cursor: grab;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          padding-top: 4px;
        }

        .step-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .step-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .step-number {
          font-weight: 800;
          font-size: 14px;
          text-transform: uppercase;
          color: var(--brand);
        }

        .remove-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .remove-btn:hover {
          color: #ef4444;
          background: #fef2f2;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .input-group label {
          font-size: 12px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        input[type="text"],
        input[type="number"],
        textarea,
        select {
          padding: 12px 16px;
          border: 1px solid var(--line);
          border-radius: var(--radius-md);
          background: var(--surface-muted);
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }

        input:focus,
        textarea:focus {
          border-color: var(--brand);
        }

        .type-selector {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 8px;
        }

        .type-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px;
          border: 1px solid var(--line);
          border-radius: var(--radius-md);
          background: var(--surface);
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          transition: all 0.2s;
        }

        .type-btn:hover {
          background: var(--bg-accent);
        }

        .type-btn.active {
          border-color: var(--brand);
          background: var(--brand);
          color: white;
        }

        .question-options {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 12px;
          background: var(--bg-accent);
          border-radius: var(--radius-md);
        }

        .option-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .icon-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .add-opt-btn {
          align-self: flex-start;
          background: none;
          border: 1px dashed var(--brand);
          color: var(--brand);
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 4px;
        }

        .question-type-selector {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 6px;
        }

        .question-type-selector .type-btn {
          font-size: 11px;
          padding: 8px 6px;
          gap: 4px;
        }

        .question-type-selector .type-btn span {
          font-size: 10px;
          white-space: nowrap;
        }

        .hint-text {
          font-size: 11px;
          color: var(--text-muted);
          font-style: italic;
          margin-top: 4px;
        }

        @media (max-width: 640px) {
          .question-type-selector {
            grid-template-columns: repeat(3, 1fr);
          }
          .question-type-selector .type-btn {
            padding: 10px 6px;
            min-height: 44px;
          }
          .option-row[style*="gap: 16"] {
            flex-direction: column;
            gap: 8px !important;
          }
        }
        @media (max-width: 400px) {
          .question-type-selector {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
};
