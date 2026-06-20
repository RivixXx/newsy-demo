'use client';

import React from 'react';
import { PageShell } from '@/shared/components/page-shell';

export default function Loading() {
  return (
    <PageShell variant="public">
      <div className="loading-container">
        {/* Skeleton for Search Bar / Header */}
        <div className="skeleton-header">
          <div className="skeleton skeleton-title"></div>
          <div className="skeleton skeleton-search"></div>
          <div className="skeleton skeleton-tags"></div>
        </div>

        {/* Skeleton for Grid */}
        <div className="skeleton-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton skeleton-image"></div>
              <div className="skeleton-card-body">
                <div className="skeleton skeleton-text w-1/3"></div>
                <div className="skeleton skeleton-text w-3/4 h-lg"></div>
                <div className="skeleton skeleton-text w-1/2"></div>
                <div className="skeleton skeleton-button mt-auto"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .loading-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px 16px;
          width: 100%;
        }

        .skeleton-header {
          margin-bottom: 40px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #f8f8f8 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 8px;
        }

        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .skeleton-title { height: 40px; width: 250px; border-radius: 12px; }
        .skeleton-search { height: 52px; width: 100%; border-radius: 20px; }
        .skeleton-tags { height: 40px; width: 60%; border-radius: 20px; }

        .skeleton-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
        }

        .skeleton-card {
          border-radius: 28px;
          border: 1px solid rgba(0,0,0,0.05);
          overflow: hidden;
          background: white;
          display: flex;
          flex-direction: column;
          height: 400px;
        }

        .skeleton-image {
          height: 180px;
          width: 100%;
          border-radius: 0;
        }

        .skeleton-card-body {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex-grow: 1;
        }

        .skeleton-text { height: 16px; }
        .w-1\\/3 { width: 33%; }
        .w-1\\/2 { width: 50%; }
        .w-3\\/4 { width: 75%; }
        .h-lg { height: 24px; }

        .skeleton-button {
          height: 48px;
          width: 100%;
          border-radius: 14px;
          margin-top: auto;
        }
      `}</style>
    </PageShell>
  );
}
