'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Upload, Check, Loader2, Trash2 } from 'lucide-react';
import { useToast } from '@/shared/components/toast';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: {
    firstName: string;
    lastName: string;
    bio: string;
    avatarUrl: string;
    gender: string;
    birthDate: string;
  };
  onSave: (data: any) => void;
}

export function ProfileEditModal({ isOpen, onClose, initialData, onSave }: ProfileEditModalProps) {
  const [firstName, setFirstName] = useState(initialData.firstName);
  const [lastName, setLastName] = useState(initialData.lastName);
  const [bio, setBio] = useState(initialData.bio);
  const [gender, setGender] = useState(initialData.gender);
  const [birthDate, setBirthDate] = useState(initialData.birthDate);
  const [avatarPreview, setAvatarPreview] = useState(initialData.avatarUrl);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setFirstName(initialData.firstName);
      setLastName(initialData.lastName);
      setBio(initialData.bio);
      setGender(initialData.gender);
      setBirthDate(initialData.birthDate);
      setAvatarPreview(initialData.avatarUrl);
      setAvatarFile(null);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast('warning', 'Фото не должно превышать 5 МБ');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast('warning', 'Выберите изображение (JPG, PNG, WebP)');
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleUploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile) return avatarPreview || null;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', avatarFile);
      formData.append('bucket', 'avatars');
      formData.append('folder', 'profile');

      const res = await fetch('/api/media/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'Ошибка загрузки');
      return data.url;
    } catch (err: any) {
      toast('error', err.message || 'Ошибка загрузки аватара');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast('warning', 'Имя и фамилия обязательны');
      return;
    }

    setSaving(true);
    try {
      let avatarUrl = avatarPreview;
      if (avatarFile) {
        const uploaded = await handleUploadAvatar();
        if (uploaded) avatarUrl = uploaded;
        else { setSaving(false); return; }
      }

      const res = await fetch('/api/user/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          bio: bio.trim(),
          avatarUrl: avatarUrl || '',
          gender,
          birthDate: birthDate || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast('success', 'Профиль обновлён');
        onSave(data.user);
        onClose();
      } else {
        toast('error', data.error || 'Ошибка сохранения');
      }
    } catch {
      toast('error', 'Ошибка сети');
    }
    setSaving(false);
  };

  return (
    <div className="edit-overlay" onClick={onClose}>
      <div className="edit-modal" onClick={e => e.stopPropagation()}>
        <div className="edit-header">
          <h2>Редактирование профиля</h2>
          <button className="edit-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="edit-body">
          {/* Avatar section */}
          <div className="avatar-edit-section">
            <div className="avatar-preview-wrap" onClick={() => fileInputRef.current?.click()}>
              {avatarPreview ? (
                <img src={avatarPreview} alt="Аватар" className="avatar-preview-img" />
              ) : (
                <div className="avatar-preview-empty">
                  <Camera size={32} color="#aaa" />
                  <span>Загрузить фото</span>
                </div>
              )}
              <div className="avatar-overlay">
                <Camera size={20} />
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarSelect}
              style={{ display: 'none' }}
            />
            <div className="avatar-hints">
              <p>Квадратное фото, от 200×200 px</p>
              <p>JPG, PNG или WebP · макс. 5 МБ</p>
            </div>
            {avatarPreview && (
              <button className="avatar-remove" onClick={() => { setAvatarPreview(''); setAvatarFile(null); }}>
                <Trash2 size={14} /> Удалить фото
              </button>
            )}
          </div>

          {/* Fields */}
          <div className="edit-fields">
            <div className="edit-row">
              <div className="edit-field">
                <label>Имя *</label>
                <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Имя" />
              </div>
              <div className="edit-field">
                <label>Фамилия *</label>
                <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Фамилия" />
              </div>
            </div>

            <div className="edit-field">
              <label>О себе</label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Расскажите о себе, своих интересах и достижениях..."
                rows={3}
                maxLength={500}
              />
              <span className="char-count">{bio.length} / 500</span>
            </div>

            <div className="edit-row">
              <div className="edit-field">
                <label>Пол</label>
                <select value={gender} onChange={e => setGender(e.target.value)}>
                  <option value="">Не указан</option>
                  <option value="male">Мужской</option>
                  <option value="female">Женский</option>
                </select>
              </div>
              <div className="edit-field">
                <label>Дата рождения</label>
                <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        <div className="edit-footer">
          <button className="edit-cancel" onClick={onClose}>Отмена</button>
          <button className="edit-save" onClick={handleSave} disabled={saving || uploading}>
            {saving ? <><Loader2 size={16} className="spin" /> Сохранение...</> : <><Check size={16} /> Сохранить</>}
          </button>
        </div>
      </div>

      <style>{`
        .edit-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 9000; display: grid; place-items: center; animation: fadeIn 0.2s; padding: 20px; }
        .edit-modal { background: white; border-radius: 24px; width: 100%; max-width: 560px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.2); animation: slideUp 0.3s cubic-bezier(0.22, 1, 0.36, 1); }
        .edit-header { display: flex; align-items: center; justify-content: space-between; padding: 24px 28px 0; }
        .edit-header h2 { font-size: 20px; font-weight: 900; margin: 0; color: #111; }
        .edit-close { width: 32px; height: 32px; border-radius: 8px; border: none; background: #f5f5f5; cursor: pointer; display: grid; place-items: center; transition: background 0.15s; }
        .edit-close:hover { background: #e5e5e5; }
        .edit-body { padding: 24px 28px; display: flex; flex-direction: column; gap: 24px; }

        /* Avatar */
        .avatar-edit-section { display: flex; flex-direction: column; align-items: center; gap: 12px; }
        .avatar-preview-wrap {
          width: 120px; height: 120px; border-radius: 50%; overflow: hidden;
          border: 3px solid #f0f0f0; cursor: pointer; position: relative; transition: border-color 0.2s;
        }
        .avatar-preview-wrap:hover { border-color: #FF385C; }
        .avatar-preview-img { width: 100%; height: 100%; object-fit: cover; }
        .avatar-preview-empty {
          width: 100%; height: 100%; background: #f9f9f9;
          display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;
          color: #aaa; font-size: 11px; font-weight: 600;
        }
        .avatar-overlay {
          position: absolute; inset: 0; background: rgba(0,0,0,0.4); display: grid; place-items: center;
          color: white; opacity: 0; transition: opacity 0.2s;
        }
        .avatar-preview-wrap:hover .avatar-overlay { opacity: 1; }
        .avatar-hints { text-align: center; }
        .avatar-hints p { font-size: 11px; color: #aaa; margin: 2px 0; }
        .avatar-remove { display: flex; align-items: center; gap: 4px; padding: 4px 12px; border-radius: 8px; border: 1px solid #fecaca; background: #fef2f2; color: #dc2626; font-size: 12px; font-weight: 600; cursor: pointer; transition: background 0.15s; }
        .avatar-remove:hover { background: #fee2e2; }

        /* Fields */
        .edit-fields { display: flex; flex-direction: column; gap: 16px; }
        .edit-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .edit-field { display: flex; flex-direction: column; gap: 6px; position: relative; }
        .edit-field label { font-size: 12px; font-weight: 700; color: #555; text-transform: uppercase; letter-spacing: 0.04em; }
        .edit-field input, .edit-field select, .edit-field textarea {
          padding: 12px 14px; border: 1.5px solid #e5e7eb; border-radius: 12px;
          font-size: 14px; outline: none; transition: border-color 0.2s; font-family: inherit;
          background: white;
        }
        .edit-field input:focus, .edit-field select:focus, .edit-field textarea:focus { border-color: #FF385C; box-shadow: 0 0 0 3px rgba(255,56,92,0.06); }
        .edit-field textarea { resize: vertical; min-height: 80px; }
        .char-count { position: absolute; bottom: 8px; right: 12px; font-size: 11px; color: #aaa; }

        /* Footer */
        .edit-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 0 28px 24px; }
        .edit-cancel { padding: 10px 20px; border-radius: 12px; border: 1px solid #e5e7eb; background: white; font-size: 14px; font-weight: 700; cursor: pointer; transition: background 0.15s; }
        .edit-cancel:hover { background: #f5f5f5; }
        .edit-save {
          display: flex; align-items: center; gap: 6px;
          padding: 10px 24px; border-radius: 12px; border: none;
          background: #FF385C; color: white; font-size: 14px; font-weight: 700;
          cursor: pointer; transition: all 0.15s;
        }
        .edit-save:hover:not(:disabled) { background: #E31C5F; }
        .edit-save:disabled { opacity: 0.6; cursor: default; }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 600px) { .edit-modal { max-height: 95vh; } .edit-row { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
