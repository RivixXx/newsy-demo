'use client';

import React from 'react';

/* ── Inline spinner (buttons, badges, small UI) ── */
export function Spinner({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <>
      <svg
        className={`n-spinner ${className}`}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
      >
        <path d="M21 12a9 9 0 1 1-6.22-8.56" />
      </svg>
      <style>{`.n-spinner { animation: spinner-spin 0.7s linear infinite; flex-shrink: 0; }`}</style>
    </>
  );
}

/* ── Full-page branded spinner (dual ring + "N" logo) ── */
export function PageSpinner({ text = 'Загружаем данные...' }: { text?: string }) {
  return (
    <div className="n-page-spinner">
      <div className="n-page-spinner__rings">
        <div className="n-page-spinner__ring" />
        <div className="n-page-spinner__ring n-page-spinner__ring--2" />
        <div className="n-page-spinner__logo">N</div>
      </div>
      {text && <p className="n-page-spinner__text">{text}</p>}
      <style>{`
        .n-page-spinner { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 50vh; gap: 24px; }
        .n-page-spinner__rings { position: relative; width: 80px; height: 80px; }
        .n-page-spinner__ring { position: absolute; inset: 0; border-radius: 50%; border: 3px solid transparent; border-top-color: #FF385C; animation: spinner-spin 1s linear infinite; }
        .n-page-spinner__ring--2 { inset: 8px; border-top-color: #E31C5F; animation-duration: 1.5s; animation-direction: reverse; }
        .n-page-spinner__logo { position: absolute; inset: 0; display: grid; place-items: center; font-size: 28px; font-weight: 900; color: #FF385C; }
        .n-page-spinner__text { font-size: 14px; color: #888; font-weight: 600; margin: 0; animation: spinner-pulse 1.5s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
