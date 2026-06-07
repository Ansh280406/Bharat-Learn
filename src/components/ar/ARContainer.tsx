import React, { useState } from 'react';
import type { PageType, Language } from '../../types';
import { HeartOverlay } from '../overlays/HeartOverlay';
import { WaterCycleOverlay } from '../overlays/WaterCycleOverlay';
import { MathOverlay } from '../overlays/MathOverlay';
import { BattleMapOverlay } from '../overlays/BattleMapOverlay';
import { PhysicsOverlay } from '../overlays/PhysicsOverlay';
import { ChemistryOverlay } from '../overlays/ChemistryOverlay';
import { Math3DOverlay } from '../overlays/Math3DOverlay';
import { DynamicAIOverlay } from '../overlays/DynamicAIOverlay';
import { ARQuiz } from './ARQuiz';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft, BrainCircuit,
  Volume2, Trophy, ChevronRight, Bookmark
} from 'lucide-react';

interface ARContainerProps {
  pageType: PageType;
  extractedInfo: any;
  language: Language;
  aiExplanation?: string | null;
  onSpeak: (text: string) => void;
  onSpeakStop: () => void;
  onReset: () => void;
}

const SUBJECT_META: Record<PageType, { title: string; emoji: string; color: string; glow: string; subject: string }> = {
  heart: { title: 'Anatomy of the Heart', emoji: '❤️', color: '#f43f5e', glow: 'rgba(244,63,94,0.3)', subject: 'Biology' },
  water_cycle: { title: "Earth's Water Cycle", emoji: '💧', color: '#0ea5e9', glow: 'rgba(14,165,233,0.3)', subject: 'Geography' },
  math: { title: 'Step-by-Step Algebra', emoji: '📐', color: '#10b981', glow: 'rgba(16,185,129,0.3)', subject: 'Mathematics' },
  math_3d: { title: '3D Geometry Explorer', emoji: '🧠', color: '#0ea5e9', glow: 'rgba(14,165,233,0.3)', subject: 'Mathematics' },
  history: { title: 'Tactical Battle Map', emoji: '⚔️', color: '#f59e0b', glow: 'rgba(245,158,11,0.3)', subject: 'History' },
  physics: { title: 'Optics & Light Lab', emoji: '🌈', color: '#8b5cf6', glow: 'rgba(139,92,246,0.3)', subject: 'Physics' },
  chemistry: { title: 'Organic Chemistry', emoji: '🧪', color: '#14b8a6', glow: 'rgba(20,184,166,0.3)', subject: 'Chemistry' },
  unknown: { title: 'AI Educational Companion', emoji: '📚', color: '#6366f1', glow: 'rgba(99,102,241,0.3)', subject: 'AI Scan' },
};

export const ARContainer: React.FC<ARContainerProps> = ({
  pageType, extractedInfo, language,
  aiExplanation, onSpeak, onSpeakStop, onReset,
}) => {
  const { user, toggleBookmark } = useAuth();
  const [showQuiz, setShowQuiz] = useState(false);
  const [aiExpanded, setAiExpanded] = useState(false);
  const meta = SUBJECT_META[pageType] || SUBJECT_META.unknown;
  
  const isBookmarked = user?.bookmarks?.some(b => b.pageType === pageType) || false;

  const getSubjectSub = () => {
    if (language === 'hi') return 'अंगों को टैप करें या व्याख्या सुनें।';
    if (language === 'gu') return 'અંગોને ટેપ કરો અથવા સ્પષ્ટીકરણ સાંભળો.';
    return 'Tap elements to explore • Voice guide available';
  };

  const displayTitle = extractedInfo?.title || meta.title;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>

      {/* ── SUBJECT HEADER ── */}
      <div className="glass-card anim-scale-in" style={{
        padding: '16px 20px',
        border: `1px solid ${meta.color}25`,
        background: `linear-gradient(135deg, var(--glass-bg) 0%, ${meta.color}08 100%)`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Left: subject info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '16px',
              background: `linear-gradient(135deg, ${meta.color}22 0%, ${meta.color}44 100%)`,
              border: `1px solid ${meta.color}40`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '22px', flexShrink: 0,
              boxShadow: `0 4px 14px ${meta.glow}`,
            }}>
              {meta.emoji}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{
                  fontSize: '10px', fontWeight: '800', textTransform: 'uppercase',
                  letterSpacing: '0.06em', color: meta.color,
                }}>
                  {meta.subject} • AR Active
                </span>
              </div>
              <h3 style={{
                fontSize: '16px', fontFamily: 'var(--font-heading)',
                fontWeight: '800', color: 'var(--text-primary)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {displayTitle}
              </h3>
            </div>
          </div>

          {/* Right Action buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {user && (
              <button
                onClick={() => toggleBookmark(pageType, displayTitle)}
                className="glass-btn ghost"
                style={{ padding: '8px', color: isBookmarked ? 'var(--rose)' : 'var(--text-muted)' }}
                title={isBookmarked ? 'Remove Bookmark' : 'Add Bookmark'}
              >
                <Bookmark size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
              </button>
            )}
            <button
              onClick={() => { onSpeakStop(); onReset(); }}
              className="glass-btn ghost"
              style={{ padding: '8px 14px' }}
            >
              <ArrowLeft size={14} />
              <span className="hide-mobile">Back</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── AI EXPLANATION PANEL ── */}
      {aiExplanation && (
        <div className="glass-card anim-fade-up" style={{
          border: '1px solid rgba(16,185,129,0.20)',
          background: 'linear-gradient(135deg, var(--glass-bg) 0%, rgba(16,185,129,0.05) 100%)',
          overflow: 'hidden',
        }}>
          {/* Header row */}
          <div
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 18px', cursor: 'pointer',
            }}
            onClick={() => setAiExpanded(v => !v)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '10px',
                background: 'rgba(16,185,129,0.12)',
                border: '1px solid rgba(16,185,129,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '16px',
              }}>
                🤖
              </div>
              <span style={{
                fontSize: '12px', fontWeight: '800', textTransform: 'uppercase',
                letterSpacing: '0.05em', color: 'var(--emerald-light)',
              }}>
                AI Explanation
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={e => { e.stopPropagation(); onSpeak(aiExplanation); }}
                className="glass-btn ghost"
                style={{ padding: '5px 12px', fontSize: '11px', borderColor: 'rgba(16,185,129,0.3)' }}
              >
                <Volume2 size={11} style={{ color: 'var(--emerald)' }} />
                Read Aloud
              </button>
              <ChevronRight
                size={16}
                style={{
                  color: 'var(--text-muted)',
                  transform: aiExpanded ? 'rotate(90deg)' : 'none',
                  transition: 'transform 0.3s ease',
                }}
              />
            </div>
          </div>

          {aiExpanded && (
            <div style={{ padding: '0 18px 16px' }}>
              <div className="divider" style={{ marginBottom: '14px' }} />
              <p style={{
                fontSize: '14px', color: '#e2e8f0', lineHeight: '1.75',
                whiteSpace: 'pre-line',
              }}>
                {aiExplanation}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── AR SCENE VIEWPORT ── */}
      <div className="interactive-container" style={{ position: 'relative' }}>
        {!showQuiz && (
          <>
            {pageType !== 'unknown' ? (
              <>
                {pageType === 'heart' && <HeartOverlay language={language} onSpeak={onSpeak} />}
                {pageType === 'water_cycle' && <WaterCycleOverlay language={language} onSpeak={onSpeak} />}
                {pageType === 'math' && <MathOverlay language={language} onSpeak={onSpeak} />}
                {pageType === 'math_3d' && <Math3DOverlay language={language} onSpeak={onSpeak} />}
                {pageType === 'history' && <BattleMapOverlay language={language} onSpeak={onSpeak} battleName={extractedInfo?.battleName} />}
                {pageType === 'physics' && <PhysicsOverlay language={language} onSpeak={onSpeak} />}
                {pageType === 'chemistry' && <ChemistryOverlay language={language} onSpeak={onSpeak} />}
              </>
            ) : (
              <DynamicAIOverlay
                language={language}
                onSpeak={onSpeak}
                onReset={onReset}
                aiExplanation={aiExplanation}
                title={extractedInfo?.title || meta.title}
                imagePrompt={extractedInfo?.hologramImagePrompt}
                labels={extractedInfo?.hologramLabels}
                hologramHtml={extractedInfo?.hologramHtml}
                wikipediaQuery={extractedInfo?.wikipediaQuery}
              />
            )}
          </>
        )}

        {showQuiz && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 30,
            padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(2,5,9,0.85)',
            backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          }}>
            <ARQuiz
              pageType={pageType}
              topic={extractedInfo?.title || extractedInfo?.wikipediaQuery}
              language={language}
              onSpeak={onSpeak}
              onClose={() => setShowQuiz(false)}
            />
          </div>
        )}
      </div>

      {/* ── BOTTOM ACTION PANEL ── */}
      {!showQuiz && (
        <div className="glass-card anim-fade-up" style={{
          padding: '16px 20px',
          border: '1px solid rgba(99,102,241,0.18)',
          background: 'linear-gradient(135deg, rgba(7,14,28,0.9) 0%, rgba(99,102,241,0.05) 100%)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '13px',
                background: 'rgba(99,102,241,0.12)',
                border: '1px solid rgba(99,102,241,0.22)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--indigo-light)', flexShrink: 0,
              }}>
                <BrainCircuit size={19} />
              </div>
              <div style={{ minWidth: 0 }}>
                <h4 style={{ fontSize: '14px', color: '#fff', fontWeight: '700', marginBottom: '2px' }}>
                  Ready to test your knowledge?
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {getSubjectSub()}
                </p>
              </div>
            </div>

            <button
              id="btn-take-quiz"
              onClick={() => { onSpeakStop(); setShowQuiz(true); }}
              className="glass-btn secondary"
              style={{ padding: '10px 20px', borderRadius: '999px', fontSize: '13px', fontWeight: '800', flexShrink: 0 }}
            >
              <Trophy size={15} />
              Take Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
