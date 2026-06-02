import React, { useState } from 'react';
import type { Language } from '../../types';
import { Volume2, Box, RotateCw } from 'lucide-react';
import { HologramViewer } from '../three/HologramViewer';

interface Math3DOverlayProps {
  language: Language;
  onSpeak: (text: string) => void;
}

interface Shape3D {
  name: string;
  emoji: string;
  color: string;
  formula: Record<Language, string>;
  explanation: Record<Language, string>;
}

const SHAPES: Shape3D[] = [
  {
    name: 'Cube',
    emoji: '🧊',
    color: '#0ea5e9',
    formula: {
      en: 'V = a³ | SA = 6a²',
      hi: 'V = a³ | SA = 6a²',
      gu: 'V = a³ | SA = 6a²',
    },
    explanation: {
      en: 'A Cube has 6 equal square faces, 12 edges and 8 vertices. Volume = side³. Surface Area = 6 × side². All angles are perfect right angles (90°).',
      hi: 'घन की 6 समान वर्गाकार भुजाएँ, 12 कोर और 8 शीर्ष होते हैं। आयतन = भुजा³। पृष्ठ क्षेत्रफल = 6 × भुजा²।',
      gu: 'ઘન ને 6 સમાન ચોરસ ફ્face, 12 ધાર અને 8 ખૂણા છે. કદ = બાજુ³. સપાટી ક્ષેત્રફળ = 6 × બાજુ².',
    },
  },
  {
    name: 'Sphere',
    emoji: '🔵',
    color: '#8b5cf6',
    formula: {
      en: 'V = 4/3πr³ | SA = 4πr²',
      hi: 'V = 4/3πr³ | SA = 4πr²',
      gu: 'V = 4/3πr³ | SA = 4πr²',
    },
    explanation: {
      en: 'A Sphere is perfectly round — every point on its surface is the same distance (radius) from the centre. Volume = 4/3 × π × r³. Surface Area = 4 × π × r².',
      hi: 'गोला पूरी तरह गोल होता है — इसकी सतह का प्रत्येक बिंदु केंद्र से समान दूरी (त्रिज्या) पर है। आयतन = 4/3 × π × r³।',
      gu: 'ગોળ સંપૂર્ણ ગોળ હોય છે — સપાટી પરનો દરેક બિંદુ કેન્દ્ર થી સમાન distance (radius) પર છે. Volume = 4/3 × π × r³.',
    },
  },
  {
    name: 'Cone',
    emoji: '🔺',
    color: '#f59e0b',
    formula: {
      en: 'V = 1/3πr²h | SA = πr(r+l)',
      hi: 'V = 1/3πr²h | SA = πr(r+l)',
      gu: 'V = 1/3πr²h | SA = πr(r+l)',
    },
    explanation: {
      en: 'A Cone has a circular base that tapers to a single apex (point). Volume = 1/3 × π × r² × h. Slant height l = √(r²+h²). Used in ice cream cones and traffic cones!',
      hi: 'शंकु का एक वृत्तीय आधार होता है जो एक शीर्ष बिंदु पर सिकुड़ता है। आयतन = 1/3 × π × r² × h। तिरछी ऊँचाई l = √(r²+h²)।',
      gu: 'Cone ને circular base છે જે apex (point) પર tapering છે. Volume = 1/3 × π × r² × h. Slant height l = √(r²+h²).',
    },
  },
  {
    name: 'Torus',
    emoji: '🍩',
    color: '#10b981',
    formula: {
      en: 'V = 2π²Rr² | SA = 4π²Rr',
      hi: 'V = 2π²Rr² | SA = 4π²Rr',
      gu: 'V = 2π²Rr² | SA = 4π²Rr',
    },
    explanation: {
      en: 'A Torus is a donut-shaped 3D solid. It is formed by revolving a circle around an axis. Volume = 2π²Rr². It has no faces, edges, or vertices — it is a smooth curved surface.',
      hi: 'टोरस एक डोनट के आकार का 3D ठोस है। यह एक अक्ष के चारों ओर एक वृत्त को घुमाने से बनता है। आयतन = 2π²Rr²।',
      gu: 'Torus donut shaped 3D solid છે. એક axis ના ફરતે circle ને ઘુમાવવાથી બને છે. Volume = 2π²Rr².',
    },
  },
];

export const Math3DOverlay: React.FC<Math3DOverlayProps> = ({ language, onSpeak }) => {
  const [shapeIdx, setShapeIdx] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);

  const shape = SHAPES[shapeIdx];

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '16px' }}>
      {/* 3D Hologram Canvas */}
      <HologramViewer
        modelUrl="/models/robot.glb"
        scale={1.0}
        hologramColor={shape.color}
        autoRotate={autoRotate}
        rotateSpeed={0.5}
        enableOrbitControls={true}
        loadingLabel="Loading 3D Geometry Hologram..."
        useFallback={true}
        proceduralShape={shape.name.toLowerCase() as any}
      />

      {/* Top HUD */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '999px', background: 'rgba(14,165,233,0.12)', border: '1px solid rgba(14,165,233,0.3)', color: '#0ea5e9', fontSize: '12px', fontWeight: '700' }}>
          <Box size={14} />
          <span>3D Geometry Hologram</span>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => setAutoRotate(v => !v)}
            style={{
              padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '700', cursor: 'pointer',
              background: autoRotate ? 'rgba(16,185,129,0.15)' : 'rgba(7,14,28,0.6)',
              border: autoRotate ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(255,255,255,0.1)',
              color: autoRotate ? '#10b981' : '#8b99b5',
              transition: 'all 0.2s ease',
              display: 'flex', alignItems: 'center', gap: '4px',
            }}
          >
            <RotateCw size={11} style={{ display: 'inline' }} /> Auto
          </button>
        </div>
      </div>

      {/* Shape Selector */}
      <div style={{ position: 'absolute', top: '56px', left: '50%', transform: 'translateX(-50%)', zIndex: 10, display: 'flex', gap: '6px' }}>
        {SHAPES.map((s, i) => (
          <button
            key={i}
            onClick={() => { setShapeIdx(i); onSpeak(SHAPES[i].explanation[language]); }}
            style={{
              padding: '5px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: '700', cursor: 'pointer',
              background: i === shapeIdx ? `${s.color}33` : 'rgba(7,14,28,0.7)',
              border: i === shapeIdx ? `1px solid ${s.color}80` : '1px solid rgba(255,255,255,0.1)',
              color: i === shapeIdx ? '#fff' : '#8b99b5',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.25s ease',
            }}
          >
            {s.emoji} {s.name}
          </button>
        ))}
      </div>

      {/* Bottom explanation */}
      <div style={{ position: 'relative', zIndex: 10, marginTop: 'auto' }}>
        <div className="glass-card" style={{ padding: '14px 16px', background: 'rgba(2,5,9,0.88)', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <h4 style={{ fontSize: '13px', fontFamily: 'var(--font-heading)', color: '#0ea5e9', fontWeight: '800' }}>
                {shape.emoji} {shape.name}
              </h4>
              <code style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '6px', background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)', color: '#38bdf8', fontWeight: '700' }}>
                {shape.formula[language]}
              </code>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              {shape.explanation[language]}
            </p>
          </div>
          <button
            onClick={() => onSpeak(shape.explanation[language])}
            className="glass-btn"
            style={{ width: '36px', height: '36px', borderRadius: '50%', padding: 0, flexShrink: 0, borderColor: 'rgba(14,165,233,0.3)' }}
          >
            <Volume2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
