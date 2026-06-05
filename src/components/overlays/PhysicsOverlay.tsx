import React, { useState, Suspense, useMemo } from 'react';
import type { Language } from '../../types';
import { Sun, BookOpen } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  PrismMesh,
  LightBeam,
  ARLighting,
  ShadowCatcherPlane,
} from '../three/VolumetricScenes';
import { useRef } from 'react';

interface PhysicsOverlayProps {
  language: Language;
  onSpeak: (text: string) => void;
}

// ─── Spectrum Beams Component ─────────────────────────────────────────
// Renders the ROYGBV dispersed light beams exiting the prism
function SpectrumBeams({ angle }: { angle: number }) {
  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];

  const beams = useMemo(() => {
    const rad = (angle * Math.PI) / 180;
    return colors.map((color, idx) => {
      const spread = (idx - 2.5) * 4;
      const outAngle = rad * 0.3 + spread * (Math.PI / 180);
      const exitX = 0.6;
      const exitY = -0.1 + idx * 0.08;
      const endX = exitX + Math.cos(outAngle) * 4;
      const endY = exitY + Math.sin(outAngle) * 1.5;
      return {
        color,
        start: [exitX, exitY, 0] as [number, number, number],
        end: [endX, endY, 0] as [number, number, number],
      };
    });
  }, [angle]);

  return (
    <>
      {beams.map((beam, i) => (
        <LightBeam
          key={i}
          start={beam.start}
          end={beam.end}
          color={beam.color}
          radius={0.025}
          opacity={0.9}
        />
      ))}
    </>
  );
}

// ─── Incoming White Light Beam ────────────────────────────────────────
function IncomingBeam({ angle }: { angle: number }) {
  const beam = useMemo(() => {
    const rad = (angle * Math.PI) / 180;
    const startX = -4 * Math.cos(rad);
    const startY = 4 * Math.sin(rad) * 0.3;
    return {
      start: [startX, startY, 0] as [number, number, number],
      end: [-0.3, 0.1, 0] as [number, number, number],
    };
  }, [angle]);

  return (
    <LightBeam
      start={beam.start}
      end={beam.end}
      color="#ffffff"
      radius={0.045}
      opacity={0.95}
    />
  );
}

// ─── Glow Sprite at refraction points ────────────────────────────────
function GlowPoint({ position, color }: { position: [number, number, number]; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const pulse = 0.8 + Math.sin(clock.getElapsedTime() * 3) * 0.2;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.12, 16, 16]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.5}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// ─── 3D Prism Scene ──────────────────────────────────────────────────
function PrismScene({ angle }: { angle: number }) {
  return (
    <>
      {/* AR Lighting */}
      <ARLighting sunIntensity={0.8} sunPosition={[3, 6, 4]} ambientIntensity={0.2} />
      <pointLight position={[-3, 2, 2]} intensity={0.6} color="#ffffff" distance={12} />

      {/* Shadow catcher */}
      <ShadowCatcherPlane position={[0, -2.5, 0]} size={10} />

      {/* Dark fog for depth */}
      <fog attach="fog" args={['#050510', 8, 18]} />

      {/* Glass prism — MeshPhysicalMaterial with transmission */}
      <PrismMesh position={[0, 0, -0.4]} scale={0.9} rotation={[0, 0, 0]} />

      {/* Incoming white light beam */}
      <IncomingBeam angle={angle} />

      {/* Glow at entry point */}
      <GlowPoint position={[-0.3, 0.1, 0]} color="#ffffff" />

      {/* Glow at exit point */}
      <GlowPoint position={[0.6, -0.1, 0]} color="#a78bfa" />

      {/* Dispersed spectrum beams */}
      <SpectrumBeams angle={angle} />
    </>
  );
}

export const PhysicsOverlay: React.FC<PhysicsOverlayProps> = ({ language, onSpeak }) => {
  const [angle, setAngle] = useState(30);

  const handleAngleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAngle(Number(e.target.value));
  };

  const playExplanation = () => {
    const text = {
      en: "This is a prism. White light enters and refracts, separating into the visible color spectrum due to different wavelengths bending at different angles.",
      hi: "यह एक प्रिज्म है। सफेद प्रकाश प्रवेश करता है और अपवर्तित होता है, अलग-अलग तरंग दैर्ध्य के कारण दृश्य रंग स्पेक्ट्रम में अलग हो जाता है।",
      gu: "આ પ્રિઝમ છે. સફેદ પ્રકાશ પ્રવેશે છે અને વક્રીભવન પામે છે, જુદી જુદી તરંગલંબાઇને કારણે દૃશ્યમાન રંગ સ્પેક્ટ્રમમાં અલગ પડે છે."
    };
    onSpeak(text[language]);
  };

  return (
    <div style={{ position: 'absolute', inset: 0, borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* 3D Prism Scene */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        <Canvas
          camera={{ position: [0, 0.5, 5], fov: 45 }}
          shadows
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          style={{ background: 'linear-gradient(180deg, #050510 0%, #0a0a20 100%)' }}
        >
          <Suspense fallback={null}>
            <PrismScene angle={angle} />
          </Suspense>
        </Canvas>
      </div>

      {/* Bottom Controls */}
      <div style={{
        position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(7,14,28,0.85)', padding: '16px 24px', borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)',
        width: '90%', maxWidth: '340px', zIndex: 10,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sun size={18} style={{ color: 'var(--saffron)' }} />
            <span style={{ color: '#fff', fontSize: '14px', fontWeight: '700' }}>Light Angle: {angle}°</span>
          </div>
          <button onClick={playExplanation} className="glass-btn ghost" style={{ padding: '4px 8px', fontSize: '12px' }}>
            <BookOpen size={14} /> Explain
          </button>
        </div>

        <input
          type="range"
          min="10" max="80"
          value={angle}
          onChange={handleAngleChange}
          style={{ width: '100%', accentColor: 'var(--saffron)' }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
           <span>Shallow</span>
           <span>Steep</span>
        </div>
      </div>
    </div>
  );
};
