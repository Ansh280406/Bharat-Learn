import React, { useState, useEffect } from 'react';
import type { Language } from '../types';
import { Volume2, ChevronRight, ChevronLeft, Scale } from 'lucide-react';

interface MathOverlayProps {
  language: Language;
  onSpeak: (text: string) => void;
}

interface StepDetails {
  title: Record<Language, string>;
  equation: string;
  leftXCount: number;
  leftUnitCount: number;
  rightUnitCount: number;
  description: Record<Language, string>;
}

const steps: StepDetails[] = [
  {
    equation: "2x + 4 = 10",
    leftXCount: 2,
    leftUnitCount: 4,
    rightUnitCount: 10,
    title: {
      en: "Step 1: Set up the Balance Scale",
      hi: "चरण 1: तराजू स्थापित करें",
      gu: "પગલું 1: ત્રાજવું ગોઠવો"
    },
    description: {
      en: "We represent 2x as two green bars, and positive units as orange squares. The scale is balanced because both sides are equal!",
      hi: "हम 2x को दो हरी पट्टियों के रूप में, और इकाइयों को नारंगी चौकोर टुकड़ों के रूप में दर्शाते हैं। तराजू संतुलित है क्योंकि दोनों पक्ष बराबर हैं!",
      gu: "આપણે 2x ને બે લીલી પટ્ટીઓ તરીકે અને એકમોને નારંગી ચોરસ ટુકડા તરીકે દર્શાવીએ છીએ. ત્રાજવું સંતુલિત છે કારણ કે બંને બાજુ સમાન છે!"
    }
  },
  {
    equation: "2x + 4 - 4 = 10 - 4",
    leftXCount: 2,
    leftUnitCount: 0, // Faded
    rightUnitCount: 6,
    title: {
      en: "Step 2: Subtract 4 from Both Sides",
      hi: "चरण 2: दोनों पक्षों से 4 घटाएं",
      gu: "પગલું 2: બંને બાજુથી 4 બાદ કરો"
    },
    description: {
      en: "To isolate x, we remove 4 orange units from both the left and right sides. The scale remains perfectly balanced, leaving 2x = 6!",
      hi: "x को अलग करने के लिए, हम बाईं और दाईं दोनों ओर से 4 नारंगी इकाइयों को हटा देते हैं। तराजू पूरी तरह से संतुलित रहता है, जिससे 2x = 6 बचता है!",
      gu: "x ને અલગ કરવા માટે, આપણે ડાબી અને જમણી બંને બાજુથી 4 નારંગી એકમો દૂર કરીએ છીએ. ત્રાજવું સંતુલિત રહે છે અને 2x = 6 વધે છે!"
    }
  },
  {
    equation: "2x / 2 = 6 / 2",
    leftXCount: 1,
    leftUnitCount: 0,
    rightUnitCount: 3,
    title: {
      en: "Step 3: Divide Both Sides by 2",
      hi: "चरण 3: दोनों पक्षों को 2 से भाग दें",
      gu: "પગલું 3: બંને બાજુને 2 વડે ભાગો"
    },
    description: {
      en: "We split the variables and units into two equal groups. 1 green variable bar balances exactly 3 orange unit squares. Therefore, x = 3!",
      hi: "हम चर और इकाइयों को दो बराबर समूहों में विभाजित करते हैं। 1 हरी पट्टी ठीक 3 नारंगी इकाइयों को संतुलित करती है। इसलिए, x = 3!",
      gu: "આપણે ચલ અને એકમોને બે સમાન જૂથોમાં વહેંચીએ છીએ. 1 લીલી પટ્ટી બરાબર 3 નારંગી એકમોને સંતુલિત કરે છે. તેથી, x = 3!"
    }
  }
];

export const MathOverlay: React.FC<MathOverlayProps> = ({ language, onSpeak }) => {
  const [activeStep, setActiveStep] = useState(0);

  const currentStep = steps[activeStep];

  useEffect(() => {
    // Speak description when step changes
    onSpeak(`${currentStep.title[language]}. ${currentStep.description[language]}`);
  }, [activeStep]);

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (activeStep > 0) {
      setActiveStep(prev => prev - 1);
    }
  };

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '20px',
      background: 'radial-gradient(circle at center, transparent 30%, rgba(10, 11, 22, 0.4) 100%)',
    }}>
      {/* Equation Pill Indicator */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 10
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: '50px',
          color: 'var(--success)',
          fontSize: '13px',
          fontWeight: '700'
        }}>
          <Scale size={16} />
          <span>Balanced Algebra Tiles</span>
        </div>

        <div style={{
          padding: '6px 14px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          fontFamily: 'monospace',
          fontSize: '15px',
          fontWeight: 'bold',
          color: '#fff'
        }}>
          {currentStep.equation}
        </div>
      </div>

      {/* Visual See-Saw Balance Scale Section */}
      <div style={{
        position: 'relative',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 5,
        margin: '20px 0'
      }}>
        {/* Seesaw Plate */}
        <div style={{
          width: '80%',
          height: '8px',
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '4px',
          position: 'relative',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          padding: '0 40px'
        }}>
          {/* Left Plate (Holds variables and remaining units) */}
          <div style={{
            position: 'absolute',
            left: '10%',
            bottom: '8px',
            transform: 'translateX(-50%)',
            width: '130px',
            height: '70px',
            borderBottom: '4px solid var(--primary)',
            background: 'rgba(139, 92, 246, 0.05)',
            borderTopLeftRadius: '10px',
            borderTopRightRadius: '10px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            alignItems: 'center',
            padding: '6px',
            gap: '6px',
            transition: 'all 0.3s ease'
          }}>
            {/* Variable Bars Grid */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {Array.from({ length: currentStep.leftXCount }).map((_, i) => (
                <div
                  key={`x-${i}`}
                  style={{
                    width: '32px',
                    height: '50px',
                    background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                    border: '1px solid #10b981',
                    borderRadius: '6px',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800',
                    fontSize: '16px',
                    boxShadow: '0 0 10px rgba(16,185,129,0.3)',
                    animation: 'scaleIn 0.3s ease'
                  }}
                >
                  x
                </div>
              ))}
            </div>

            {/* Units on Left Side (fade out in Step 2) */}
            {activeStep === 0 && (
              <div style={{ display: 'flex', gap: '4px', position: 'absolute', top: '-14px' }}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={`lu-${i}`}
                    style={{
                      width: '16px',
                      height: '16px',
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      border: '1px solid #f59e0b',
                      borderRadius: '3px',
                      color: '#fff',
                      fontSize: '9px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '800',
                      boxShadow: '0 0 5px rgba(245,158,11,0.3)',
                      animation: 'scaleIn 0.3s ease'
                    }}
                  >
                    +1
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Seesaw Fulcrum Pivot Triangle */}
          <div style={{
            position: 'absolute',
            left: '50%',
            bottom: '-24px',
            transform: 'translateX(-50%)',
            width: '0',
            height: '0',
            borderStyle: 'solid',
            borderWidth: '0 16px 24px 16px',
            borderColor: 'transparent transparent rgba(255,255,255,0.3) transparent'
          }} />

          {/* Right Plate (Holds unit blocks) */}
          <div style={{
            position: 'absolute',
            right: '10%',
            bottom: '8px',
            transform: 'translateX(50%)',
            width: '130px',
            height: '70px',
            borderBottom: '4px solid var(--secondary)',
            background: 'rgba(6, 182, 212, 0.05)',
            borderTopLeftRadius: '10px',
            borderTopRightRadius: '10px',
            display: 'flex',
            flexWrap: 'wrap-reverse',
            justifyContent: 'center',
            alignContent: 'flex-start',
            padding: '8px',
            gap: '4px',
            transition: 'all 0.3s ease'
          }}>
            {Array.from({ length: currentStep.rightUnitCount }).map((_, i) => (
              <div
                key={`ru-${i}`}
                style={{
                  width: '18px',
                  height: '18px',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  border: '1px solid #f59e0b',
                  borderRadius: '3px',
                  color: '#fff',
                  fontSize: '9px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '800',
                  boxShadow: '0 0 5px rgba(245,158,11,0.3)',
                  animation: 'scaleIn 0.3s ease'
                }}
              >
                +1
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Control Area: Steps Navigation and TTS Explanations */}
      <div style={{ zIndex: 10, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Navigation Arrows */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={handlePrev}
            disabled={activeStep === 0}
            className="glass-btn"
            style={{ padding: '6px 12px', fontSize: '12px', opacity: activeStep === 0 ? 0.4 : 1 }}
          >
            <ChevronLeft size={16} /> Prev Step
          </button>

          <div style={{ display: 'flex', gap: '6px' }}>
            {steps.map((_, i) => (
              <span
                key={i}
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: activeStep === i ? 'var(--secondary)' : 'rgba(255,255,255,0.2)',
                  transition: 'background 0.3s ease'
                }}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={activeStep === steps.length - 1}
            className="glass-btn primary"
            style={{ padding: '6px 12px', fontSize: '12px', opacity: activeStep === steps.length - 1 ? 0.4 : 1 }}
          >
            Next Step <ChevronRight size={16} />
          </button>
        </div>

        {/* Step Explanation Card */}
        <div className="glass-card float-panel" style={{
          padding: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(10, 11, 22, 0.85)',
          display: 'flex',
          gap: '12px',
          alignItems: 'center'
        }}>
          <div style={{ flex: 1 }}>
            <h4 style={{
              fontSize: '14px',
              fontFamily: 'var(--font-heading)',
              color: '#fff',
              marginBottom: '4px'
            }}>
              {currentStep.title[language]}
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              {currentStep.description[language]}
            </p>
          </div>
          <button
            onClick={() => onSpeak(currentStep.description[language])}
            className="glass-btn"
            style={{ width: '38px', height: '38px', borderRadius: '50%', padding: 0 }}
          >
            <Volume2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
