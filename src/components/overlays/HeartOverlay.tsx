import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { Language, PartExplanation } from '../../types';
import { Volume2, Orbit } from 'lucide-react';

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
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedPart, setSelectedPart] = useState<string | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // 1. Setup Scene, Camera & Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0b16, 0.05);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // 2. Add Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight1.position.set(5, 10, 7);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x8b5cf6, 0.5); // Purple backlight
    dirLight2.position.set(-5, -5, -5);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0x06b6d4, 1.2, 10); // Cyan glow
    pointLight.position.set(0, 0, 2);
    scene.add(pointLight);

    // 3. Construct Procedural Heart Mesh Group
    const heartGroup = new THREE.Group();
    scene.add(heartGroup);

    const materialRed = new THREE.MeshPhongMaterial({
      color: 0xef4444,
      emissive: 0x4a0e0e,
      shininess: 100,
      flatShading: false
    });

    const materialRedDark = new THREE.MeshPhongMaterial({
      color: 0xb91c1c,
      emissive: 0x3b0707,
      shininess: 100
    });

    const materialBlue = new THREE.MeshPhongMaterial({
      color: 0x3b82f6,
      emissive: 0x0f172a,
      shininess: 80
    });

    const materialGold = new THREE.MeshPhongMaterial({
      color: 0xf59e0b,
      emissive: 0x451a03,
      shininess: 150
    });

    // 3a. Main Ventricle Body (Tapered sphere)
    const mainBodyGeom = new THREE.SphereGeometry(1.4, 32, 32);
    // Deform sphere to create anatomical heart shape (narrower bottom)
    const pos = mainBodyGeom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let y = pos.getY(i);
      let x = pos.getX(i);
      let z = pos.getZ(i);
      // Taper the bottom
      if (y < 0) {
        let factor = 1 + (y * 0.4);
        pos.setX(i, x * factor);
        pos.setZ(i, z * factor);
      }
      // Elongate slightly down and tilt
      pos.setY(i, y * 1.1 - 0.2);
    }
    mainBodyGeom.computeVertexNormals();
    
    const leftVentricleMesh = new THREE.Mesh(mainBodyGeom, materialRed);
    leftVentricleMesh.name = 'left_ventricle';
    heartGroup.add(leftVentricleMesh);

    // 3b. Right Ventricle Attachment (smaller offset sphere)
    const rightVentricleGeom = new THREE.SphereGeometry(1.1, 32, 32);
    const posR = rightVentricleGeom.attributes.position;
    for (let i = 0; i < posR.count; i++) {
      let y = posR.getY(i);
      let x = posR.getX(i);
      let z = posR.getZ(i);
      if (y < 0) {
        let factor = 1 + (y * 0.3);
        posR.setX(i, x * factor);
        posR.setZ(i, z * factor);
      }
    }
    rightVentricleGeom.computeVertexNormals();
    const rightVentricleMesh = new THREE.Mesh(rightVentricleGeom, materialRedDark);
    rightVentricleMesh.name = 'right_ventricle';
    rightVentricleMesh.position.set(-0.7, 0.2, 0.3);
    heartGroup.add(rightVentricleMesh);

    // 3c. Aorta (Gold curved tube arching from top)
    const aortaPath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.2, 1.0, 0),
      new THREE.Vector3(0.4, 2.0, 0.2),
      new THREE.Vector3(0.0, 2.6, 0.4),
      new THREE.Vector3(-0.8, 2.3, 0.2),
      new THREE.Vector3(-1.0, 1.2, -0.2),
    ]);
    const aortaGeom = new THREE.TubeGeometry(aortaPath, 32, 0.35, 16, false);
    const aortaMesh = new THREE.Mesh(aortaGeom, materialGold);
    aortaMesh.name = 'aorta';
    heartGroup.add(aortaMesh);

    // 3d. Vena Cava (Blue tubes entering right side)
    const venaCavaUpperPath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.0, 0.5, 0.5),
      new THREE.Vector3(-1.2, 1.8, 0.4),
    ]);
    const venaCavaUpperGeom = new THREE.TubeGeometry(venaCavaUpperPath, 16, 0.25, 8, false);
    const venaCavaUpperMesh = new THREE.Mesh(venaCavaUpperGeom, materialBlue);
    venaCavaUpperMesh.name = 'right_ventricle'; // Treat VC clicks as RV area
    heartGroup.add(venaCavaUpperMesh);

    const venaCavaLowerPath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.0, -0.5, 0.5),
      new THREE.Vector3(-1.2, -1.8, 0.4),
    ]);
    const venaCavaLowerGeom = new THREE.TubeGeometry(venaCavaLowerPath, 16, 0.25, 8, false);
    const venaCavaLowerMesh = new THREE.Mesh(venaCavaLowerGeom, materialBlue);
    venaCavaLowerMesh.name = 'right_ventricle';
    heartGroup.add(venaCavaLowerMesh);

    // 3e. Pulmonary Valve (Glowing cylinder valve ring)
    const valveGeom = new THREE.CylinderGeometry(0.3, 0.3, 0.3, 16);
    const valveMesh = new THREE.Mesh(valveGeom, materialBlue);
    valveMesh.name = 'pulmonary_valve';
    valveMesh.position.set(-0.3, 1.3, 0.6);
    valveMesh.rotation.z = 0.5;
    heartGroup.add(valveMesh);

    // 4. Double Pulse Beating Animation Loop
    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);

      // Rotate model slightly
      heartGroup.rotation.y = Math.sin(clock.getElapsedTime() * 0.1) * 0.4;
      heartGroup.rotation.x = Math.sin(clock.getElapsedTime() * 0.05) * 0.2;

      // Realistic biological "lub-dub" double pulse scaling
      const time = clock.getElapsedTime() * 1.3; // Speed modifier
      const phase = time % 1.0;
      let scale = 1.0;

      if (phase < 0.15) {
        // First quick beat (Atria contracting - lub)
        const subPhase = phase / 0.15;
        scale = 1.0 + Math.sin(subPhase * Math.PI) * 0.07;
      } else if (phase >= 0.2 && phase < 0.45) {
        // Second stronger beat (Ventricles contracting - dub)
        const subPhase = (phase - 0.2) / 0.25;
        scale = 1.0 + Math.sin(subPhase * Math.PI) * 0.14;
      }

      heartGroup.scale.set(scale, scale, scale);

      renderer.render(scene, camera);
    };

    animate();

    // 5. Click/Raycast Handling
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const handlePointerDown = (event: PointerEvent) => {
      // Get click coords relative to canvas
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(heartGroup.children);

      if (intersects.length > 0) {
        const hitMesh = intersects[0].object;
        const name = hitMesh.name;
        if (name && explanations[name]) {
          selectPart(name);
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);

    // 6. Handle Resizing
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (renderer && renderer.domElement && mountRef.current) {
        renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

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
      {/* 3D Canvas Mounting Area */}
      <div ref={mountRef} style={{
        position: 'absolute',
        inset: 0,
        zIndex: 1,
        cursor: 'grab'
      }} />

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
        <span>Tap 3D parts to learn</span>
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
            👆 Click on any heart label or 3D section to learn its role in Indian languages!
          </div>
        )}
      </div>
    </div>
  );
};
