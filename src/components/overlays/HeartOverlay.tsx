import React, { useState } from 'react';
import type { Language, PartExplanation } from '../../types';
import { Volume2, Orbit } from 'lucide-react';
import { HologramViewer } from '../three/HologramViewer';

interface HeartOverlayProps {
  language: Language;
  onSpeak: (text: string) => void;
}

const explanations: Record<string, PartExplanation> = {
  aorta: {
    name: 'Aorta (महाधमनी / મહાધમની)',
    en: 'The Aorta is the largest artery in the body. It carries fresh oxygen-rich blood from the left ventricle of the heart out to the rest of the body.',
    hi: 'महाधमनी शरीर की सबसे बड़ी धमनी है। यह ऑक्सीजन से भरपूर ताज़ा रक्त को हृदय के बाएं निलय से निकालकर शरीर के बाकी हिस्सों में ले जाती है।',
    gu: 'મહાધમની શરીરની સૌથી મોટી ધમની છે. તે ઓક્સિજનયુક્ત તાજું લોહી હૃદયના ડાબા ક્ષેપકમાંથી બહાર કાઢીને શરીરના બાકીના ભાગો સુધી પહોંચાડે છે.'
  },
  left_ventricle: {
    name: 'Left Ventricle (बायां निलय / ડાબું ક્ષેપક)',
    en: 'The Left Ventricle has the thickest muscle wall of all chambers. It pumps oxygenated blood with high pressure to the entire body via the Aorta.',
    hi: 'बाएं निलय की मांसपेशी की दीवार सभी कक्षों में सबसे मोटी होती है। यह उच्च दबाव के साथ ऑक्सीजन युक्त रक्त को महाधमनी के माध्यम से पूरे शरीर में पंप करता है।',
    gu: 'ડાબું ક્ષેપક બધા ખાનાઓમાં સૌથી જાડી સ્નાયુની દીવાલ ધરાવે છે. તે ઊંચા દબાણ સાથે ઓક્સિજનયુક્ત લોહીને મહાધમની દ્વારા આખા શરીરમાં પંપ કરે છે.'
  },
  right_ventricle: {
    name: 'Right Ventricle (दायां निलय / જમણું ક્ષેપક)',
    en: 'The Right Ventricle receives oxygen-poor blood from the body and pumps it up into the lungs through the pulmonary artery to absorb fresh oxygen.',
    hi: 'दायां निलय शरीर से कम ऑक्सीजन वाले रक्त को प्राप्त करता है और इसे ताज़ा ऑक्सीजन सोखने के लिए फुफ्फुस धमनी के माध्यम से फेफड़ों में पंप करता है।',
    gu: 'જમણું ક્ષેપક શરીરમાંથી ઓક્સિજન વગરનું લોહી મેળવે છે અને તેને તાજો ઓક્સિજન મેળવવા માટે ફેફસાની ધમની દ્વારા ફેફસામાં પંપ કરે છે.'
  },
  pulmonary_valve: {
    name: 'Pulmonary Valve (फुफ्फुस वाल्व / ફેફસાનો વાલ્વ)',
    en: 'The Pulmonary Valve acts as a one-way gate between the right ventricle and the pulmonary artery, preventing blood from flowing backward.',
    hi: 'फुफ्फुस वाल्व दाएं निलय और फुफ्फुस धमनी के बीच एकतरफा गेट के रूप में कार्य करता है, जो रक्त को वापस बहने से रोकता है।',
    gu: 'ફેફસાનો વાલ્વ જમણા ક્ષેપક અને ફેફસાની ધમની વચ્ચે એકતરફી દરવાજા તરીકે કામ કરે છે, જે લોહીને પાછું વહેતું અટકાવે છે.'
  }
};

export const HeartOverlay: React.FC<HeartOverlayProps> = ({ language, onSpeak }) => {
  const [selectedPart, setSelectedPart] = useState<string | null>(null);

  const selectPart = (partKey: string) => {
    setSelectedPart(partKey);
    const exp = explanations[partKey];
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
      {/* 3D Hologram Canvas */}
      <HologramViewer
        modelUrl="/models/heart.glb"
        scale={2.2}
        rotation={[-Math.PI / 2, 0, 0]}
        hologramColor="#ef4444"
        autoRotate={true}
        rotateSpeed={0.5}
        enableOrbitControls={true}
        loadingLabel="Loading Heart Hologram..."
        onPartClick={(name) => {
          if (explanations[name]) selectPart(name);
        }}
      />

      {/* Orbit Tip Pill */}
      <div style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        borderRadius: '50px',
        background: 'rgba(0,0,0,0.4)',
        border: '1px solid rgba(255,255,255,0.08)',
        fontSize: '11px',
        color: 'var(--text-secondary)',
        zIndex: 10,
        pointerEvents: 'none'
      }}>
        <Orbit size={12} className="heart-pulse" />
        <span>Drag to rotate • Tap parts to learn</span>
      </div>

      {/* Heart HTML Label Overlay Pins */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 5,
        pointerEvents: 'none'
      }}>
        {/* Aorta Label Pin */}
        <button
          onClick={() => selectPart('aorta')}
          className="glass-card"
          style={{
            position: 'absolute',
            top: '15%',
            left: '52%',
            pointerEvents: 'auto',
            padding: '4px 10px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: '700',
            border: selectedPart === 'aorta' ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.1)',
            boxShadow: selectedPart === 'aorta' ? '0 0 10px var(--accent-glow)' : 'none',
            color: selectedPart === 'aorta' ? 'var(--accent)' : '#fff',
            cursor: 'pointer'
          }}
        >
          🟡 Aorta
        </button>

        {/* Pulmonary Valve Label Pin */}
        <button
          onClick={() => selectPart('pulmonary_valve')}
          className="glass-card"
          style={{
            position: 'absolute',
            top: '32%',
            left: '26%',
            pointerEvents: 'auto',
            padding: '4px 10px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: '700',
            border: selectedPart === 'pulmonary_valve' ? '1px solid var(--secondary)' : '1px solid rgba(255,255,255,0.1)',
            boxShadow: selectedPart === 'pulmonary_valve' ? '0 0 10px var(--secondary-glow)' : 'none',
            color: selectedPart === 'pulmonary_valve' ? 'var(--secondary)' : '#fff',
            cursor: 'pointer'
          }}
        >
          🔵 Pulmonary Valve
        </button>

        {/* Right Ventricle Label Pin */}
        <button
          onClick={() => selectPart('right_ventricle')}
          className="glass-card"
          style={{
            position: 'absolute',
            top: '60%',
            left: '30%',
            pointerEvents: 'auto',
            padding: '4px 10px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: '700',
            border: selectedPart === 'right_ventricle' ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)',
            boxShadow: selectedPart === 'right_ventricle' ? '0 0 10px var(--primary-glow)' : 'none',
            color: selectedPart === 'right_ventricle' ? 'var(--primary)' : '#fff',
            cursor: 'pointer'
          }}
        >
          🔴 Right Ventricle
        </button>

        {/* Left Ventricle Label Pin */}
        <button
          onClick={() => selectPart('left_ventricle')}
          className="glass-card"
          style={{
            position: 'absolute',
            top: '68%',
            left: '60%',
            pointerEvents: 'auto',
            padding: '4px 10px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: '700',
            border: selectedPart === 'left_ventricle' ? '1px solid var(--danger)' : '1px solid rgba(255,255,255,0.1)',
            boxShadow: selectedPart === 'left_ventricle' ? '0 0 10px var(--danger-glow)' : 'none',
            color: selectedPart === 'left_ventricle' ? 'var(--danger)' : '#fff',
            cursor: 'pointer'
          }}
        >
          🔴 Left Ventricle
        </button>
      </div>

      {/* Explanations Bottom Floating Pill */}
      <div style={{ zIndex: 10, marginTop: 'auto', pointerEvents: 'none' }}>
        {selectedPart && explanations[selectedPart] ? (
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
                  background: selectedPart === 'aorta' ? 'var(--accent)' : selectedPart === 'pulmonary_valve' ? 'var(--secondary)' : selectedPart === 'left_ventricle' ? 'var(--danger)' : 'var(--primary)'
                }} />
                {explanations[selectedPart].name}
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                {explanations[selectedPart][language]}
              </p>
            </div>
            <button
              onClick={() => onSpeak(explanations[selectedPart!][language])}
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
            👆 Click on any heart label or 3D model part to learn its role in Indian languages!
          </div>
        )}
      </div>
    </div>
  );
};
