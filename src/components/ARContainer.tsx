import React, { useState } from 'react';
import type { PageType, Language } from '../types';
import { HeartOverlay } from './HeartOverlay';
import { WaterCycleOverlay } from './WaterCycleOverlay';
import { MathOverlay } from './MathOverlay';
import { BattleMapOverlay } from './BattleMapOverlay';
import { ARQuiz } from './ARQuiz';
import { Sparkles, ArrowLeft, BrainCircuit } from 'lucide-react';

interface ARContainerProps {
  pageType: PageType;
  confidence: number;
  extractedInfo: any;
  language: Language;
  onSpeak: (text: string) => void;
  onSpeakStop: () => void;
  onReset: () => void;
}

export const ARContainer: React.FC<ARContainerProps> = ({
  pageType,
  confidence,
  extractedInfo,
  language,
  onSpeak,
  onSpeakStop,
  onReset,
}) => {
  const [showQuiz, setShowQuiz] = useState(false);

  const getSubjectTitle = () => {
    switch (pageType) {
      case 'heart': return 'Biology: Anatomy of the Heart';
      case 'water_cycle': return 'Geography: Earth\'s Water Cycle';
      case 'math': return 'Algebra: Step-by-Step Solving';
      case 'history': return 'History: Tactical Battle Map';
      default: return 'Educational Companion';
    }
  };

  const getSubjectSub = () => {
    if (language === 'hi') {
      return 'अंगों को टैप करें या व्याख्या सुनने के लिए शीर्षकों पर क्लिक करें।';
    }
    if (language === 'gu') {
      return 'અંગોને ટેપ કરો અથવા સમજૂતી સાંભળવા માટે શીર્ષકો પર ક્લિક કરો.';
    }
    return 'Tap on elements or use buttons to explore the lesson interactively.';
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      width: '100%',
      maxWidth: '720px',
      margin: '0 auto'
    }}>
      {/* Subject Header Board */}
      <div className="glass-card" style={{
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div>
          <span style={{
            fontSize: '11px',
            color: 'var(--secondary)',
            fontWeight: '800',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            🌟 AR Overlay Active ({Math.round(confidence * 100)}% Match)
          </span>
          <h3 style={{
            fontSize: '18px',
            fontFamily: 'var(--font-heading)',
            color: '#fff',
            marginTop: '2px'
          }}>
            {getSubjectTitle()}
          </h3>
        </div>

        <button
          onClick={() => {
            onSpeakStop();
            onReset();
          }}
          className="glass-btn"
          style={{ padding: '8px 14px', fontSize: '13px' }}
        >
          <ArrowLeft size={14} /> Scan New
        </button>
      </div>

      {/* Main AR Display Viewer Frame */}
      <div className="interactive-container" style={{ position: 'relative' }}>
        {/* Render respective Overlay Scene */}
        {!showQuiz && (
          <>
            {pageType === 'heart' && (
              <HeartOverlay language={language} onSpeak={onSpeak} />
            )}
            {pageType === 'water_cycle' && (
              <WaterCycleOverlay language={language} onSpeak={onSpeak} />
            )}
            {pageType === 'math' && (
              <MathOverlay language={language} onSpeak={onSpeak} />
            )}
            {pageType === 'history' && (
              <BattleMapOverlay language={language} onSpeak={onSpeak} battleName={extractedInfo?.battleName} />
            )}
          </>
        )}

        {/* Floating Quiz overlays on top of the canvas */}
        {showQuiz && (
          <div style={{
            position: 'absolute',
            inset: 0,
            zIndex: 30,
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(10, 11, 22, 0.75)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)'
          }}>
            <ARQuiz
              pageType={pageType}
              language={language}
              onSpeak={onSpeak}
              onClose={() => setShowQuiz(false)}
            />
          </div>
        )}
      </div>

      {/* Floating Call-to-action bottom panel */}
      {!showQuiz && (
        <div className="glass-card" style={{
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          border: '1px solid rgba(139, 92, 246, 0.2)',
          background: 'rgba(139, 92, 246, 0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(6, 182, 212, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--secondary)'
            }}>
              <BrainCircuit size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '14px', color: '#fff', fontWeight: '700' }}>
                Done Studying the Concept?
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {getSubjectSub()}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              onSpeakStop();
              setShowQuiz(true);
            }}
            className="glass-btn primary"
            style={{
              padding: '10px 20px',
              borderRadius: '50px',
              fontWeight: '700',
              fontSize: '14px'
            }}
          >
            <Sparkles size={16} /> Take Quiz
          </button>
        </div>
      )}
    </div>
  );
};
