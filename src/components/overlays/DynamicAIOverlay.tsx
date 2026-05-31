import React, { useEffect, useState, useMemo } from 'react';
import type { Language } from '../../types';
import { ScanLine, Volume2, RefreshCw } from 'lucide-react';

interface HologramLabel {
  id: string;
  name: string;
  description: string;
}

interface DynamicAIOverlayProps {
  language: Language;
  onSpeak: (text: string) => void;
  onReset: () => void;
  aiExplanation?: string | null;
  title?: string | null;
  imagePrompt?: string | null;
  labels?: HologramLabel[] | null;
}

export const DynamicAIOverlay: React.FC<DynamicAIOverlayProps> = ({
  language, onSpeak, onReset, aiExplanation, title, imagePrompt, labels
}) => {
  const [analyzing, setAnalyzing] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [activeLabelId, setActiveLabelId] = useState<string | null>(null);

  const baseExplanation = aiExplanation || 'Analysis complete. Tap the labels to explore each part.';
  const displayTitle = title || 'AI-Generated Hologram';

  const activeLabel = useMemo(() => {
    if (!labels || !activeLabelId) return null;
    return labels.find(l => l.id === activeLabelId);
  }, [labels, activeLabelId]);

  const currentExplanation = activeLabel ? activeLabel.description : baseExplanation;
  const currentTitle = activeLabel ? activeLabel.name : displayTitle;

  // Use flux-schnell model for much faster image generation (~5s vs 30s)
  const imageUrl = imagePrompt
    ? `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt + ', high quality 3D render, black background, no text, no watermark')}?model=flux-schnell&seed=99&width=800&height=800&nologo=true`
    : null;

  useEffect(() => {
    const timer = setTimeout(() => setAnalyzing(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Reset image state when prompt changes
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [imagePrompt]);

  // Label orbit radius & positions
  const ORBIT_RADIUS = 220;

  return (
    <div style={{
      position: 'absolute', inset: 0,
      borderRadius: '20px',
      background: 'radial-gradient(ellipse at center, rgba(16,185,129,0.08) 0%, #020509 70%)',
      border: '1px solid rgba(16,185,129,0.2)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }}>

      {/* Scanning Grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(16,185,129,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.04) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        animation: 'pan-bg 20s linear infinite',
        pointerEvents: 'none'
      }} />

      {analyzing ? (
        /* ── Analyzing animation ── */
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, zIndex: 10 }}>
          <div style={{ position: 'relative', width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              position: 'absolute', inset: -12, borderRadius: '50%',
              border: '2px dashed rgba(16,185,129,0.5)',
              animation: 'spin 3s linear infinite'
            }} />
            <div style={{
              width: 60, height: 60, borderRadius: 16,
              background: 'rgba(16,185,129,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px rgba(16,185,129,0.4)', color: '#10b981'
            }}>
              <ScanLine size={30} />
            </div>
          </div>
          <p style={{ color: '#6ee7b7', fontSize: 16, fontWeight: 600, letterSpacing: '0.08em', animation: 'pulse 2s infinite', margin: 0 }}>
            Generating Live Hologram...
          </p>
        </div>
      ) : (
        /* ── Main hologram view ── */
        <div style={{ position: 'absolute', inset: 0, zIndex: 10 }}>

          {/* Re-scan button */}
          <div style={{ position: 'absolute', top: 14, right: 14, zIndex: 30 }}>
            <button onClick={onReset} className="glass-btn ghost" style={{
              borderRadius: 999, padding: '6px 14px', fontSize: 12,
              borderColor: 'rgba(16,185,129,0.3)', color: '#6ee7b7',
              display: 'flex', alignItems: 'center', gap: 6
            }}>
              <ScanLine size={12} /> Re-scan
            </button>
          </div>

          {/* ── Central hologram stage ── */}
          <div style={{
            position: 'absolute',
            top: '48%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 500, height: 500,
          }}>

            {/* Glow ring behind image */}
            <div style={{
              position: 'absolute', inset: 40, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 70%)',
              filter: 'blur(20px)',
              animation: 'pulse 4s ease-in-out infinite',
              pointerEvents: 'none'
            }} />

            {/* Central image area - full 420×420 */}
            <div style={{
              position: 'absolute',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 340, height: 340,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'float 6s ease-in-out infinite',
            }}>
              {imageUrl && !imageError ? (
                <>
                  {/* Loading shimmer while Pollinations generates */}
                  {!imageLoaded && (
                    <div style={{
                      position: 'absolute', inset: 0,
                      borderRadius: '50%',
                      background: 'conic-gradient(from 0deg, rgba(16,185,129,0.3), rgba(16,185,129,0.05), rgba(16,185,129,0.3))',
                      animation: 'spin 2s linear infinite',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <div style={{
                        position: 'absolute', inset: 4, borderRadius: '50%',
                        background: '#020509',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10
                      }}>
                        <RefreshCw size={32} color="#10b981" style={{ animation: 'spin 1.5s linear infinite' }} />
                        <p style={{ color: '#6ee7b7', fontSize: 11, fontWeight: 600, margin: 0, textAlign: 'center' }}>
                          AI generating<br/>3D hologram...
                        </p>
                      </div>
                    </div>
                  )}
                  <img
                    src={imageUrl}
                    alt={displayTitle}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageError(true)}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      mixBlendMode: 'screen',
                      opacity: imageLoaded ? 1 : 0,
                      transition: 'opacity 0.8s ease',
                      filter: 'drop-shadow(0 0 30px rgba(16,185,129,0.6)) drop-shadow(0 0 60px rgba(16,185,129,0.3))',
                    }}
                  />
                </>
              ) : (
                /* Fallback when image fails */
                <div style={{
                  width: 160, height: 160, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 60px rgba(16,185,129,0.5), 0 0 120px rgba(16,185,129,0.2)',
                  color: '#fff',
                  fontSize: 14, fontWeight: 700, letterSpacing: '0.05em',
                  textAlign: 'center', padding: 20, lineHeight: 1.4
                }}>
                  {displayTitle}
                </div>
              )}
            </div>

            {/* ── Orbiting labels ── */}
            {labels && labels.map((label, i) => {
              const angle = (i / labels.length) * Math.PI * 2 - Math.PI / 2;
              const x = Math.cos(angle) * ORBIT_RADIUS;
              const y = Math.sin(angle) * ORBIT_RADIUS;
              const isActive = activeLabelId === label.id;

              return (
                <div
                  key={label.id}
                  onClick={() => setActiveLabelId(prev => prev === label.id ? null : label.id)}
                  style={{
                    position: 'absolute',
                    top: `calc(50% + ${y}px)`,
                    left: `calc(50% + ${x}px)`,
                    transform: 'translate(-50%, -50%)',
                    background: isActive ? '#10b981' : 'rgba(2,5,9,0.9)',
                    border: `1.5px solid ${isActive ? '#10b981' : 'rgba(16,185,129,0.5)'}`,
                    color: isActive ? '#fff' : '#6ee7b7',
                    padding: '8px 16px',
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 700,
                    display: 'flex', alignItems: 'center', gap: 6,
                    cursor: 'pointer',
                    backdropFilter: 'blur(12px)',
                    boxShadow: isActive
                      ? '0 0 24px rgba(16,185,129,0.9), 0 4px 16px rgba(0,0,0,0.5)'
                      : '0 4px 16px rgba(0,0,0,0.6)',
                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    zIndex: isActive ? 25 : 20,
                    whiteSpace: 'nowrap',
                    userSelect: 'none',
                    scale: isActive ? '1.1' : '1',
                  }}
                >
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: isActive ? '#fff' : '#10b981',
                    boxShadow: isActive ? 'none' : '0 0 8px #10b981',
                    flexShrink: 0
                  }} />
                  {label.name}
                </div>
              );
            })}
          </div>

          {/* ── Bottom info bar ── */}
          <div style={{
            position: 'absolute', bottom: 14, left: 14, right: 14,
            background: 'rgba(2,5,9,0.88)',
            border: '1px solid rgba(16,185,129,0.25)',
            borderRadius: 16, padding: '14px 16px',
            backdropFilter: 'blur(16px)',
            display: 'flex', alignItems: 'flex-start', gap: 12,
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{
                fontSize: 14, fontWeight: 700, color: '#6ee7b7',
                margin: '0 0 5px 0',
                display: 'flex', alignItems: 'center', gap: 8
              }}>
                {activeLabel && (
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: '#f43f5e', boxShadow: '0 0 8px #f43f5e',
                    flexShrink: 0, display: 'inline-block'
                  }} />
                )}
                {currentTitle}
              </h3>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.6 }}>
                {currentExplanation}
              </p>
              {activeLabel && (
                <button onClick={() => setActiveLabelId(null)} style={{
                  background: 'none', border: 'none', color: '#10b981',
                  fontSize: 11, fontWeight: 600, padding: 0, cursor: 'pointer', marginTop: 6
                }}>
                  ← Back to overview
                </button>
              )}
            </div>
            <button
              onClick={() => onSpeak(currentExplanation)}
              style={{
                flexShrink: 0, width: 38, height: 38, borderRadius: '50%',
                background: 'rgba(16,185,129,0.12)',
                border: '1px solid rgba(16,185,129,0.25)',
                color: '#10b981', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <Volume2 size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
