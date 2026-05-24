import React, { useEffect, useRef, useState } from 'react';
import type { Language, PartExplanation } from '../types';
import { Volume2 } from 'lucide-react';

interface WaterCycleOverlayProps {
  language: Language;
  onSpeak: (text: string) => void;
}

const cycleStages: Record<string, PartExplanation> = {
  evaporation: {
    name: 'Evaporation (वाष्पीकरण / બાષ્પીભવન)',
    en: 'Solar heat warms the water in oceans and lakes, turning it into gas vapor that rises up into the atmosphere.',
    hi: 'सूर्य की गर्मी महासागरों और झीलों के पानी को गर्म करती है, जिससे वह गैस वाष्प में बदल जाता है और वायुमंडल में ऊपर उठ जाता है।',
    gu: 'સૂર્યની ગરમી મહાસાગરો અને તળાવોના પાણીને ગરમ કરે છે, તેને ગેસ વરાળમાં ફેરવે છે જે વાતાવરણમાં ઊંચે ચઢે છે.'
  },
  condensation: {
    name: 'Condensation (संघनन / ઘનીભવન)',
    en: 'As water vapor rises, it cools and clusters back into tiny liquid droplets, forming clouds.',
    hi: 'जैसे-जैसे पानी की भाप ऊपर उठती है, यह ठंडी होती है और वापस पानी की छोटी बूंदों में बदल जाती है, जिससे बादलों का निर्माण होता है।',
    gu: 'જેમ જેમ પાણીની વરાળ ઊંચે ચઢે છે, તેમ તે ઠંડી પડે છે અને ફરીથી પાણીના નાના ટીપાં બને છે જે ભેગા થઈને વાદળો રચે છે.'
  },
  precipitation: {
    name: 'Precipitation (वर्षण / વરસાદ)',
    en: 'When clouds become heavy and cold, droplets fall back to the ground as rain, snow, or hail.',
    hi: 'जब बादल भारी और ठंडे हो जाते हैं, तो पानी की बूंदें बारिश, बर्फ या ओलों के रूप में वापस जमीन पर गिरती हैं।',
    gu: 'જ્યારે વાદળો ઠંડા અને ભારે થઈ જાય છે, ત્યારે પાણીના ટીપાં વરસાદ, બરફ કે કરા સ્વરૂપે જમીન પર પાછા પડે છે.'
  },
  collection: {
    name: 'Collection & Runoff (संग्रह और अपवाह / સંગ્રહ અને વહેણ)',
    en: 'Fallen rain flows into rivers and streams winding down mountain slopes, collecting back into lakes and oceans.',
    hi: 'गिरी हुई बारिश नदियों और झरनों में बहती हुई पहाड़ों की ढलानों से नीचे आती है, और वापस झीलों और महासागरों में एकत्र हो जाती है।',
    gu: 'પડેલો વરસાદ પર્વતોના ઢોળાવ પરથી વહીને નદીઓ અને ઝરણાઓ દ્વારા તળાવો અને મહાસાગરોમાં પાછો ભેગો થાય છે.'
  }
};

export const WaterCycleOverlay: React.FC<WaterCycleOverlayProps> = ({ language, onSpeak }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);

  // Evaporation and Precipitation Canvas Particle Simulation
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.parentElement?.clientWidth || 640;
    canvas.height = canvas.parentElement?.clientHeight || 480;

    let animationId: number;

    // Particle Classes
    interface VaporParticle {
      x: number;
      y: number;
      speed: number;
      r: number;
      opacity: number;
    }

    interface RainParticle {
      x: number;
      y: number;
      speed: number;
      len: number;
    }

    const vapors: VaporParticle[] = [];
    const rains: RainParticle[] = [];

    // Initialize vapors (rising from bottom right ocean area to top cloud area)
    const initVapor = () => {
      return {
        x: canvas.width * 0.6 + Math.random() * (canvas.width * 0.35),
        y: canvas.height * 0.75 + Math.random() * (canvas.height * 0.15),
        speed: Math.random() * 0.8 + 0.4,
        r: Math.random() * 2 + 1.5,
        opacity: Math.random() * 0.5 + 0.3
      };
    };

    // Initialize rain (falling from top left cloud area)
    const initRain = () => {
      return {
        x: canvas.width * 0.1 + Math.random() * (canvas.width * 0.45),
        y: canvas.height * 0.1 + Math.random() * (canvas.height * 0.1),
        speed: Math.random() * 4 + 6,
        len: Math.random() * 8 + 6
      };
    };

    for (let i = 0; i < 25; i++) vapors.push(initVapor());
    for (let i = 0; i < 40; i++) rains.push(initRain());

    const drawSimulation = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Draw Evaporation Vapor Particles (rising up towards the sun/sky)
      vapors.forEach((p, idx) => {
        p.y -= p.speed;
        p.x += Math.sin(p.y * 0.05) * 0.3; // Gentle drift
        p.opacity -= 0.002;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245, 158, 11, ${p.opacity})`;
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 4;
        ctx.fill();
        ctx.shadowBlur = 0; // Reset shadow

        // Recycle vapor particles once they reach high altitude or fade
        if (p.y < canvas.height * 0.25 || p.opacity <= 0) {
          vapors[idx] = initVapor();
        }
      });

      // 2. Draw Rain Drops (falling from left clouds onto mountain slopes)
      rains.forEach((p, idx) => {
        p.y += p.speed;
        p.x -= 0.5; // Slight angle due to wind

        ctx.beginPath();
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - 1, p.y + p.len);
        ctx.stroke();

        // Recycle rain drops when hitting the ground
        if (p.y > canvas.height * 0.7) {
          rains[idx] = initRain();
        }
      });

      animationId = requestAnimationFrame(drawSimulation);
    };

    drawSimulation();

    const handleResize = () => {
      canvas.width = canvas.parentElement?.clientWidth || 640;
      canvas.height = canvas.parentElement?.clientHeight || 480;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const selectStage = (stageKey: string) => {
    setSelectedStage(stageKey);
    const exp = cycleStages[stageKey];
    if (exp) {
      onSpeak(exp[language]);
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
      {/* Background SVG Diagram illustrating water cycle */}
      <svg style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        pointerEvents: 'none'
      }} viewBox="0 0 640 480" preserveAspectRatio="none">
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#08071a" stopOpacity="0.4" />
            <stop offset="60%" stopColor="#0d112d" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="mountainGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="oceanGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0891b2" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#083344" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {/* Sky Background */}
        <rect width="640" height="320" fill="url(#skyGrad)" />

        {/* Mountains on Left */}
        <path d="M 0,380 L 120,220 L 220,300 L 320,180 L 420,360 L 0,400 Z" fill="url(#mountainGrad)" stroke="rgba(255,255,255,0.05)" />

        {/* Ocean/Water Reservoir on Right */}
        <path d="M 380,360 C 450,360 480,380 640,380 L 640,480 L 380,480 Z" fill="url(#oceanGrad)" />
        <path d="M 0,390 L 390,365" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />

        {/* Animated Water Runoff / River Stream connecting mountain to ocean */}
        <path
          d="M 120,225 Q 180,280 260,320 T 390,362"
          fill="none"
          stroke="#06b6d4"
          strokeWidth="3"
          strokeDasharray="8 6"
          style={{
            animation: 'dash 1.5s linear infinite'
          }}
        />
        <style>{`
          @keyframes dash {
            to {
              stroke-dashoffset: -28;
            }
          }
        `}</style>

        {/* Glowing Sun on top right */}
        <circle cx="560" cy="80" r="30" fill="#f59e0b" opacity="0.15" />
        <circle cx="560" cy="80" r="20" fill="#fbbf24" />
      </svg>

      {/* Canvas Layer for Emitters */}
      <canvas ref={canvasRef} style={{
        position: 'absolute',
        inset: 0,
        zIndex: 2,
        pointerEvents: 'none'
      }} />

      {/* Clickable Interactive Hotspot Overlay Badges */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 5,
        pointerEvents: 'none'
      }}>
        {/* Stage 1: Evaporation Badge */}
        <button
          onClick={() => selectStage('evaporation')}
          className="glass-card float-panel"
          style={{
            position: 'absolute',
            bottom: '22%',
            right: '18%',
            pointerEvents: 'auto',
            padding: '6px 14px',
            borderRadius: '50px',
            fontSize: '12px',
            fontWeight: '700',
            border: selectedStage === 'evaporation' ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.1)',
            boxShadow: selectedStage === 'evaporation' ? '0 0 12px var(--accent-glow)' : 'none',
            color: selectedStage === 'evaporation' ? 'var(--accent)' : '#fff',
            cursor: 'pointer'
          }}
        >
          🟡 Evaporation
        </button>

        {/* Stage 2: Condensation Badge */}
        <button
          onClick={() => selectStage('condensation')}
          className="glass-card"
          style={{
            position: 'absolute',
            top: '12%',
            left: '30%',
            pointerEvents: 'auto',
            padding: '6px 14px',
            borderRadius: '50px',
            fontSize: '12px',
            fontWeight: '700',
            border: selectedStage === 'condensation' ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)',
            boxShadow: selectedStage === 'condensation' ? '0 0 12px var(--primary-glow)' : 'none',
            color: selectedStage === 'condensation' ? 'var(--primary)' : '#fff',
            cursor: 'pointer'
          }}
        >
          ☁️ Condensation
        </button>

        {/* Stage 3: Precipitation Badge */}
        <button
          onClick={() => selectStage('precipitation')}
          className="glass-card float-panel"
          style={{
            position: 'absolute',
            top: '40%',
            left: '12%',
            pointerEvents: 'auto',
            padding: '6px 14px',
            borderRadius: '50px',
            fontSize: '12px',
            fontWeight: '700',
            border: selectedStage === 'precipitation' ? '1px solid var(--secondary)' : '1px solid rgba(255,255,255,0.1)',
            boxShadow: selectedStage === 'precipitation' ? '0 0 12px var(--secondary-glow)' : 'none',
            color: selectedStage === 'precipitation' ? 'var(--secondary)' : '#fff',
            cursor: 'pointer'
          }}
        >
          🌧️ Precipitation
        </button>

        {/* Stage 4: Collection Badge */}
        <button
          onClick={() => selectStage('collection')}
          className="glass-card"
          style={{
            position: 'absolute',
            bottom: '36%',
            left: '38%',
            pointerEvents: 'auto',
            padding: '6px 14px',
            borderRadius: '50px',
            fontSize: '12px',
            fontWeight: '700',
            border: selectedStage === 'collection' ? '1px solid var(--success)' : '1px solid rgba(255,255,255,0.1)',
            boxShadow: selectedStage === 'collection' ? '0 0 12px var(--success-glow)' : 'none',
            color: selectedStage === 'collection' ? 'var(--success)' : '#fff',
            cursor: 'pointer'
          }}
        >
          🏞️ Collection
        </button>
      </div>

      {/* Explanations Bottom Floating Pill */}
      <div style={{ zIndex: 10, marginTop: 'auto', pointerEvents: 'none' }}>
        {selectedStage && cycleStages[selectedStage] ? (
          <div className="glass-card float-panel" style={{
            padding: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(10, 11, 22, 0.85)',
            pointerEvents: 'auto',
            display: 'flex',
            gap: '12px',
            alignItems: 'center'
          }}>
            <div style={{ flex: 1 }}>
              <h4 style={{
                fontSize: '14px',
                fontFamily: 'var(--font-heading)',
                color: '#fff',
                marginBottom: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: selectedStage === 'evaporation' ? 'var(--accent)' : selectedStage === 'condensation' ? 'var(--primary)' : selectedStage === 'precipitation' ? 'var(--secondary)' : 'var(--success)'
                }} />
                {cycleStages[selectedStage].name}
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                {cycleStages[selectedStage][language]}
              </p>
            </div>
            <button
              onClick={() => onSpeak(cycleStages[selectedStage!][language])}
              className="glass-btn"
              style={{ width: '38px', height: '38px', borderRadius: '50%', padding: 0 }}
            >
              <Volume2 size={16} />
            </button>
          </div>
        ) : (
          <div className="glass-card" style={{
            padding: '12px 16px',
            textAlign: 'center',
            background: 'rgba(10, 11, 22, 0.7)',
            fontSize: '13px',
            color: 'var(--text-secondary)'
          }}>
            👆 Click on any water cycle badge above to explore evaporation, precipitation, and rivers in Indian languages!
          </div>
        )}
      </div>
    </div>
  );
};
