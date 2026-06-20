'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, ChevronLeft, Sparkles } from 'lucide-react';

export default function PaymentStatusPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const status = searchParams.get('status');
    const mock = searchParams.get('mock');
    setIsSuccess(status === 'success' || mock === 'true');
  }, [searchParams]);

  return (
    <div className="status-page">
      <div className="status-card">
        {isSuccess ? (
          <>
            <div className="icon-container success">
              <CheckCircle size={64} />
            </div>
            <h1>Payment Successful!</h1>
            <p>
              Your challenge has been successfully paid for and is now <strong>published</strong>.
              Participants can now find it in the explore feed.
            </p>
            <div className="stats-preview">
              <div className="stat">
                <span>Status</span>
                <strong className="published-badge">Published</strong>
              </div>
              <div className="stat">
                <span>Visibility</span>
                <strong>Public</strong>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="icon-container error">
              <XCircle size={64} />
            </div>
            <h1>Payment Failed</h1>
            <p>
              Something went wrong with the transaction. Don&apos;t worry, your challenge
              is still saved as a draft. You can try publishing it again.
            </p>
          </>
        )}

        <div className="actions">
          <Link href={`/dashboard/challenges/${params?.id}`} className="btn-primary">
            <ChevronLeft size={18} /> Back to Constructor
          </Link>
          {isSuccess && (
            <Link href="/" className="btn-secondary">
              <Sparkles size={18} /> View in Feed
            </Link>
          )}
        </div>
      </div>

      <style jsx>{`
        .status-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg);
          padding: 20px;
        }

        .status-card {
          max-width: 500px;
          width: 100%;
          background: var(--surface);
          border-radius: var(--radius-xl);
          padding: 48px;
          text-align: center;
          box-shadow: var(--shadow);
          border: 1px solid var(--line);
        }

        .icon-container {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
        }

        .icon-container.success {
          background: #f0fdf4;
          color: #22c55e;
        }

        .icon-container.error {
          background: #fef2f2;
          color: #ef4444;
        }

        h1 {
          font-size: 28px;
          font-weight: 800;
          margin: 0 0 16px 0;
        }

        p {
          color: var(--text-muted);
          line-height: 1.6;
          margin-bottom: 32px;
        }

        .stats-preview {
          background: var(--bg-accent);
          border-radius: var(--radius-lg);
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 32px;
        }

        .stat {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
        }

        .stat span {
          color: var(--text-muted);
        }

        .published-badge {
          color: #22c55e;
          text-transform: uppercase;
          font-size: 12px;
          letter-spacing: 0.5px;
        }

        .actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .btn-primary, .btn-secondary {
          padding: 14px;
          border-radius: var(--radius-md);
          font-weight: 700;
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
        }

        .btn-primary {
          background: var(--text);
          color: white;
        }

        .btn-secondary {
          background: var(--surface);
          color: var(--text);
          border: 1px solid var(--line);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}