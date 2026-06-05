import React, { useState, Suspense } from 'react';
import type { Language, PartExplanation } from '../../types';
import { Volume2 } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Html } from '@react-three/drei';
import {
  TerrainMesh,
  WaterBody,
  VolumetricCloud,
  RainParticleSystem,
  EvaporationParticles,
  EmissiveSun,
  RiverMesh,
  ARLighting,
  ShadowCatcherPlane,
} from '../three/VolumetricScenes';
import * as THREE from 'three';

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

// ─── 3D Water Cycle Scene ────────────────────────────────────────────
function WaterCycleScene() {
  return (
    <>
      {/* AR Lighting with shadows */}
      <ARLighting sunIntensity={1.6} sunPosition={[6, 8, 4]} ambientIntensity={0.35} />

      {/* Shadow catcher */}
      <ShadowCatcherPlane position={[0, -2.5, 0]} size={16} />

      {/* Fog for depth */}
      <fog attach="fog" args={['#0a0b16', 10, 22]} />

      {/* Mountain terrain — noise-displaced */}
      <TerrainMesh
        width={12}
        depth={8}
        segments={64}
        heightScale={3.0}
        position={[-1, -2.5, -2]}
        color="#2d1f0e"
        snowColor="#dfe6ed"
        snowThreshold={0.6}
      />

      {/* Ocean water body — animated ripples */}
      <WaterBody
        width={8}
        depth={6}
        segments={48}
        position={[3, -2.2, 1]}
        color="#0891b2"
        opacity={0.72}
        waveSpeed={1.2}
        waveHeight={0.06}
      />

      {/* River flowing down mountain */}
      <RiverMesh
        points={[
          new THREE.Vector3(-2.5, 0.5, -1),
          new THREE.Vector3(-1.5, -0.5, -0.3),
          new THREE.Vector3(-0.3, -1.5, 0),
          new THREE.Vector3(0.8, -2.0, 0.4),
          new THREE.Vector3(2.5, -2.2, 0.8),
        ]}
        width={0.12}
        color="#06b6d4"
      />

      {/* Emissive glowing sun */}
      <EmissiveSun position={[5, 5, -4]} radius={0.7} color="#fbbf24" intensity={3.5} />

      {/* Volumetric clouds */}
      <VolumetricCloud position={[-2, 3.5, -1]} scale={1.2} opacity={0.55} puffCount={8} />
      <VolumetricCloud position={[1, 4, -2]} scale={0.9} opacity={0.5} puffCount={6} />
      <VolumetricCloud position={[-3.5, 3, 0]} scale={0.7} opacity={0.45} puffCount={5} />

      {/* Rain particles falling from clouds */}
      <RainParticleSystem
        count={180}
        area={[5, 5, 3]}
        position={[-1.5, 3, -0.5]}
        color="#7dd3fc"
        speed={5}
      />

      {/* Evaporation particles rising from water */}
      <EvaporationParticles
        count={50}
        position={[3, -1.8, 1]}
        color="#fbbf24"
        area={[4, 3]}
        speed={0.5}
      />
    </>
  );
}

export const WaterCycleOverlay: React.FC<WaterCycleOverlayProps> = ({ language, onSpeak }) => {
  const [selectedStage, setSelectedStage] = useState<string | null>(null);

  const selectStage = (stageKey: string) => {
    setSelectedStage(stageKey);
    const exp = cycleStages[stageKey];
    if (exp) onSpeak(exp[language]);
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
      {/* 3D Water Cycle Scene */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        <Canvas
          camera={{ position: [0, 2, 8], fov: 50 }}
          shadows
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          style={{ background: 'transparent' }}
        >
          <Suspense fallback={null}>
            <WaterCycleScene />
          </Suspense>
        </Canvas>
      </div>

      {/* Clickable Interactive Hotspot Overlay Badges */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 5,
        pointerEvents: 'none'
      }}>
        <button
          onClick={() => selectStage('evaporation')}
          className="glass-card float-panel"
          style={{
            position: 'absolute', bottom: '22%', right: '18%',
            pointerEvents: 'auto', padding: '6px 14px', borderRadius: '50px', fontSize: '12px', fontWeight: '700',
            border: selectedStage === 'evaporation' ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.1)',
            boxShadow: selectedStage === 'evaporation' ? '0 0 12px var(--accent-glow)' : 'none',
            color: selectedStage === 'evaporation' ? 'var(--accent)' : '#fff',
            cursor: 'pointer'
          }}
        >
          🟡 Evaporation
        </button>

        <button
          onClick={() => selectStage('condensation')}
          className="glass-card"
          style={{
            position: 'absolute', top: '12%', left: '30%',
            pointerEvents: 'auto', padding: '6px 14px', borderRadius: '50px', fontSize: '12px', fontWeight: '700',
            border: selectedStage === 'condensation' ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)',
            boxShadow: selectedStage === 'condensation' ? '0 0 12px var(--primary-glow)' : 'none',
            color: selectedStage === 'condensation' ? 'var(--primary)' : '#fff',
            cursor: 'pointer'
          }}
        >
          ☁️ Condensation
        </button>

        <button
          onClick={() => selectStage('precipitation')}
          className="glass-card float-panel"
          style={{
            position: 'absolute', top: '40%', left: '12%',
            pointerEvents: 'auto', padding: '6px 14px', borderRadius: '50px', fontSize: '12px', fontWeight: '700',
            border: selectedStage === 'precipitation' ? '1px solid var(--secondary)' : '1px solid rgba(255,255,255,0.1)',
            boxShadow: selectedStage === 'precipitation' ? '0 0 12px var(--secondary-glow)' : 'none',
            color: selectedStage === 'precipitation' ? 'var(--secondary)' : '#fff',
            cursor: 'pointer'
          }}
        >
          🌧️ Precipitation
        </button>

        <button
          onClick={() => selectStage('collection')}
          className="glass-card"
          style={{
            position: 'absolute', bottom: '36%', left: '38%',
            pointerEvents: 'auto', padding: '6px 14px', borderRadius: '50px', fontSize: '12px', fontWeight: '700',
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
            display: 'flex', gap: '12px', alignItems: 'center'
          }}>
            <div style={{ flex: 1 }}>
              <h4 style={{
                fontSize: '14px', fontFamily: 'var(--font-heading)',
                color: '#fff', marginBottom: '4px',
                display: 'flex', alignItems: 'center', gap: '6px'
              }}>
                <span style={{
                  width: '8px', height: '8px', borderRadius: '50%',
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
            padding: '12px 16px', textAlign: 'center',
            background: 'rgba(10, 11, 22, 0.7)', fontSize: '13px', color: 'var(--text-secondary)'
          }}>
            👆 Click on any water cycle badge above to explore evaporation, precipitation, and rivers in Indian languages!
          </div>
        )}
      </div>
    </div>
  );
};
