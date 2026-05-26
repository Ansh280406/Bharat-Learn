import React, { useEffect, useState, useMemo } from 'react';
import type { Language } from '../../types';
import { Sparkles, ScanLine, BrainCircuit, Activity, Zap } from 'lucide-react';

interface DynamicAIOverlayProps {
  language: Language;
  onSpeak: (text: string) => void;
  onReset: () => void;
  aiExplanation?: string | null;
  title?: string | null;
}

export const DynamicAIOverlay: React.FC<DynamicAIOverlayProps> = ({ 
  language, onSpeak, onReset, aiExplanation, title 
}) => {
  const [analyzing, setAnalyzing] = useState(true);
  const [activeNode, setActiveNode] = useState<string | null>(null);

  // Fallback text if no real API explanation is provided
  const explanation = aiExplanation || (
    language === 'en' 
      ? "Analysis complete. The structure appears to be an organic compound. You can explore the functional groups."
      : language === 'hi' 
        ? "विश्लेषण पूर्ण। संरचना एक कार्बनिक यौगिक प्रतीत होती है।"
        : "વિશ્લેષણ પૂર્ણ. રચના કાર્બનિક સંયોજન હોવાનું જણાય છે."
  );

  const displayTitle = title || "Dynamically Generated Model";

  // Extract keywords to generate dynamic floating nodes
  const keywords = useMemo(() => {
    if (!explanation) return [];
    // Simple extraction: words longer than 5 chars, taking up to 5 unique words
    const words = explanation.replace(/[.,!?()]/g, '').split(/\s+/);
    const longWords = words.filter(w => w.length > 5);
    const unique = Array.from(new Set(longWords)).slice(0, 5);
    return unique.length > 0 ? unique : ['Concept 1', 'Concept 2', 'Concept 3'];
  }, [explanation]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnalyzing(false);
      onSpeak(explanation);
    }, 2500);
    return () => clearTimeout(timer);
  }, [explanation, onSpeak]);

  return (
    <div style={{
      width: '100%', height: '350px',
      borderRadius: '20px',
      background: 'radial-gradient(circle at center, rgba(16, 185, 129, 0.1) 0%, rgba(2, 5, 9, 0.9) 100%)',
      border: '1px solid rgba(16, 185, 129, 0.2)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Scanning Grid Background */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(var(--grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--grid-color) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        animation: 'pan-bg 10s linear infinite',
      }} />

      {analyzing ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', zIndex: 10 }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              border: '2px dashed rgba(16, 185, 129, 0.5)',
              animation: 'spin 4s linear infinite',
              position: 'absolute', top: -10, left: -10, right: -10, bottom: -10
            }} />
            <div style={{
              width: '60px', height: '60px', borderRadius: '16px',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)',
              color: 'var(--emerald)'
            }}>
              <ScanLine size={32} />
            </div>
          </div>
          <h3 style={{
            fontSize: '18px', fontFamily: 'var(--font-heading)',
            color: 'var(--emerald-light)', letterSpacing: '0.05em',
            animation: 'pulse 2s infinite'
          }}>
            Generating Live AR...
          </h3>
        </div>
      ) : (
        <div style={{ position: 'absolute', inset: 0, zIndex: 10 }}>
          
          {/* Dynamic Floating Nodes */}
          {keywords.map((kw, i) => {
            const angle = (i / keywords.length) * Math.PI * 2;
            const radius = 100;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            const isActive = activeNode === kw;

            return (
              <div 
                key={kw}
                onClick={() => { setActiveNode(kw); onSpeak(kw); }}
                style={{
                  position: 'absolute',
                  top: `calc(50% + ${y}px)`,
                  left: `calc(50% + ${x}px)`,
                  transform: 'translate(-50%, -50%)',
                  background: isActive ? 'var(--emerald)' : 'rgba(2,5,9,0.7)',
                  border: `1px solid ${isActive ? 'var(--emerald)' : 'rgba(16,185,129,0.3)'}`,
                  color: isActive ? '#fff' : 'var(--emerald-light)',
                  padding: '6px 12px',
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  cursor: 'pointer',
                  backdropFilter: 'blur(4px)',
                  boxShadow: isActive ? '0 0 15px rgba(16,185,129,0.6)' : 'none',
                  animation: `float ${3 + i % 2}s ease-in-out infinite`,
                  animationDelay: `${i * 0.5}s`,
                  transition: 'all 0.3s ease',
                  zIndex: isActive ? 20 : 15
                }}
              >
                {kw}
              </div>
            );
          })}

          {/* Central AI Core */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'
          }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--emerald) 0%, #059669 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 30px rgba(16, 185, 129, 0.5)',
              color: '#fff',
              animation: 'pulse 3s ease-in-out infinite'
            }}>
              <BrainCircuit size={32} />
            </div>
            <div style={{
              background: 'rgba(2,5,9,0.75)', padding: '6px 12px', borderRadius: '12px', 
              border: '1px solid rgba(16,185,129,0.3)', backdropFilter: 'blur(4px)',
              whiteSpace: 'nowrap'
            }}>
              <h3 style={{ fontSize: '13px', fontFamily: 'var(--font-heading)', color: '#fff', margin: 0 }}>
                {displayTitle}
              </h3>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div style={{ position: 'absolute', bottom: '16px', left: '16px', right: '16px', display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <button className="glass-btn primary" onClick={() => onSpeak(explanation)} style={{ borderRadius: '999px', padding: '8px 16px', fontSize: '13px' }}>
              <Zap size={14} style={{ marginRight: '6px' }} />
              Explain
            </button>
            <button onClick={onReset} className="glass-btn ghost" style={{ borderRadius: '999px', padding: '8px 16px', fontSize: '13px', borderColor: 'rgba(16,185,129,0.3)' }}>
              <ScanLine size={14} style={{ marginRight: '6px' }} />
              Re-scan
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
