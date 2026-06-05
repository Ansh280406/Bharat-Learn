import React, { useEffect, useState } from 'react';
import type { Language } from '../../types';
import { ScanLine, Volume2, RefreshCw, ChevronDown, ChevronUp, Info, X } from 'lucide-react';
import { CustomARScene, hasCustomARScene, CUSTOM_AR_SCENES } from '../ar/CustomARScene';


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
  hologramHtml?: string | null;
  wikipediaQuery?: string | null;
}

export const DynamicAIOverlay: React.FC<DynamicAIOverlayProps> = ({
  onSpeak, onReset, aiExplanation: propExplanation, title, labels: propLabels, hologramHtml, wikipediaQuery
}) => {
  const [analyzing, setAnalyzing] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [infoExpanded, setInfoExpanded] = useState(false);
  const [activeLabel, setActiveLabel] = useState<HologramLabel | null>(null);

  // Auto-generated content from /api/generate-ar
  const [generatedExplanation, setGeneratedExplanation] = useState<string | null>(null);
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const [generatedLabels, setGeneratedLabels] = useState<HologramLabel[] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);


  // The topic key for CustomARScene lookup
  const topicKey = wikipediaQuery || title || '';

  // Check if we have a beautiful custom scene for this topic
  const hasCustom = hasCustomARScene(topicKey);

  // Merged explanation
  const aiExplanation = propExplanation || generatedExplanation;
  const baseExplanation = aiExplanation || 'Tap any label on the diagram to learn about that part in detail!';
  const displayTitle = title || 'AR Simulation';

  const currentLabels = propLabels || generatedLabels;
  const currentHtml = hologramHtml || generatedHtml;
  const currentExplanation = activeLabel ? activeLabel.description : baseExplanation;
  const currentTitle = activeLabel ? activeLabel.name : displayTitle;

  // Auto-fetch hologramHtml + labels from /api/generate-ar
  // Always runs, even when propExplanation is provided, to get the animated HTML scene
  useEffect(() => {
    if (!topicKey) return;
    // Don't re-fetch if we already have html
    if (generatedHtml) return;

    setIsGenerating(true);
    fetch('/api/generate-ar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: topicKey, description: '' })
    })
      .then(r => r.json())
      .then(data => {
        if (data.aiExplanation && !propExplanation) setGeneratedExplanation(data.aiExplanation);
        if (data.hologramHtml) setGeneratedHtml(data.hologramHtml);
        if (data.hologramLabels && !propLabels) setGeneratedLabels(data.hologramLabels);
      })
      .catch(err => console.warn('generate-ar failed:', err))
      .finally(() => setIsGenerating(false));
  }, [topicKey]);

  // Startup animation
  useEffect(() => {
    const t = setTimeout(() => setAnalyzing(false), 1200);
    return () => clearTimeout(t);
  }, []);

  // Auto-expand info on label click
  useEffect(() => {
    if (activeId) setInfoExpanded(true);
  }, [activeId]);

  const handleLabelClick = (label: HologramLabel) => {
    setActiveLabel(label);
    setInfoExpanded(true);
  };

  const sceneConfig = CUSTOM_AR_SCENES[topicKey];
  const accentColor = sceneConfig?.accentColor || '#10b981';
  const bgGradient = sceneConfig?.bgColor || 'radial-gradient(ellipse at 50% 45%, rgba(16,185,129,0.07) 0%, #020509 68%)';

  return (
    <div style={{
      position: 'absolute', inset: 0,
      borderRadius: '20px',
      background: bgGradient,
      border: `1px solid ${accentColor}25`,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }}>

      {/* Subtle grid overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `linear-gradient(${accentColor}12 1px, transparent 1px), linear-gradient(90deg, ${accentColor}12 1px, transparent 1px)`,
        backgroundSize: '36px 36px',
        pointerEvents: 'none',
      }} />

      {/* Corner brackets */}
      {(['tl','tr','bl','br'] as const).map(pos => (
        <div key={pos} style={{
          position: 'absolute',
          top: pos.startsWith('t') ? 10 : 'auto',
          bottom: pos.startsWith('b') ? 10 : 'auto',
          left: pos.endsWith('l') ? 10 : 'auto',
          right: pos.endsWith('r') ? 10 : 'auto',
          width: 20, height: 20,
          borderTop: pos.startsWith('t') ? `2px solid ${accentColor}60` : 'none',
          borderBottom: pos.startsWith('b') ? `2px solid ${accentColor}60` : 'none',
          borderLeft: pos.endsWith('l') ? `2px solid ${accentColor}60` : 'none',
          borderRight: pos.endsWith('r') ? `2px solid ${accentColor}60` : 'none',
          pointerEvents: 'none',
        }} />
      ))}

      {/* AR Active badge */}
      <div style={{
        position: 'absolute', top: 12, left: 14, zIndex: 40,
        display: 'flex', alignItems: 'center', gap: 6,
        background: `${accentColor}18`,
        border: `1px solid ${accentColor}35`,
        borderRadius: 999, padding: '4px 12px',
      }}>
        <div style={{
          width: 7, height: 7, borderRadius: '50%',
          background: accentColor,
          boxShadow: `0 0 8px ${accentColor}`,
          animation: 'pulse 2s infinite',
        }} />
        <span style={{ color: accentColor, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em' }}>AR ACTIVE</span>
      </div>

      {/* Re-scan button */}
      <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 40 }}>
        <button onClick={onReset} className="glass-btn ghost" style={{
          borderRadius: 999, padding: '6px 14px', fontSize: 11,
          borderColor: `${accentColor}35`, color: accentColor,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <ScanLine size={11} /> Re-scan
        </button>
      </div>

      {/* ── Main Viewport ── */}
      {analyzing ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, zIndex: 10 }}>
          <div style={{ position: 'relative', width: 72, height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', inset: -10, borderRadius: '50%', border: `2px dashed ${accentColor}50`, animation: 'spin 3s linear infinite' }} />
            <div style={{ position: 'absolute', inset: -4, borderRadius: '50%', border: `1px solid ${accentColor}25`, animation: 'spin 5s linear infinite reverse' }} />
            <div style={{
              width: 52, height: 52, borderRadius: 16,
              background: `${accentColor}18`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 24px ${accentColor}30`, color: accentColor,
            }}>
              <ScanLine size={26} />
            </div>
          </div>
          <p style={{ color: accentColor, fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', animation: 'pulse 2s infinite', margin: 0 }}>
            Initializing AR...
          </p>
          <p style={{ color: `${accentColor}70`, fontSize: 10, margin: 0 }}>{displayTitle}</p>
        </div>
      ) : (
        <div style={{ position: 'absolute', inset: 0, zIndex: 10, display: 'flex', flexDirection: 'column' }}>

          {/* ── AR Scene viewport ── */}
          <div style={{
            flex: 1, position: 'relative',
            paddingTop: '44px',    // space for top bar
            paddingBottom: '80px', // space for info bar
            paddingLeft: '8px', paddingRight: '8px',
            display: 'flex', flexDirection: 'column'
          }}>
            <div style={{ flex: 1, position: 'relative' }}>
              {hasCustom ? (
                <CustomARScene
                  topic={topicKey}
                  onLabelClick={handleLabelClick}
                  activeId={activeId}
                  setActiveId={(id) => {
                    setActiveId(id);
                    if (!id) setActiveLabel(null);
                  }}
                />
              ) : (
                /* Fallback: animated HTML scene if provided */
                currentHtml ? (
                  <div style={{ width: '100%', height: '100%', borderRadius: 16, overflow: 'hidden', boxShadow: `0 0 40px ${accentColor}20` }}>
                    <iframe
                      srcDoc={currentHtml}
                      title="AR Scene"
                      style={{ width: '100%', height: '100%', border: 'none', background: 'transparent' }}
                      sandbox="allow-scripts allow-same-origin"
                    />
                  </div>
                ) : (
                  /* No scene: show a beautiful placeholder */
                  <div style={{
                    width: '100%', height: '100%',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: 16,
                  }}>
                    <div style={{
                      width: 120, height: 120, borderRadius: '50%',
                      background: `radial-gradient(circle, ${accentColor}25 0%, ${accentColor}08 70%)`,
                      border: `2px solid ${accentColor}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: `0 0 60px ${accentColor}20`,
                      fontSize: '48px',
                      animation: 'hologramFloat 6s ease-in-out infinite',
                      position: 'relative',
                    }}>
                      {isGenerating ? (
                        <div style={{
                          width: 56, height: 56, borderRadius: '50%',
                          border: `4px solid ${accentColor}30`,
                          borderTopColor: accentColor,
                          animation: 'spin 1s linear infinite',
                        }} />
                      ) : '📚'}
                      {isGenerating && (
                        <div style={{
                          position: 'absolute', inset: -6, borderRadius: '50%',
                          border: `2px dashed ${accentColor}40`,
                          animation: 'spin 4s linear infinite reverse',
                        }} />
                      )}
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ color: accentColor, fontSize: 14, fontWeight: 700, margin: '0 0 6px' }}>{displayTitle}</p>
                      <p style={{ color: `${accentColor}70`, fontSize: 11, margin: 0 }}>
                        {isGenerating ? '⚙️ Building AR scene with AI...' : 'Interactive scene failed to load'}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>

            {/* Interactive Labels Panel (Always Visible) */}
            {!hasCustom && currentLabels && currentLabels.length > 0 && (
              <div style={{ 
                padding: '12px 0 0', 
                display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center',
                flexShrink: 0 
              }}>
                {currentLabels.map(label => (
                  <button
                    key={label.id}
                    onClick={() => { setActiveId(label.id); handleLabelClick(label); }}
                    style={{
                      background: activeId === label.id ? accentColor : `${accentColor}18`,
                      border: `1.5px solid ${activeId === label.id ? accentColor : `${accentColor}40`}`,
                      color: '#fff', padding: '6px 14px', borderRadius: 999,
                      fontSize: 11, fontWeight: 700, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: activeId === label.id ? 'white' : accentColor }} />
                    {label.name}
                  </button>
                ))}
              </div>
            )}
          </div>


          {/* ── Bottom Info Panel ── */}
          <div style={{
            position: 'absolute', bottom: 8, left: 8, right: 8,
            background: 'rgba(2,5,9,0.95)',
            border: `1px solid ${accentColor}25`,
            borderRadius: 16,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: `0 -4px 30px rgba(0,0,0,0.5), 0 0 0 1px ${accentColor}10`,
            overflow: 'hidden',
            zIndex: 30,
          }}>
            {/* Header row */}
            <div
              onClick={() => setInfoExpanded(v => !v)}
              style={{
                padding: '11px 14px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
                {activeLabel ? (
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: accentColor,
                    boxShadow: `0 0 8px ${accentColor}`,
                    animation: 'pulse 2s infinite', flexShrink: 0,
                  }} />
                ) : (
                  <Info size={13} color={accentColor} style={{ flexShrink: 0 }} />
                )}
                <span style={{
                  fontSize: 12, fontWeight: 700, color: accentColor,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {currentTitle}
                </span>
                {isGenerating && !infoExpanded && (
                  <RefreshCw size={11} color={accentColor} style={{ animation: 'spin 1.5s linear infinite', flexShrink: 0 }} />
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                {activeLabel && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setActiveId(null); setActiveLabel(null); setInfoExpanded(false); }}
                    style={{ background: 'none', border: 'none', color: `${accentColor}80`, cursor: 'pointer', padding: '2px', display: 'flex' }}
                  >
                    <X size={13} />
                  </button>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); onSpeak(currentExplanation); }}
                  style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: `${accentColor}15`, border: `1px solid ${accentColor}30`,
                    color: accentColor, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Volume2 size={12} />
                </button>
                {infoExpanded ? <ChevronDown size={15} color={accentColor} /> : <ChevronUp size={15} color={accentColor} />}
              </div>
            </div>

            {/* Expanded explanation */}
            {infoExpanded && (
              <div style={{ padding: '0 14px 14px' }}>
                <div style={{ height: 1, background: `${accentColor}18`, marginBottom: 10 }} />
                <p style={{
                  fontSize: 12.5, color: 'rgba(255,255,255,0.85)',
                  lineHeight: 1.7, margin: 0, whiteSpace: 'pre-line',
                }}>
                  {isGenerating && !currentExplanation ? (
                    <span style={{ color: `${accentColor}70` }}>⚙️ Generating explanation...</span>
                  ) : currentExplanation}
                </p>
                {activeLabel && (
                  <button
                    onClick={() => { setActiveId(null); setActiveLabel(null); setInfoExpanded(false); }}
                    style={{
                      background: 'none', border: 'none',
                      color: accentColor, fontSize: 11, fontWeight: 600,
                      padding: 0, cursor: 'pointer', marginTop: 10,
                    }}
                  >
                    ← Back to overview
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes hologramFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
      `}</style>
    </div>
  );
};
