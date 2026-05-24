import React, { useState, useEffect } from 'react';
import type { Language } from '../types';
import { Volume2, Map } from 'lucide-react';

interface BattleMapOverlayProps {
  language: Language;
  onSpeak: (text: string) => void;
  battleName?: string | null;
}

interface BattlePhase {
  year: string;
  phaseTitle: Record<Language, string>;
  description: Record<Language, string>;
  elements: React.ReactNode;
}

export const BattleMapOverlay: React.FC<BattleMapOverlayProps> = ({ language, onSpeak }) => {
  const [phaseIdx, setPhaseIdx] = useState(0);

  const phases: BattlePhase[] = [
    {
      year: "Phase 1: Initial Array (Morning)",
      phaseTitle: {
        en: "Mughal Defense & Chained Carts",
        hi: "मुगल रक्षा और जंजीरदार गाड़ियाँ",
        gu: "મુઘલ સંરક્ષણ અને સાંકળોથી બાંધેલી તોપગાડીઓ"
      },
      description: {
        en: "Babur places 700 carts in the center, chained together to shield cannons. Ibrahim Lodi deploys 100,000 soldiers and massive war elephants.",
        hi: "बाबर ने तोपों की रक्षा के लिए जंजीरों से बंधी 700 बैलगाड़ियों को केंद्र में खड़ा किया। इब्राहिम लोदी ने 1,00,000 सैनिकों और विशाल युद्ध हाथियों को तैनात किया।",
        gu: "બાબરે તોપોના રક્ષણ માટે મધ્યમાં સાંકળોથી બાંધેલી ૭૦૦ ગાડીઓ ગોઠવી. ઇબ્રાહિમ લોદીએ ૧,૦૦,૦૦૦ સૈનિકો અને વિશાળ યુદ્ધ હાથીઓ તૈનાત કર્યા."
      },
      elements: (
        <>
          {/* Babur's Defenses (Blue) */}
          <g fill="none" stroke="#3b82f6" strokeWidth="2">
            <line x1="220" y1="200" x2="220" y2="280" strokeDasharray="5 3" />
            <circle cx="210" cy="210" r="6" fill="#3b82f6" />
            <circle cx="210" cy="240" r="6" fill="#3b82f6" />
            <circle cx="210" cy="270" r="6" fill="#3b82f6" />
            <text x="180" y="245" fill="#3b82f6" fontSize="10" fontWeight="bold">Babur Carts</text>
          </g>
          {/* Lodi's Army (Red) */}
          <g fill="none" stroke="#ef4444" strokeWidth="2">
            <rect x="420" y="210" width="15" height="60" rx="3" fill="#ef4444" />
            {/* Elephants (represented by big circles) */}
            <circle cx="390" cy="220" r="10" fill="#ef4444" opacity="0.8" />
            <circle cx="390" cy="260" r="10" fill="#ef4444" opacity="0.8" />
            <text x="450" y="245" fill="#ef4444" fontSize="10" fontWeight="bold">Lodi Army</text>
            <text x="380" y="198" fill="#ef4444" fontSize="9">Elephants</text>
          </g>
        </>
      )
    },
    {
      year: "Phase 2: Lodi Charges (Midday)",
      phaseTitle: {
        en: "Frontal Clash & Cannon Fire",
        hi: "आमने-सामने की टक्कर और तोपों की बौछार",
        gu: "આમને-સામને ટક્કર અને તોપોનો મારો"
      },
      description: {
        en: "Lodi's army charges forward but is startled by the roaring sounds of Babur's gunpowder cannons, causing the elephants to panic and stampede backward.",
        hi: "लोदी की सेना आगे बढ़ती है लेकिन बाबर की बारूदी तोपों की गर्जना से घबरा जाती है, जिससे हाथी डरकर पीछे की ओर भागने लगते हैं और भगदड़ मच जाती है।",
        gu: "લોદીનું લશ્કર આગળ ધસે છે પરંતુ બાબરી બારૂદી તોપોના પ્રચંડ અવાજથી ડરી જાય છે, જેના લીધે હાથીઓ ગભરાઈને પાછળ ભાગવા માંડે છે."
      },
      elements: (
        <>
          {/* Cannon Fire Flashes */}
          <g fill="#eab308">
            <path d="M 230 205 L 260 195 L 240 215 Z" />
            <path d="M 230 235 L 270 235 L 240 245 Z" />
            <path d="M 230 265 L 260 275 L 240 270 Z" />
            <text x="260" y="180" fill="#eab308" fontSize="10" fontWeight="bold">🔥 Cannon Fire!</text>
          </g>
          {/* Lodi's Army charging & retreating */}
          <g fill="none" stroke="#ef4444" strokeWidth="2">
            {/* Panicked Elephants turning back */}
            <circle cx="350" cy="205" r="10" fill="#ef4444" />
            <circle cx="360" cy="265" r="10" fill="#ef4444" />
            {/* Retreat Arrows */}
            <path d="M 330 205 L 360 195 M 330 205 L 345 220" stroke="#ef4444" />
            <path d="M 340 265 L 370 275 M 340 265 L 355 250" stroke="#ef4444" />
          </g>
          <g fill="none" stroke="#3b82f6" strokeWidth="2">
            <line x1="220" y1="200" x2="220" y2="280" />
          </g>
        </>
      )
    },
    {
      year: "Phase 3: Tulughma Encirclement",
      phaseTitle: {
        en: "The Famous Flanking Strategy",
        hi: "प्रसिद्ध तुलुगमा घेराव रणनीति",
        gu: "પ્રખ્યાત તુલુઘમા વ્યુહરચના"
      },
      description: {
        en: "Babur triggers the Tulughma flanking strategy: high-speed cavalry circles around to encircle Lodi's army from the rear, trapping them completely.",
        hi: "बाबर ने तुलुगमा घेराव रणनीति शुरू की: तेज़ घुड़सवार सैनिक लोदी की सेना को पीछे से घेरने के लिए चारों ओर चक्कर लगाते हैं, जिससे वे पूरी तरह फंस जाते हैं।",
        gu: "બાબરે તુલુઘમા ઘેરાબંધી વ્યુહરચના શરૂ કરી: ઝડપી ઘોડેસવાર લશ્કર લોદીની સેનાને પાછળથી ઘેરવા માટે ગોળાકાર વળાંક લે છે, જેથી તેઓ સંપૂર્ણ ફસાઈ જાય છે."
      },
      elements: (
        <>
          {/* Encirclement Cavalry Arrows (Blue) */}
          <g fill="none" stroke="#06b6d4" strokeWidth="3" strokeDasharray="5 3">
            {/* Flanking paths arching around */}
            <path d="M 180 180 C 260 100, 420 120, 460 190" style={{ animation: 'dash 1s linear infinite' }} />
            <path d="M 180 300 C 260 380, 420 360, 460 290" style={{ animation: 'dash 1s linear infinite' }} />
            {/* Arrowheads */}
            <polygon points="460,190 450,180 465,175" fill="#06b6d4" />
            <polygon points="460,290 450,300 465,305" fill="#06b6d4" />
            <text x="290" y="110" fill="#06b6d4" fontSize="10" fontWeight="bold">🐎 Cavalry Flank!</text>
          </g>
          {/* Choked Lodi Troops */}
          <g fill="#ef4444" opacity="0.7">
            <ellipse cx="370" cy="240" rx="30" ry="25" />
            <text x="350" y="243" fill="#fff" fontSize="9" fontWeight="bold">Surrounded</text>
          </g>
          <g fill="none" stroke="#3b82f6" strokeWidth="2">
            <line x1="220" y1="200" x2="220" y2="280" />
          </g>
        </>
      )
    },
    {
      year: "Phase 4: Mughal Victory (Evening)",
      phaseTitle: {
        en: "Establishment of Mughal Empire",
        hi: "मुगल साम्राज्य की स्थापना",
        gu: "મુઘલ સામ્રાજ્યની સ્થાપના"
      },
      description: {
        en: "Lodi's massive army is defeated by Babur's tactical genius and advanced weaponry. This historic victory establishes the Mughal Dynasty in India.",
        hi: "बाबर की रणनीतिक सूझबूझ और उन्नत हथियारों के कारण लोदी की विशाल सेना हार जाती है। यह ऐतिहासिक जीत भारत में मुगल साम्राज्य की नींव रखती है।",
        gu: "બાબરની વ્યૂહાત્મક કોઠાસૂઝ અને તોપોના લીધે લોદીનું વિશાળ લશ્કર હારી જાય છે. આ ઐતિહાસિક વિજય ભારતમાં મુઘલ સામ્રાજ્યનો પાયો નાખે છે."
      },
      elements: (
        <>
          {/* Victory Sparks */}
          <g fill="#10b981">
            <polygon points="320,180 330,195 345,185 335,205" />
            <polygon points="280,270 290,285 305,275 295,295" />
            <text x="270" y="235" fill="var(--success)" fontSize="20" fontWeight="extrabold">🏆 MUGHAL VICTORY</text>
          </g>
        </>
      )
    }
  ];

  const activePhase = phases[phaseIdx];

  useEffect(() => {
    onSpeak(`${activePhase.year}. ${activePhase.phaseTitle[language]}. ${activePhase.description[language]}`);
  }, [phaseIdx]);

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
      {/* Title HUD Header */}
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
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          borderRadius: '50px',
          color: 'var(--accent)',
          fontSize: '13px',
          fontWeight: '700'
        }}>
          <Map size={16} />
          <span>Interactive Battle Map</span>
        </div>

        <div style={{
          padding: '6px 12px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '50px',
          fontSize: '11px',
          fontWeight: '700',
          color: 'var(--text-secondary)'
        }}>
          {activePhase.year}
        </div>
      </div>

      {/* Interactive Vector Map SVG Grid */}
      <div style={{
        position: 'relative',
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 5,
      }}>
        <svg style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at center, rgba(19, 21, 45, 0.5) 0%, rgba(10, 11, 22, 0.8) 100%)',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.05)',
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)'
        }} viewBox="0 0 640 360" preserveAspectRatio="xMidYMid meet">
          {/* Map Topography lines */}
          <path d="M 50,50 Q 150,70 180,150 T 250,300" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="2" />
          <path d="M 300,40 Q 320,180 450,220 T 580,320" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="2" />
          <path d="M 10,220 C 150,220 280,240 630,240" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
          
          {/* Rivers running through map (Blue dashed) */}
          <path d="M 0,180 C 120,160 310,260 640,150" fill="none" stroke="#3b82f6" strokeWidth="2" opacity="0.15" />
          <text x="320" y="200" fill="#3b82f6" fontSize="10" opacity="0.25" fontStyle="italic">Yamuna River</text>

          {/* Render Active Phase Arrows and Troops */}
          {activePhase.elements}
        </svg>
      </div>

      {/* Timeline Scrubber & Details */}
      <div style={{ zIndex: 10, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Scrubber slider */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>
            <span>Morning (08:00)</span>
            <span>Midday (12:00)</span>
            <span>Afternoon (14:00)</span>
            <span>Victory (17:00)</span>
          </div>
          <input
            type="range"
            min="0"
            max="3"
            step="1"
            value={phaseIdx}
            onChange={(e) => setPhaseIdx(parseInt(e.target.value))}
            style={{
              width: '100%',
              accentColor: 'var(--accent)',
              cursor: 'pointer',
              height: '6px',
              borderRadius: '3px',
              background: 'rgba(255,255,255,0.1)'
            }}
          />
        </div>

        {/* Phase Details Card */}
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
              {activePhase.phaseTitle[language]}
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              {activePhase.description[language]}
            </p>
          </div>
          <button
            onClick={() => onSpeak(activePhase.description[language])}
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
