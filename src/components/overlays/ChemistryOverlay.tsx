import React, { useState, Suspense, useRef } from 'react';
import type { Language } from '../../types';
import { Volume2, Atom } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  AtomSphere,
  BondCylinder,
  ElectronCloud,
  ARLighting,
  ShadowCatcherPlane,
} from '../three/VolumetricScenes';

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

// ─── Water Molecule (H₂O) ────────────────────────────────────────────
function WaterMolecule() {
  const groupRef = useRef<THREE.Group>(null!);
  // 104.5° bond angle
  const angle = (104.5 * Math.PI) / 180;
  const bondLen = 1.2;
  const h1: [number, number, number] = [bondLen * Math.sin(angle / 2), bondLen * Math.cos(angle / 2), 0];
  const h2: [number, number, number] = [-bondLen * Math.sin(angle / 2), bondLen * Math.cos(angle / 2), 0];
  const o: [number, number, number] = [0, 0, 0];

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.4;
    }
  });

  return (
    <group ref={groupRef}>
      <AtomSphere position={o} radius={0.5} color="#ef4444" emissiveIntensity={0.4} />
      <AtomSphere position={h1} radius={0.35} color="#e2e8f0" emissiveIntensity={0.25} />
      <AtomSphere position={h2} radius={0.35} color="#e2e8f0" emissiveIntensity={0.25} />
      <BondCylinder start={o} end={h1} radius={0.07} color="#94a3b8" />
      <BondCylinder start={o} end={h2} radius={0.07} color="#94a3b8" />
      <ElectronCloud center={[0, 0.3, 0]} radius={2.0} count={25} color="#60a5fa" speed={0.8} />
    </group>
  );
}

// ─── Methane Molecule (CH₄) ──────────────────────────────────────────
function MethaneMolecule() {
  const groupRef = useRef<THREE.Group>(null!);
  // Tetrahedral positions
  const c: [number, number, number] = [0, 0, 0];
  const bondLen = 1.3;
  const h1: [number, number, number] = [bondLen, bondLen, bondLen];
  const h2: [number, number, number] = [-bondLen, -bondLen, bondLen];
  const h3: [number, number, number] = [-bondLen, bondLen, -bondLen];
  const h4: [number, number, number] = [bondLen, -bondLen, -bondLen];
  // Normalize to bondLen
  const norm = (v: [number, number, number]): [number, number, number] => {
    const len = Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2);
    return [v[0] / len * bondLen, v[1] / len * bondLen, v[2] / len * bondLen];
  };
  const hn1 = norm(h1), hn2 = norm(h2), hn3 = norm(h3), hn4 = norm(h4);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.35;
      groupRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.2) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      <AtomSphere position={c} radius={0.45} color="#14b8a6" emissiveIntensity={0.4} />
      <AtomSphere position={hn1} radius={0.3} color="#e2e8f0" emissiveIntensity={0.2} />
      <AtomSphere position={hn2} radius={0.3} color="#e2e8f0" emissiveIntensity={0.2} />
      <AtomSphere position={hn3} radius={0.3} color="#e2e8f0" emissiveIntensity={0.2} />
      <AtomSphere position={hn4} radius={0.3} color="#e2e8f0" emissiveIntensity={0.2} />
      <BondCylinder start={c} end={hn1} radius={0.06} />
      <BondCylinder start={c} end={hn2} radius={0.06} />
      <BondCylinder start={c} end={hn3} radius={0.06} />
      <BondCylinder start={c} end={hn4} radius={0.06} />
      <ElectronCloud center={[0, 0, 0]} radius={2.2} count={30} color="#2dd4bf" speed={0.6} />
    </group>
  );
}

// ─── CO₂ Molecule ────────────────────────────────────────────────────
function CO2Molecule() {
  const groupRef = useRef<THREE.Group>(null!);
  const c: [number, number, number] = [0, 0, 0];
  const o1: [number, number, number] = [-1.4, 0, 0];
  const o2: [number, number, number] = [1.4, 0, 0];

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <group ref={groupRef}>
      <AtomSphere position={c} radius={0.42} color="#14b8a6" emissiveIntensity={0.35} />
      <AtomSphere position={o1} radius={0.48} color="#ef4444" emissiveIntensity={0.35} />
      <AtomSphere position={o2} radius={0.48} color="#ef4444" emissiveIntensity={0.35} />
      {/* Double bonds — two cylinders offset slightly */}
      <BondCylinder start={[-0.05, 0.08, 0]} end={[-1.35, 0.08, 0]} radius={0.055} />
      <BondCylinder start={[-0.05, -0.08, 0]} end={[-1.35, -0.08, 0]} radius={0.055} />
      <BondCylinder start={[0.05, 0.08, 0]} end={[1.35, 0.08, 0]} radius={0.055} />
      <BondCylinder start={[0.05, -0.08, 0]} end={[1.35, -0.08, 0]} radius={0.055} />
      <ElectronCloud center={[0, 0, 0]} radius={2.5} count={25} color="#fbbf24" speed={0.7} />
    </group>
  );
}

// ─── Molecule Scene ──────────────────────────────────────────────────
function MoleculeScene({ molIndex }: { molIndex: number }) {
  return (
    <>
      <ARLighting sunIntensity={1.2} sunPosition={[4, 6, 5]} ambientIntensity={0.4} />
      <pointLight position={[0, 0, 3]} intensity={0.6} color="#ffffff" distance={10} />
      <ShadowCatcherPlane position={[0, -2.5, 0]} />
      <fog attach="fog" args={['#020509', 8, 18]} />

      {molIndex === 0 && <WaterMolecule />}
      {molIndex === 1 && <MethaneMolecule />}
      {molIndex === 2 && <CO2Molecule />}
    </>
  );
}

export const ChemistryOverlay: React.FC<ChemistryOverlayProps> = ({ language, onSpeak }) => {
  const [molIndex, setMolIndex] = useState(0);
  const [selectedEl, setSelectedEl] = useState<string | null>(null);

  const mol = MOLECULES[molIndex];

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '16px' }}>
      {/* 3D Molecule Canvas */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        <Canvas
          camera={{ position: [0, 1, 5], fov: 45 }}
          shadows
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          style={{ background: 'transparent' }}
        >
          <Suspense fallback={null}>
            <MoleculeScene molIndex={molIndex} />
          </Suspense>
        </Canvas>
      </div>

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
