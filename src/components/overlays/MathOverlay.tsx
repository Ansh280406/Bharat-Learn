import React, { useState, useEffect, Suspense, useRef, useMemo } from 'react';
import type { Language } from '../../types';
import { Volume2, ChevronRight, ChevronLeft, Scale } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { ARLighting, ShadowCatcherPlane } from '../three/VolumetricScenes';

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
    leftUnitCount: 0,
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

// ─── Variable Block (green "x" bar) ──────────────────────────────────
function VariableBlock({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position} castShadow>
      <boxGeometry args={[0.35, 0.6, 0.25]} />
      <meshStandardMaterial
        color="#10b981"
        emissive="#10b981"
        emissiveIntensity={0.35}
        roughness={0.3}
        metalness={0.2}
      />
    </mesh>
  );
}

// ─── Unit Block (orange "+1" cube) ────────────────────────────────────
function UnitBlock({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position} castShadow>
      <boxGeometry args={[0.22, 0.22, 0.22]} />
      <meshStandardMaterial
        color="#f59e0b"
        emissive="#f59e0b"
        emissiveIntensity={0.3}
        roughness={0.35}
        metalness={0.15}
      />
    </mesh>
  );
}

// ─── Balance Scale ───────────────────────────────────────────────────
function BalanceScale({ step }: { step: StepDetails }) {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.3) * 0.08;
    }
  });

  // Layout blocks on left plate
  const leftBlocks = useMemo(() => {
    const blocks: { type: 'x' | 'unit'; pos: [number, number, number] }[] = [];
    let xOff = -0.25;
    for (let i = 0; i < step.leftXCount; i++) {
      blocks.push({ type: 'x', pos: [xOff + i * 0.45, 0.4, 0] });
    }
    const unitStartX = -0.3;
    for (let i = 0; i < step.leftUnitCount; i++) {
      const row = Math.floor(i / 4);
      const col = i % 4;
      blocks.push({ type: 'unit', pos: [unitStartX + col * 0.28, 0.15 + row * 0.28, 0.1] });
    }
    return blocks;
  }, [step.leftXCount, step.leftUnitCount]);

  // Layout blocks on right plate
  const rightBlocks = useMemo(() => {
    const blocks: { pos: [number, number, number] }[] = [];
    for (let i = 0; i < step.rightUnitCount; i++) {
      const row = Math.floor(i / 4);
      const col = i % 4;
      blocks.push({ pos: [-0.3 + col * 0.28, 0.15 + row * 0.28, 0] });
    }
    return blocks;
  }, [step.rightUnitCount]);

  return (
    <group ref={groupRef}>
      {/* Fulcrum — metallic cone */}
      <mesh position={[0, -1.8, 0]} castShadow>
        <coneGeometry args={[0.35, 0.8, 16]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.15} metalness={0.8} />
      </mesh>

      {/* Horizontal beam */}
      <mesh position={[0, -1.35, 0]} castShadow>
        <boxGeometry args={[4.0, 0.1, 0.15]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.2} metalness={0.7} />
      </mesh>

      {/* Left plate */}
      <group position={[-1.5, -1.25, 0]}>
        {/* Plate disc */}
        <mesh receiveShadow>
          <cylinderGeometry args={[0.7, 0.7, 0.06, 32]} />
          <meshStandardMaterial color="#8b5cf6" roughness={0.3} metalness={0.4} emissive="#8b5cf6" emissiveIntensity={0.08} />
        </mesh>
        {/* Strings */}
        {[[-0.4, 0], [0.4, 0], [0, -0.4], [0, 0.4]].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.35, z]}>
            <cylinderGeometry args={[0.008, 0.008, 0.7, 4]} />
            <meshStandardMaterial color="#64748b" roughness={0.5} metalness={0.3} />
          </mesh>
        ))}
        {/* Blocks on left plate */}
        {leftBlocks.map((b, i) =>
          b.type === 'x'
            ? <VariableBlock key={`lx-${i}`} position={b.pos} />
            : <UnitBlock key={`lu-${i}`} position={b.pos} />
        )}
      </group>

      {/* Right plate */}
      <group position={[1.5, -1.25, 0]}>
        <mesh receiveShadow>
          <cylinderGeometry args={[0.7, 0.7, 0.06, 32]} />
          <meshStandardMaterial color="#06b6d4" roughness={0.3} metalness={0.4} emissive="#06b6d4" emissiveIntensity={0.08} />
        </mesh>
        {[[-0.4, 0], [0.4, 0], [0, -0.4], [0, 0.4]].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.35, z]}>
            <cylinderGeometry args={[0.008, 0.008, 0.7, 4]} />
            <meshStandardMaterial color="#64748b" roughness={0.5} metalness={0.3} />
          </mesh>
        ))}
        {rightBlocks.map((b, i) => (
          <UnitBlock key={`ru-${i}`} position={b.pos} />
        ))}
      </group>
    </group>
  );
}

// ─── Balance Scene ───────────────────────────────────────────────────
function BalanceScene({ step }: { step: StepDetails }) {
  return (
    <>
      <ARLighting sunIntensity={1.3} sunPosition={[4, 7, 5]} ambientIntensity={0.35} />
      <pointLight position={[0, 2, 3]} intensity={0.5} color="#ffffff" distance={10} />
      <ShadowCatcherPlane position={[0, -2.5, 0]} />
      <fog attach="fog" args={['#020509', 8, 18]} />

      <Float speed={1.5} rotationIntensity={0.05} floatIntensity={0.3} floatingRange={[-0.05, 0.05]}>
        <BalanceScale step={step} />
      </Float>
    </>
  );
}

export const MathOverlay: React.FC<MathOverlayProps> = ({ language, onSpeak }) => {
  const [activeStep, setActiveStep] = useState(0);

  const currentStep = steps[activeStep];

  useEffect(() => {
    onSpeak(`${currentStep.title[language]}. ${currentStep.description[language]}`);
  }, [activeStep]);

  const handleNext = () => {
    if (activeStep < steps.length - 1) setActiveStep(prev => prev + 1);
  };

  const handlePrev = () => {
    if (activeStep > 0) setActiveStep(prev => prev - 1);
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
      {/* 3D Balance Scale Canvas */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        <Canvas
          camera={{ position: [0, 0.5, 5], fov: 45 }}
          shadows
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          style={{ background: 'transparent' }}
        >
          <Suspense fallback={null}>
            <BalanceScene step={currentStep} />
          </Suspense>
        </Canvas>
      </div>

      {/* Equation Pill Indicator */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 10,
        position: 'relative',
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

      {/* Control Area: Steps Navigation and TTS Explanations */}
      <div style={{ zIndex: 10, display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}>
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
