import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { Language } from '../../types';
import { Volume2, Box, RotateCw } from 'lucide-react';

interface Math3DOverlayProps {
  language: Language;
  onSpeak: (text: string) => void;
}

interface Shape3D {
  name: string;
  emoji: string;
  color: number;
  glowColor: string;
  geometry: () => THREE.BufferGeometry;
  formula: Record<Language, string>;
  explanation: Record<Language, string>;
}

const SHAPES: Shape3D[] = [
  {
    name: 'Cube',
    emoji: '🧊',
    color: 0x0ea5e9,
    glowColor: 'rgba(14,165,233,0.4)',
    geometry: () => new THREE.BoxGeometry(2.2, 2.2, 2.2),
    formula: {
      en: 'V = a³ | SA = 6a²',
      hi: 'V = a³ | SA = 6a²',
      gu: 'V = a³ | SA = 6a²',
    },
    explanation: {
      en: 'A Cube has 6 equal square faces, 12 edges and 8 vertices. Volume = side³. Surface Area = 6 × side². All angles are perfect right angles (90°).',
      hi: 'घन की 6 समान वर्गाकार भुजाएँ, 12 कोर और 8 शीर्ष होते हैं। आयतन = भुजा³। पृष्ठ क्षेत्रफल = 6 × भुजा²।',
      gu: 'ઘન ને 6 સમાન ચોરસ ફ્ face, 12 ધાર અને 8 ખૂણા છે. કદ = બાજુ³. સપાટી ક્ষેત્રફળ = 6 × બાજુ².',
    },
  },
  {
    name: 'Sphere',
    emoji: '🔵',
    color: 0x8b5cf6,
    glowColor: 'rgba(139,92,246,0.4)',
    geometry: () => new THREE.SphereGeometry(1.4, 32, 32),
    formula: {
      en: 'V = 4/3πr³ | SA = 4πr²',
      hi: 'V = 4/3πr³ | SA = 4πr²',
      gu: 'V = 4/3πr³ | SA = 4πr²',
    },
    explanation: {
      en: 'A Sphere is perfectly round — every point on its surface is the same distance (radius) from the centre. Volume = 4/3 × π × r³. Surface Area = 4 × π × r².',
      hi: 'गोला पूरी तरह गोल होता है — इसकी सतह का प्रत्येक बिंदु केंद्र से समान दूरी (त्रिज्या) पर है। आयतन = 4/3 × π × r³।',
      gu: 'ગોળ સંપૂર્ણ ગોળ હોય છે — સપાટી પરનો દરેક બિંदु center थी equal distance (radius) पर छे. Volume = 4/3 × π × r³.',
    },
  },
  {
    name: 'Cone',
    emoji: '🔺',
    color: 0xf59e0b,
    glowColor: 'rgba(245,158,11,0.4)',
    geometry: () => new THREE.ConeGeometry(1.2, 2.8, 32),
    formula: {
      en: 'V = 1/3πr²h | SA = πr(r+l)',
      hi: 'V = 1/3πr²h | SA = πr(r+l)',
      gu: 'V = 1/3πr²h | SA = πr(r+l)',
    },
    explanation: {
      en: 'A Cone has a circular base that tapers to a single apex (point). Volume = 1/3 × π × r² × h. Slant height l = √(r²+h²). Used in ice cream cones and traffic cones!',
      hi: 'शंकु का एक वृत्तीय आधार होता है जो एक शीर्ष बिंदु पर सिकुड़ता है। आयतन = 1/3 × π × r² × h। तिरछी ऊँचाई l = √(r²+h²)।',
      gu: 'Cone ને circular base छे जे एक apex (point) पर tapering छे. Volume = 1/3 × π × r² × h. Slant height l = √(r²+h²).',
    },
  },
  {
    name: 'Torus',
    emoji: '🍩',
    color: 0x10b981,
    glowColor: 'rgba(16,185,129,0.4)',
    geometry: () => new THREE.TorusGeometry(1.2, 0.45, 20, 50),
    formula: {
      en: 'V = 2π²Rr² | SA = 4π²Rr',
      hi: 'V = 2π²Rr² | SA = 4π²Rr',
      gu: 'V = 2π²Rr² | SA = 4π²Rr',
    },
    explanation: {
      en: 'A Torus is a donut-shaped 3D solid. It is formed by revolving a circle around an axis. Volume = 2π²Rr². It has no faces, edges, or vertices — it is a smooth curved surface.',
      hi: 'टोरस एक डोनट के आकार का 3D ठोस है। यह एक अक्ष के चारों ओर एक वृत्त को घुमाने से बनता है। आयतन = 2π²Rr²।',
      gu: 'Torus donut shaped 3D solid छे. एक axis ना ફрото circle ने ઘुमाવ्याथी बने छे. Volume = 2π²Rr².',
    },
  },
];

export const Math3DOverlay: React.FC<Math3DOverlayProps> = ({ language, onSpeak }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [shapeIdx, setShapeIdx] = useState(0);
  const [wireframe, setWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);

  const shapeIdxRef = useRef(shapeIdx);
  const wireframeRef = useRef(wireframe);
  const autoRotateRef = useRef(autoRotate);
  shapeIdxRef.current = shapeIdx;
  wireframeRef.current = wireframe;
  autoRotateRef.current = autoRotate;

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const w = container.clientWidth;
    const h = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x02050a, 0.04);

    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(0, 0, 6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const dir = new THREE.DirectionalLight(0xffffff, 1.0);
    dir.position.set(6, 8, 5);
    scene.add(dir);
    const back = new THREE.DirectionalLight(0x6366f1, 0.5);
    back.position.set(-4, -4, -3);
    scene.add(back);
    const point = new THREE.PointLight(0x0ea5e9, 1.2, 12);
    point.position.set(0, 0, 3);
    scene.add(point);

    // Grid helper (floor)
    const grid = new THREE.GridHelper(10, 20, 0x1e293b, 0x0f172a);
    grid.position.y = -2.5;
    scene.add(grid);

    // Shape group
    const shapeGroup = new THREE.Group();
    scene.add(shapeGroup);

    let shapeMesh: THREE.Mesh | null = null;
    let wireMesh: THREE.Mesh | null = null;
    let currentShapeIdx = -1;
    let currentWireframe = !wireframe; // force initial build

    const buildShape = () => {
      shapeGroup.clear();
      const s = SHAPES[shapeIdxRef.current];

      const geo = s.geometry();

      const mat = new THREE.MeshPhongMaterial({
        color: s.color,
        emissive: s.color,
        emissiveIntensity: 0.1,
        shininess: 80,
        specular: 0xffffff,
        transparent: true,
        opacity: wireframeRef.current ? 0.15 : 0.95,
        wireframe: false,
      });

      shapeMesh = new THREE.Mesh(geo, mat);
      shapeGroup.add(shapeMesh);

      // Wireframe overlay
      const wireMat = new THREE.MeshBasicMaterial({
        color: s.color,
        wireframe: true,
        transparent: true,
        opacity: wireframeRef.current ? 0.9 : 0.15,
      });
      wireMesh = new THREE.Mesh(geo, wireMat);
      shapeGroup.add(wireMesh);

      currentShapeIdx = shapeIdxRef.current;
      currentWireframe = wireframeRef.current;
    };

    buildShape();

    // Drag-to-rotate
    let isDragging = false;
    let prevX = 0, prevY = 0;
    const onMouseDown = (e: MouseEvent) => { isDragging = true; prevX = e.clientX; prevY = e.clientY; };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      shapeGroup.rotation.y += (e.clientX - prevX) * 0.008;
      shapeGroup.rotation.x += (e.clientY - prevY) * 0.008;
      prevX = e.clientX; prevY = e.clientY;
    };
    const onMouseUp = () => { isDragging = false; };
    renderer.domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Animate
    const clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);

      // Rebuild if shape or wireframe changed
      if (currentShapeIdx !== shapeIdxRef.current || currentWireframe !== wireframeRef.current) {
        buildShape();
      }

      if (autoRotateRef.current && !isDragging) {
        const t = clock.getElapsedTime();
        shapeGroup.rotation.y = t * 0.5;
        shapeGroup.rotation.x = Math.sin(t * 0.3) * 0.2;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const onResize = () => {
      if (!mountRef.current) return;
      const nw = mountRef.current.clientWidth;
      const nh = mountRef.current.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const shape = SHAPES[shapeIdx];

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '16px' }}>
      {/* 3D Canvas */}
      <div ref={mountRef} style={{ position: 'absolute', inset: 0, zIndex: 1, cursor: 'grab' }} />

      {/* Top HUD */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '999px', background: 'rgba(14,165,233,0.12)', border: '1px solid rgba(14,165,233,0.3)', color: '#0ea5e9', fontSize: '12px', fontWeight: '700' }}>
          <Box size={14} />
          <span>3D Geometry Lab</span>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => setWireframe(v => !v)}
            style={{
              padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '700', cursor: 'pointer',
              background: wireframe ? 'rgba(99,102,241,0.25)' : 'rgba(7,14,28,0.6)',
              border: wireframe ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.1)',
              color: wireframe ? '#818cf8' : '#8b99b5',
              transition: 'all 0.2s ease',
            }}
          >
            Wireframe
          </button>
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
              background: i === shapeIdx ? `rgba(${parseInt(s.color.toString(16).slice(0,2),16)},${parseInt(s.color.toString(16).slice(2,4),16)},${parseInt(s.color.toString(16).slice(4,6),16)},0.2)` : 'rgba(7,14,28,0.7)',
              border: i === shapeIdx ? `1px solid ${s.glowColor}` : '1px solid rgba(255,255,255,0.1)',
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
