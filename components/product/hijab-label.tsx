"use client";

import { useEffect, useState } from "react";

export default function HijabLabel() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Start the animation after a short delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="absolute left-0 bottom-[5px] z-20 perspective-800">
      <div 
        className={`hijab-label ${isVisible ? 'animate-in' : 'animate-out'}`}
        style={{
          animation: 'foldRightToLeft 5s cubic-bezier(0.22, 1, 0.36, 1) infinite',
          fontSize: '12px',
          padding: '3px 6px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          transition: 'all 0.3s ease',
          background: 'linear-gradient(to right, #B870DB, #9A5FFF)',
          transformStyle: 'preserve-3d',
          display: 'inline-block',
          borderRadius: '0 4px 4px 0',
          color: 'white',
          fontWeight: 'bold',
          borderLeft: '1px solid rgba(255,255,255,0.4)',
          borderTop: '1px solid rgba(255,255,255,0.4)',
          borderBottom: '1px solid rgba(255,255,255,0.4)'
        }}
      >
        <span 
          className="sparkle-icon"
          style={{
            animation: 'sparkle 1.5s ease-in-out infinite',
            display: 'inline-block',
            marginRight: '4px'
          }}
        >
          ✨
        </span>
        Hijab Included
      </div>
      <style jsx>{`
        @keyframes foldRightToLeft {
          0% { transform: scaleX(0) rotateY(90deg); transform-origin: left; opacity: 0; }
          15% { transform: scaleX(1) rotateY(0); transform-origin: left; opacity: 1; }
          85% { transform: scaleX(1) rotateY(0); transform-origin: left; opacity: 1; }
          100% { transform: scaleX(0) rotateY(-90deg); transform-origin: right; opacity: 0; }
        }
        @keyframes sparkle {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
        }
        .hijab-label:hover {
          animation-play-state: paused;
        }
        @media (min-width: 640px) {
          .hijab-label {
            bottom: 140px;
            font-size: 10px;
            padding: 4px 8px;
          }
        }
        @media (min-width: 768px) {
          .hijab-label {
            bottom: 170px;
            font-size: 12px;
            padding: 6px 12px;
          }
        }
      `}</style>
    </div>
  );
} 