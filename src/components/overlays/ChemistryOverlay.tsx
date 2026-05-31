import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { Language } from '../../types';
import { Volume2, Atom } from 'lucide-react';

interface ChemistryOverlayProps {
  language: Language;
  onSpeak: (text: string) => void;
}

interface Molecule {
  name: string;
  formula: string;
  atoms: { pos: [number, number, number]; color: number; radius: number; label: string; element: string }[];
  bonds: [number, number][];
  explanation: Record<Language, string>;
}

const MOLECULES: Molecule[] = [
  {
    name: 'Water (H₂O)',
    formula: 'H₂O',
    atoms: [
      { pos: [0, 0, 0],    color: 0xef4444, radius: 0.55, label: 'O', element: 'Oxygen' },
      { pos: [-1.2, -0.8, 0], color: 0xe2e8f0, radius: 0.35, label: 'H', element: 'Hydrogen' },
      { pos: [1.2, -0.8, 0],  color: 0xe2e8f0, radius: 0.35, label: 'H', element: 'Hydrogen' },
    ],
    bonds: [[0, 1], [0, 2]],
    explanation: {
      en: 'Water (H₂O) is a bent molecule. One oxygen atom bonds with two hydrogen atoms via covalent bonds, creating a 104.5° angle. This gives water its polarity and special properties.',
      hi: 'पानी (H₂O) एक मुड़ा हुआ अणु है। एक ऑक्सीजन परमाणु दो हाइड्रोजन परमाणुओं से सहसंयोजी बंधों के माध्यम से जुड़ता है, जिससे 104.5° का कोण बनता है।',
      gu: 'પાણી (H₂O) એ વળાંકવાળો અણુ છે. એક ઓક્સિજન પરમાણુ સહ-સંयोजी બંધ દ્વારા બે હાઇડ્રોજન પરમાણુ સાથે જોડાય છે, જેનાથી 104.5°નો ખૂણો બને છે.',
    }
  },
  {
    name: 'Methane (CH₄)',
    formula: 'CH₄',
    atoms: [
      { pos: [0, 0, 0],       color: 0x14b8a6, radius: 0.55, label: 'C', element: 'Carbon' },
      { pos: [1.1, 1.1, 1.1], color: 0xe2e8f0, radius: 0.35, label: 'H', element: 'Hydrogen' },
      { pos: [-1.1, -1.1, 1.1],color: 0xe2e8f0, radius: 0.35, label: 'H', element: 'Hydrogen' },
      { pos: [-1.1, 1.1, -1.1],color: 0xe2e8f0, radius: 0.35, label: 'H', element: 'Hydrogen' },
      { pos: [1.1, -1.1, -1.1],color: 0xe2e8f0, radius: 0.35, label: 'H', element: 'Hydrogen' },
    ],
    bonds: [[0,1],[0,2],[0,3],[0,4]],
    explanation: {
      en: 'Methane (CH₄) is the simplest hydrocarbon. One carbon atom forms 4 equal covalent bonds with 4 hydrogen atoms in a perfect tetrahedral shape — 109.5° bond angles.',
      hi: 'मीथेन (CH₄) सबसे सरल हाइड्रोकार्बन है। एक कार्बन परमाणु 4 हाइड्रोजन परमाणुओं के साथ 4 समान सहसंयोजी बंध बनाता है — 109.5° के बंध कोण के साथ।',
      gu: 'મિથેન (CH₄) સૌથી સરળ હાઇડ્રોકાર્બન છે. એક કાર્બન પરમાણુ 4 હાઇડ્રોજન પરમાણુ સાથે 4 સહ-સંyogenic bond બનાવે છે — 109.5° ના ખૂણા સાથે.',
    }
  },
  {
    name: 'CO₂',
    formula: 'CO₂',
    atoms: [
      { pos: [0, 0, 0],   color: 0x14b8a6, radius: 0.55, label: 'C', element: 'Carbon' },
      { pos: [-1.5, 0, 0],color: 0xef4444, radius: 0.50, label: 'O', element: 'Oxygen' },
      { pos: [1.5, 0, 0], color: 0xef4444, radius: 0.50, label: 'O', element: 'Oxygen' },
    ],
    bonds: [[0,1],[0,2]],
    explanation: {
      en: 'Carbon Dioxide (CO₂) is a linear molecule. Carbon forms two double bonds with oxygen atoms. It is the primary greenhouse gas and is absorbed by plants in photosynthesis.',
      hi: 'कार्बन डाइऑक्साइड (CO₂) एक रैखिक अणु है। कार्बन ऑक्सीजन के साथ दो दोहरे बंध बनाता है। यह प्राथमिक ग्रीनहाउस गैस है और पौधे प्रकाश संश्लेषण में इसे अवशोषित करते हैं।',
      gu: 'કાર્બન ડાઈઓક્સાઈડ (CO₂) એ રેખીય અણુ છે. કાર્બન ઓક્સિજન સાથે બે ડ્બ્ल bond બનાવે છે. તે મુખ્ય ગ્રીનહાઉસ ગ્ૅस છે અને છોડ પ્રકાશ-સ્ंthesiss, is it absorbed by plants.',
    }
  },
];

export const ChemistryOverlay: React.FC<ChemistryOverlayProps> = ({ language, onSpeak }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [molIndex, setMolIndex] = useState(0);
  const [selectedEl, setSelectedEl] = useState<string | null>(null);
  const molIndexRef = useRef(0);
  molIndexRef.current = molIndex;
  const languageRef = useRef(language);
  languageRef.current = language;

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const w = container.clientWidth;
    const h = container.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x02050a, 0.04);

    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(0, 0, 7);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight.position.set(5, 8, 6);
    scene.add(dirLight);
    const backLight = new THREE.DirectionalLight(0x14b8a6, 0.6);
    backLight.position.set(-5, -5, -3);
    scene.add(backLight);
    const pointLight = new THREE.PointLight(0x6366f1, 1.2, 15);
    pointLight.position.set(0, 2, 3);
    scene.add(pointLight);

    // Molecule group — rebuilt each time molIndex changes via a ref flag
    let molGroup = new THREE.Group();
    scene.add(molGroup);
    let atomMeshes: THREE.Mesh[] = [];

    const buildMolecule = () => {
      // Clear old
      molGroup.clear();
      atomMeshes = [];

      const mol = MOLECULES[molIndexRef.current];

      // Atoms
      mol.atoms.forEach(atom => {
        const geo = new THREE.SphereGeometry(atom.radius, 32, 32);
        const mat = new THREE.MeshPhongMaterial({
          color: atom.color,
          emissive: atom.color,
          emissiveIntensity: 0.15,
          shininess: 120,
          specular: 0xffffff,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(...atom.pos);
        mesh.name = atom.element;
        molGroup.add(mesh);
        atomMeshes.push(mesh);
      });

      // Bonds (cylinders between atoms)
      mol.bonds.forEach(([a, b]) => {
        const posA = new THREE.Vector3(...mol.atoms[a].pos);
        const posB = new THREE.Vector3(...mol.atoms[b].pos);
        const mid  = posA.clone().add(posB).multiplyScalar(0.5);
        const dist = posA.distanceTo(posB);
        const dir  = posB.clone().sub(posA).normalize();

        const bondGeo = new THREE.CylinderGeometry(0.09, 0.09, dist, 12);
        const bondMat = new THREE.MeshPhongMaterial({
          color: 0x94a3b8,
          shininess: 60,
          transparent: true,
          opacity: 0.75,
        });
        const bond = new THREE.Mesh(bondGeo, bondMat);
        bond.position.copy(mid);
        bond.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
        molGroup.add(bond);
      });
    };

    buildMolecule();

    // Continuous animation + rebuild when molecule changes
    const clock = new THREE.Clock();
    let currentMolIdx = 0;

    const animate = () => {
      requestAnimationFrame(animate);

      // Rebuild if molecule changed
      if (currentMolIdx !== molIndexRef.current) {
        currentMolIdx = molIndexRef.current;
        buildMolecule();
      }

      const t = clock.getElapsedTime();
      molGroup.rotation.y = t * 0.4;
      molGroup.rotation.x = Math.sin(t * 0.2) * 0.18;

      renderer.render(scene, camera);
    };
    animate();

    // Click raycasting
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const onPointerDown = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(atomMeshes);
      if (hits.length > 0) {
        const name = hits[0].object.name;
        setSelectedEl(name);
        onSpeak(`${name} atom. ${MOLECULES[molIndexRef.current].explanation[languageRef.current]}`);
      }
    };
    renderer.domElement.addEventListener('pointerdown', onPointerDown);

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
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []); // single mount — updates driven by refs

  const mol = MOLECULES[molIndex];

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '16px' }}>
      {/* 3D Canvas */}
      <div ref={mountRef} style={{ position: 'absolute', inset: 0, zIndex: 1, cursor: 'grab' }} />

      {/* Top HUD */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '999px', background: 'rgba(20,184,166,0.12)', border: '1px solid rgba(20,184,166,0.25)', color: '#14b8a6', fontSize: '12px', fontWeight: '700' }}>
          <Atom size={14} />
          <span>3D Molecular Model</span>
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
        {mol.atoms.filter((a, i, arr) => arr.findIndex(b => b.element === a.element) === i).map((atom) => (
          <div key={atom.element} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: `#${atom.color.toString(16).padStart(6, '0')}` }} />
            <span style={{ fontSize: '10px', color: '#8b99b5', fontWeight: '600' }}>{atom.element} ({atom.label})</span>
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
