'use client';

import React, { useRef, useState } from 'react';
import { Upload, X, Image, FileText, Loader2 } from 'lucide-react';

interface FileUploadProps {
  onUpload: (url: string, path: string) => void;
  onError?: (error: string) => void;
  bucket?: string;
  folder?: string;
  accept?: string;
  maxSize?: number;
  label?: string;
}

export function FileUpload({
  onUpload,
  onError,
  bucket = 'challenges',
  folder = 'uploads',
  accept = 'image/*',
  maxSize = 10,
  label = 'Загрузить файл',
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSize * 1024 * 1024) {
      onError?.(`Файл слишком большой (макс. ${maxSize} МБ)`);
      return;
    }

    setFileName(file.name);
    setUploading(true);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', bucket);
      formData.append('folder', folder);

      const res = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Ошибка загрузки');
      }

      onUpload(data.url, data.path);
    } catch (err: any) {
      onError?.(err.message || 'Ошибка загрузки');
      setPreview(null);
      setFileName(null);
    } finally {
      setUploading(false);
    }
  };

  const handleClear = () => {
    setPreview(null);
    setFileName(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="fu-wrap">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFile}
        style={{ display: 'none' }}
      />

      {preview ? (
        <div className="fu-preview">
          <img src={preview} alt="" className="fu-preview-img" />
          <div className="fu-preview-info">
            <span className="fu-preview-name">{fileName}</span>
            <button className="fu-preview-remove" onClick={handleClear}>
              <X size={14} />
            </button>
          </div>
        </div>
      ) : fileName ? (
        <div className="fu-file">
          <FileText size={20} color="#888" />
          <span className="fu-file-name">{fileName}</span>
          <button className="fu-file-remove" onClick={handleClear}>
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          className="fu-dropzone"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 size={24} className="fu-spin" />
          ) : (
            <Upload size={24} color="#aaa" />
          )}
          <span>{uploading ? 'Загрузка...' : label}</span>
          <small>Макс. {maxSize} МБ</small>
        </button>
      )}

      <style jsx>{`
        .fu-wrap { width: 100%; }
        .fu-dropzone {
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          padding: 32px; border: 2px dashed #d4d4d8; border-radius: 12px;
          background: #fafafa; cursor: pointer; transition: all 0.2s;
          width: 100%; color: #888;
        }
        .fu-dropzone:hover:not(:disabled) { border-color: #FF385C; background: #fff5f7; }
        .fu-dropzone:disabled { opacity: 0.5; }
        .fu-dropzone span { font-size: 13px; font-weight: 700; }
        .fu-dropzone small { font-size: 11px; color: #aaa; }
        .fu-preview { border-radius: 12px; overflow: hidden; border: 1px solid #f0f0f0; }
        .fu-preview-img { width: 100%; height: 160px; object-fit: cover; display: block; }
        .fu-preview-info { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: #f9fafb; }
        .fu-preview-name { font-size: 12px; color: #888; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .fu-preview-remove { width: 24px; height: 24px; border-radius: 6px; border: none; background: #fee2e2; color: #dc2626; display: grid; place-items: center; cursor: pointer; flex-shrink: 0; }
        .fu-file { display: flex; align-items: center; gap: 10px; padding: 12px 14px; background: #f9fafb; border-radius: 10px; border: 1px solid #f0f0f0; }
        .fu-file-name { flex: 1; font-size: 13px; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .fu-file-remove { width: 24px; height: 24px; border-radius: 6px; border: none; background: #fee2e2; color: #dc2626; display: grid; place-items: center; cursor: pointer; flex-shrink: 0; }
        .fu-spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
