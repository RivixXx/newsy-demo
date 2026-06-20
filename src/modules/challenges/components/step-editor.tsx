import React from 'react';
import { 
  Trash2, 
  GripVertical, 
  HelpCircle, 
  Camera, 
  MapPin, 
  Type, 
  Plus, 
  X 
} from 'lucide-react';
import { ChallengeStep, StepType } from '../types';

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
      updates.options = ['', ''];
      updates.correctOptionIndex = 0;
    }
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

        <div className="row">
          <div className="input-group flex-2">
            <label>Заголовок</label>
            <input 
              type="text" 
              value={step.title} 
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="напр., Сделай фото на фоне памятника"
            />
          </div>
          <div className="input-group flex-1">
            <label>Баллы</label>
            <input 
              type="number" 
              value={step.points} 
              onChange={(e) => handleChange('points', parseInt(e.target.value) || 0)}
            />
          </div>
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

        .row {
          display: flex;
          gap: 12px;
        }

        .flex-1 { flex: 1; }
        .flex-2 { flex: 2; }

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
      `}</style>
    </div>
  );
};
