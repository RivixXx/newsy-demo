'use client';

import React, { useEffect, useRef, useState } from 'react';

interface ScrollVideoProps {
  src: string;
  className?: string;
}

export function ScrollVideo({ src, className = '' }: ScrollVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onLoaded = () => {
      video.currentTime = 0;
      video.pause();
      setReady(true);
    };
    video.addEventListener('loadedmetadata', onLoaded);
    return () => video.removeEventListener('loadedmetadata', onLoaded);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const video = videoRef.current;
    const container = containerRef.current;
    const wrapper = wrapperRef.current;
    if (!video || !container || !wrapper) return;

    let ticking = false;
    let lastTime = 0;

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const rect = container.getBoundingClientRect();
          const viewH = window.innerHeight;

          // Container top relative to viewport
          const containerTop = rect.top;
          const containerH = rect.height;

          // Scroll progress: 0 when container enters viewport, 1 when it leaves
          // We use the container's position to determine how far through the section we are
          const scrollStart = viewH; // container just entering bottom
          const scrollEnd = -containerH; // container just leaving top
          const rawProgress = (scrollStart - containerTop) / (scrollStart - scrollEnd);
          const clampedProgress = Math.max(0, Math.min(1, rawProgress));

          // Map progress to video time
          const duration = video.duration;
          if (duration && isFinite(duration)) {
            const targetTime = clampedProgress * duration;

            // Smooth lerp for buttery playback
            const lerpFactor = 0.15;
            const newTime = lastTime + (targetTime - lastTime) * lerpFactor;

            // Only update if meaningful change
            if (Math.abs(newTime - lastTime) > 0.001) {
              video.currentTime = newTime;
              lastTime = newTime;
            }
          }

          setProgress(clampedProgress);

          // 3D transforms on wrapper
          const rotX = (clampedProgress - 0.5) * -8; // -4 to +4 degrees
          const rotY = (clampedProgress - 0.5) * 5; // -2.5 to +2.5 degrees
          const scale = 0.92 + clampedProgress * 0.16; // 0.92 to 1.08
          const translateZ = -50 + clampedProgress * 100; // depth shift

          wrapper.style.transform =
            `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${scale}) translateZ(${translateZ}px)`;

          // Glow intensity based on progress
          const glowOpacity = 0.1 + Math.sin(clampedProgress * Math.PI) * 0.3;
          container.style.setProperty('--glow-opacity', String(glowOpacity));

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // initial state

    return () => window.removeEventListener('scroll', onScroll);
  }, [ready]);

  return (
    <div ref={containerRef} className={`scroll-video-container ${className}`}>
      <div className="scroll-video-glow" />
      <div ref={wrapperRef} className="scroll-video-wrapper">
        <video
          ref={videoRef}
          src={src}
          muted
          playsInline
          preload="metadata"
          className="scroll-video-el"
          style={{ pointerEvents: 'none' }}
        />
        <div className="scroll-video-overlay" />
      </div>

      {/* Progress indicator */}
      <div className="scroll-video-progress">
        <div
          className="scroll-video-progress-bar"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>

      {/* Scroll hint */}
      <div className="scroll-video-hint" style={{ opacity: progress < 0.05 ? 1 : 0 }}>
        <div className="scroll-video-hint-arrow">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M19 12l-7 7-7-7"/>
          </svg>
        </div>
        <span>Листайте вниз</span>
      </div>

      <style>{`
        .scroll-video-container {
          position: relative;
          width: 100%;
          height: 250vh; /* tall container for scroll space */
          --glow-opacity: 0.1;
        }
        .scroll-video-wrapper {
          position: sticky;
          top: 10vh;
          width: 100%;
          max-width: 960px;
          margin: 0 auto;
          transform-style: preserve-3d;
          will-change: transform;
          z-index: 1;
        }
        .scroll-video-el {
          width: 100%;
          height: auto;
          display: block;
          border-radius: 20px;
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.06),
            0 20px 80px rgba(0,0,0,0.5),
            0 0 120px rgba(255,56,92, var(--glow-opacity));
        }
        .scroll-video-overlay {
          position: absolute;
          inset: 0;
          border-radius: 20px;
          background: linear-gradient(
            180deg,
            rgba(10,10,10,0.3) 0%,
            transparent 20%,
            transparent 80%,
            rgba(10,10,10,0.4) 100%
          );
          pointer-events: none;
        }
        .scroll-video-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 110%;
          height: 110%;
          background: radial-gradient(ellipse, rgba(255,56,92,0.15) 0%, transparent 70%);
          filter: blur(60px);
          opacity: var(--glow-opacity);
          pointer-events: none;
          z-index: 0;
          transition: opacity 0.3s;
        }
        .scroll-video-progress {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: rgba(255,255,255,0.05);
          z-index: 1000;
        }
        .scroll-video-progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #FF385C, #FF6B8A);
          transform-origin: left;
          will-change: transform;
        }
        .scroll-video-hint {
          position: fixed;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          z-index: 100;
          transition: opacity 0.4s;
          pointer-events: none;
        }
        .scroll-video-hint span {
          font-size: 12px;
          font-weight: 600;
          color: rgba(255,255,255,0.4);
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .scroll-video-hint-arrow {
          animation: hintBounce 1.5s ease-in-out infinite;
          color: rgba(255,255,255,0.3);
        }
        @keyframes hintBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(8px); }
        }

        @media (max-width: 768px) {
          .scroll-video-wrapper {
            top: 8vh;
            max-width: 100%;
            padding: 0 16px;
          }
          .scroll-video-el {
            border-radius: 14px;
          }
          .scroll-video-overlay {
            border-radius: 14px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .scroll-video-wrapper {
            transform: none !important;
          }
          .scroll-video-hint-arrow {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
