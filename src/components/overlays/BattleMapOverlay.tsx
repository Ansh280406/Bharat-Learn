import React, { useState, useEffect, Suspense, useRef, useMemo } from 'react';
import type { Language } from '../../types';
import { Volume2, Map } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ARLighting, ShadowCatcherPlane, WaterBody } from '../three/VolumetricScenes';

interface BattleMapOverlayProps {
  language: Language;
  onSpeak: (text: string) => void;
  battleName?: string | null;
}

interface BattlePhase {
  year: string;
  phaseTitle: Record<Language, string>;
  description: Record<Language, string>;
}

// ─── Terrain for battlefield ─────────────────────────────────────────
function BattlefieldTerrain() {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(12, 8, 48, 48);
    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const baseColor = new THREE.Color('#3d2b1f');
    const grassColor = new THREE.Color('#2d4a2d');

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const height = (Math.sin(x * 0.5) * Math.cos(y * 0.3) * 0.15)
        + (Math.sin(x * 1.2 + 3) * 0.08);
      pos.setZ(i, height);

      const c = new THREE.Color();
      c.lerpColors(grassColor, baseColor, Math.random() * 0.4 + 0.3);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
      <meshStandardMaterial vertexColors roughness={0.9} metalness={0} />
    </mesh>
  );
}

// ─── Army Unit (small cluster of box soldiers) ───────────────────────
function ArmyUnit({
  position,
  color,
  count = 5,
  label,
}: {
  position: [number, number, number];
  color: string;
  count?: number;
  label?: string;
}) {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * 2 + position[0]) * 0.03;
    }
  });

  const soldiers = useMemo(() => {
    const result: [number, number, number][] = [];
    for (let i = 0; i < count; i++) {
      const row = Math.floor(i / 3);
      const col = i % 3;
      result.push([col * 0.2 - 0.2, 0, row * 0.2 - 0.1]);
    }
    return result;
  }, [count]);

  return (
    <group ref={groupRef} position={position}>
      {soldiers.map((pos, i) => (
        <mesh key={i} position={pos} castShadow>
          <boxGeometry args={[0.12, 0.25, 0.1]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.3}
            roughness={0.5}
            metalness={0.2}
          />
        </mesh>
      ))}
      {/* Flag/banner on top */}
      <mesh position={[0, 0.3, 0]}>
        <coneGeometry args={[0.06, 0.15, 6]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

// ─── Cannon with fire effect ─────────────────────────────────────────
function Cannon({ position, firing }: { position: [number, number, number]; firing: boolean }) {
  const fireRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    if (fireRef.current && firing) {
      const pulse = Math.sin(clock.getElapsedTime() * 8) * 0.5 + 0.5;
      fireRef.current.scale.setScalar(0.5 + pulse * 0.5);
      (fireRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 1 + pulse * 2;
    }
  });

  return (
    <group position={position}>
      {/* Cannon barrel */}
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.04, 0.06, 0.4, 8]} />
        <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Fire effect */}
      {firing && (
        <mesh ref={fireRef} position={[0.3, 0, 0]}>
          <sphereGeometry args={[0.1, 12, 12]} />
          <meshStandardMaterial
            color="#f59e0b"
            emissive="#ef4444"
            emissiveIntensity={2}
            transparent
            opacity={0.8}
          />
        </mesh>
      )}
    </group>
  );
}

// ─── Cavalry Path (animated dots along curve) ─────────────────────────
function CavalryPath({ visible }: { visible: boolean }) {
  const pointsRef = useRef<THREE.Points>(null!);
  const count = 20;

  const curve = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(-3, -1.7, -2),
    new THREE.Vector3(-1, -1.5, -3),
    new THREE.Vector3(1.5, -1.6, -2.5),
    new THREE.Vector3(3, -1.7, -1),
    new THREE.Vector3(2, -1.8, 1),
  ]), []);

  const positions = useMemo(() => new Float32Array(count * 3), [count]);

  useFrame(({ clock }) => {
    if (!pointsRef.current || !visible) return;
    const t = clock.getElapsedTime() * 0.15;
    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const param = ((t + i / count) % 1);
      const point = curve.getPoint(param);
      pos[i * 3] = point.x;
      pos[i * 3 + 1] = point.y;
      pos[i * 3 + 2] = point.z;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  if (!visible) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#06b6d4"
        size={0.12}
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// ─── Victory Particles ───────────────────────────────────────────────
function VictoryParticles({ visible }: { visible: boolean }) {
  const pointsRef = useRef<THREE.Points>(null!);
  const count = 60;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 6;
      pos[i * 3 + 1] = -1.5 + Math.random() * 3;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    return pos;
  }, [count]);

  useFrame((_, delta) => {
    if (!pointsRef.current || !visible) return;
    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += delta * 0.5;
      if (pos[i * 3 + 1] > 2) pos[i * 3 + 1] = -1.5;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  if (!visible) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#fbbf24"
        size={0.08}
        transparent
        opacity={0.7}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// ─── Battle Scene ────────────────────────────────────────────────────
function BattleScene({ phaseIdx }: { phaseIdx: number }) {
  return (
    <>
      <ARLighting sunIntensity={1.2} sunPosition={[4, 8, 3]} ambientIntensity={0.3} />
      <ShadowCatcherPlane position={[0, -2.1, 0]} size={14} />
      <fog attach="fog" args={['#0a0b16', 10, 20]} />

      {/* Terrain */}
      <BattlefieldTerrain />

      {/* Yamuna River */}
      <WaterBody
        width={10}
        depth={1.0}
        segments={32}
        position={[0, -1.85, 0]}
        color="#1e3a5f"
        opacity={0.6}
        waveSpeed={0.8}
        waveHeight={0.03}
      />

      {/* Mughal Army (Blue) — left side */}
      <ArmyUnit position={[-3, -1.7, 0]} color="#3b82f6" count={6} label="Babur" />
      <ArmyUnit position={[-3, -1.7, -1]} color="#3b82f6" count={4} />

      {/* Cannons chained carts */}
      <Cannon position={[-2.2, -1.7, 0.3]} firing={phaseIdx >= 1} />
      <Cannon position={[-2.2, -1.7, -0.3]} firing={phaseIdx >= 1} />
      <Cannon position={[-2.2, -1.7, -0.9]} firing={phaseIdx >= 1} />

      {/* Lodi Army (Red) — right side */}
      {phaseIdx < 3 && (
        <>
          <ArmyUnit position={[2.5, -1.7, 0]} color="#ef4444" count={8} label="Lodi" />
          <ArmyUnit position={[2.5, -1.7, -1]} color="#ef4444" count={6} />
          <ArmyUnit position={[3, -1.7, 0.5]} color="#ef4444" count={4} />
          {/* War elephants */}
          <mesh position={[2, -1.5, 0.8]} castShadow>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial color="#78716c" roughness={0.7} metalness={0.1} />
          </mesh>
          <mesh position={[2, -1.5, -0.5]} castShadow>
            <sphereGeometry args={[0.18, 16, 16]} />
            <meshStandardMaterial color="#78716c" roughness={0.7} metalness={0.1} />
          </mesh>
        </>
      )}

      {/* Cavalry flanking path (Phase 3) */}
      <CavalryPath visible={phaseIdx >= 2} />

      {/* Victory particles (Phase 4) */}
      <VictoryParticles visible={phaseIdx >= 3} />
    </>
  );
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
      {/* 3D Battle Scene Canvas */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        <Canvas
          camera={{ position: [0, 4, 6], fov: 50 }}
          shadows
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          style={{ background: 'transparent' }}
        >
          <Suspense fallback={null}>
            <BattleScene phaseIdx={phaseIdx} />
          </Suspense>
        </Canvas>
      </div>

      {/* Title HUD Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 10,
        position: 'relative',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '6px 14px', background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          borderRadius: '50px', color: 'var(--accent)', fontSize: '13px', fontWeight: '700'
        }}>
          <Map size={16} />
          <span>3D Battle Map</span>
        </div>

        <div style={{
          padding: '6px 12px', background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '50px', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)'
        }}>
          {activePhase.year}
        </div>
      </div>

      {/* Timeline Scrubber & Details */}
      <div style={{ zIndex: 10, display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>
            <span>Morning (08:00)</span>
            <span>Midday (12:00)</span>
            <span>Afternoon (14:00)</span>
            <span>Victory (17:00)</span>
          </div>
          <input
            type="range" min="0" max="3" step="1"
            value={phaseIdx}
            onChange={(e) => setPhaseIdx(parseInt(e.target.value))}
            style={{
              width: '100%', accentColor: 'var(--accent)',
              cursor: 'pointer', height: '6px', borderRadius: '3px',
              background: 'rgba(255,255,255,0.1)'
            }}
          />
        </div>

        <div className="glass-card float-panel" style={{
          padding: '16px', border: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(10, 11, 22, 0.85)',
          display: 'flex', gap: '12px', alignItems: 'center'
        }}>
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: '14px', fontFamily: 'var(--font-heading)', color: '#fff', marginBottom: '4px' }}>
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
