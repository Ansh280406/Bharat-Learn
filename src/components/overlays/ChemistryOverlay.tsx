import React, { useState } from 'react';
import type { Language } from '../../types';
import { Volume2, Atom } from 'lucide-react';
import { HologramViewer } from '../three/HologramViewer';

interface ChemistryOverlayProps {
  language: Language;
  onSpeak: (text: string) => void;
}

interface Molecule {
  name: string;
  formula: string;
  explanation: Record<Language, string>;
  hologramColor: string;
  atoms: { element: string; color: string }[];
}

const MOLECULES: Molecule[] = [
  {
    name: 'Water (H₂O)',
    formula: 'H₂O',
    hologramColor: '#0ea5e9',
    atoms: [
      { element: 'Oxygen', color: '#ef4444' },
      { element: 'Hydrogen', color: '#e2e8f0' },
    ],
    explanation: {
      en: 'Water (H₂O) is a bent molecule. One oxygen atom bonds with two hydrogen atoms via covalent bonds, creating a 104.5° angle. This gives water its polarity and special properties.',
      hi: 'पानी (H₂O) एक मुड़ा हुआ अणु है। एक ऑक्सीजन परमाणु दो हाइड्रोजन परमाणुओं से सहसंयोजी बंधों के माध्यम से जुड़ता है, जिससे 104.5° का कोण बनता है।',
      gu: 'પાણી (H₂O) એ વળાંકવાળો અણુ છે. એક ઓક્સિજન પરમાણુ સહ-સંયોજી બંધ દ્વારા બે હાઇડ્રોજન પરમાણુ સાથે જોડાય છે, જેનાથી 104.5°નો ખૂણો બને છે.',
    },
  },
  {
    name: 'Methane (CH₄)',
    formula: 'CH₄',
    hologramColor: '#14b8a6',
    atoms: [
      { element: 'Carbon', color: '#14b8a6' },
      { element: 'Hydrogen', color: '#e2e8f0' },
    ],
    explanation: {
      en: 'Methane (CH₄) is the simplest hydrocarbon. One carbon atom forms 4 equal covalent bonds with 4 hydrogen atoms in a perfect tetrahedral shape — 109.5° bond angles.',
      hi: 'मीथेन (CH₄) सबसे सरल हाइड्रोकार्बन है। एक कार्बन परमाणु 4 हाइड्रोजन परमाणुओं के साथ 4 समान सहसंयोजी बंध बनाता है — 109.5° के बंध कोण के साथ।',
      gu: 'મિથેન (CH₄) સૌથી સરળ હાઇડ્રોકાર્બન છે. એક કાર્બન પરમાણુ 4 હાઇડ્રોજન પરમાણુ સાથે 4 સહ-સંયોજી બંધ બનાવે છે — 109.5° ના ખૂણા સાથે.',
    },
  },
  {
    name: 'CO₂',
    formula: 'CO₂',
    hologramColor: '#f59e0b',
    atoms: [
      { element: 'Carbon', color: '#14b8a6' },
      { element: 'Oxygen', color: '#ef4444' },
    ],
    explanation: {
      en: 'Carbon Dioxide (CO₂) is a linear molecule. Carbon forms two double bonds with oxygen atoms. It is the primary greenhouse gas and is absorbed by plants in photosynthesis.',
      hi: 'कार्बन डाइऑक्साइड (CO₂) एक रैखिक अणु है। कार्बन ऑक्सीजन के साथ दो दोहरे बंध बनाता है। यह प्राथमिक ग्रीनहाउस गैस है।',
      gu: 'કાર્બન ડાઈઓક્સાઈડ (CO₂) એ રેખીય અણુ છે. કાર્બન ઓક્સિજન સાથે બે ડબલ બોન્ડ બનાવે છે. તે મુખ્ય ગ્રીનહાઉસ ગેસ છે.',
    },
  },
];

export const ChemistryOverlay: React.FC<ChemistryOverlayProps> = ({ language, onSpeak }) => {
  const [molIndex, setMolIndex] = useState(0);
  const [selectedEl, setSelectedEl] = useState<string | null>(null);

  const mol = MOLECULES[molIndex];

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '16px' }}>
      {/* 3D Hologram Canvas */}
      <HologramViewer
        modelUrl="/models/dna.glb"
        scale={3.0}
        hologramColor={mol.hologramColor}
        autoRotate={true}
        rotateSpeed={0.3}
        enableOrbitControls={true}
        loadingLabel="Loading Molecular Hologram..."
        onPartClick={(name) => {
          setSelectedEl(name);
          onSpeak(`${name} atom. ${mol.explanation[language]}`);
        }}
      />

      {/* Top HUD */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '999px', background: 'rgba(20,184,166,0.12)', border: '1px solid rgba(20,184,166,0.25)', color: '#14b8a6', fontSize: '12px', fontWeight: '700' }}>
          <Atom size={14} />
          <span>3D Molecular Hologram</span>
        </div>
        {/* Molecule Switcher Pills */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {MOLECULES.map((m, i) => (
            <button
              key={i}
              onClick={() => { setMolIndex(i); setSelectedEl(null); }}
              style={{
                padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '700', cursor: 'pointer',
                background: i === molIndex ? 'rgba(20,184,166,0.25)' : 'rgba(7,14,28,0.6)',
                border: i === molIndex ? '1px solid rgba(20,184,166,0.5)' : '1px solid rgba(255,255,255,0.1)',
                color: i === molIndex ? '#14b8a6' : '#8b99b5',
                transition: 'all 0.2s ease',
              }}
            >
              {m.formula}
            </button>
          ))}
        </div>
      </div>

      {/* Atom Legend */}
      <div style={{ position: 'absolute', top: '56px', left: '16px', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {mol.atoms.map((atom) => (
          <div key={atom.element} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: atom.color }} />
            <span style={{ fontSize: '10px', color: '#8b99b5', fontWeight: '600' }}>{atom.element}</span>
          </div>
        ))}
      </div>

      {/* Bottom explanation */}
      <div style={{ position: 'relative', zIndex: 10, marginTop: 'auto' }}>
        <div className="glass-card" style={{ padding: '14px 16px', background: 'rgba(2,5,9,0.88)', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: '13px', fontFamily: 'var(--font-heading)', color: '#14b8a6', marginBottom: '4px', fontWeight: '800' }}>
              {mol.name} {selectedEl ? `— ${selectedEl} selected` : ''}
            </h4>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              {mol.explanation[language]}
            </p>
          </div>
          <button
            onClick={() => onSpeak(mol.explanation[language])}
            className="glass-btn"
            style={{ width: '36px', height: '36px', borderRadius: '50%', padding: 0, flexShrink: 0, borderColor: 'rgba(20,184,166,0.3)' }}
          >
            <Volume2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
