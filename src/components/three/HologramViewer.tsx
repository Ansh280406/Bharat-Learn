import React, { Suspense, useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Float, useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';

// ─── Types ───────────────────────────────────────────────────────────
interface HologramViewerProps {
  modelUrl: string;
  scale?: number;
  positionY?: number;
  rotation?: [number, number, number];
  hologramColor?: string;
  autoRotate?: boolean;
  rotateSpeed?: number;
  enableOrbitControls?: boolean;
  onPartClick?: (partName: string) => void;
  loadingLabel?: string;
  /** If true, uses a procedural fallback instead of a GLB */
  useFallback?: boolean;
  /** Which procedural shape to render when useFallback is true */
  proceduralShape?: 'cube' | 'sphere' | 'cone' | 'torus' | 'icosahedron';
  /** Optional children to render inside the Canvas */
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

// ─── Hologram Base Plate (floor ring) ────────────────────────────────
function HologramBasePlate({ color }: { color: string }) {
  const ringRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    if (ringRef.current) {
      ringRef.current.rotation.z = clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <group position={[0, -2.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      {/* Outer ring */}
      <mesh ref={ringRef}>
        <ringGeometry args={[2.0, 2.15, 64]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Inner glow disc */}
      <mesh position={[0, 0, -0.01]}>
        <circleGeometry args={[2.0, 64]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.06}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Grid lines */}
      <gridHelper
        args={[4, 16, color, color]}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 0, 0.01]}
        material-transparent
        material-opacity={0.08}
      />
    </group>
  );
}

// ─── Floating Particles ──────────────────────────────────────────────
function HologramParticles({ color, count = 40 }: { color: string; count?: number }) {
  const particlesRef = useRef<THREE.Points>(null!);

  const [positions, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 5;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 5;
      sz[i] = Math.random() * 3 + 1;
    }
    return [pos, sz];
  }, [count]);

  useFrame(({ clock }) => {
    if (particlesRef.current) {
      const t = clock.getElapsedTime();
      const posArr = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        posArr[i * 3 + 1] += Math.sin(t + i) * 0.002;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[sizes, 1]}
        />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={0.04}
        transparent
        opacity={0.5}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// ─── GLB Model Loader ────────────────────────────────────────────────
function GLBModel({
  url,
  scale,
  positionY,
  rotation,
  hologramColor,
  autoRotate,
  rotateSpeed,
  onPartClick,
  onError,
}: {
  url: string;
  scale: number;
  positionY: number;
  rotation?: [number, number, number];
  hologramColor: string;
  autoRotate: boolean;
  rotateSpeed: number;
  onPartClick?: (partName: string) => void;
  onError: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const { scene } = useGLTF(url, true, undefined, (e) => {
    console.warn('GLTF load error:', e);
    onError();
  });

  // Clone scene so multiple instances don't conflict
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);

    // Center geometry automatically using bounding box
    const box = new THREE.Box3().setFromObject(clone);
    const center = new THREE.Vector3();
    box.getCenter(center);
    clone.position.sub(center);

    // Apply holographic material to all meshes
    const hColor = new THREE.Color(hologramColor);
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.material = new THREE.MeshPhongMaterial({
          color: hColor,
          emissive: hColor,
          emissiveIntensity: 0.35,
          transparent: true,
          opacity: 0.75,
          side: THREE.DoubleSide,
          depthWrite: false,
          shininess: 120,
          specular: new THREE.Color('#ffffff'),
        });
      }
    });

    return clone;
  }, [scene, hologramColor]);

  useFrame(({ clock }) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y = clock.getElapsedTime() * rotateSpeed;
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (onPartClick && e.object?.name) {
      onPartClick(e.object.name);
    }
  };

  return (
    <group ref={groupRef} position={[0, positionY, 0]} scale={scale} rotation={rotation || [0, 0, 0]}>
      <primitive object={clonedScene} onClick={handleClick} />
    </group>
  );
}

// ─── Procedural Fallback (animated holographic shape) ─────────────────
function ProceduralFallback({
  shape = 'icosahedron',
  hologramColor,
  autoRotate,
  rotateSpeed,
}: {
  shape?: 'cube' | 'sphere' | 'cone' | 'torus' | 'icosahedron';
  hologramColor: string;
  autoRotate: boolean;
  rotateSpeed: number;
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const hColor = new THREE.Color(hologramColor);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const t = clock.getElapsedTime();
      if (autoRotate) {
        groupRef.current.rotation.y = t * rotateSpeed;
      }
      groupRef.current.rotation.x = Math.sin(t * 0.3) * 0.15;
      // Pulse
      const pulse = 1 + Math.sin(t * 2) * 0.04;
      groupRef.current.scale.setScalar(pulse);
    }
  });

  const renderGeometry = () => {
    switch (shape) {
      case 'cube':
        return <boxGeometry args={[1.6, 1.6, 1.6]} />;
      case 'sphere':
        return <sphereGeometry args={[1.1, 32, 32]} />;
      case 'cone':
        return <coneGeometry args={[1.0, 1.9, 32]} />;
      case 'torus':
        return <torusGeometry args={[0.8, 0.3, 16, 100]} />;
      case 'icosahedron':
      default:
        return <icosahedronGeometry args={[1.5, 1]} />;
    }
  };

  const renderWireframeGeometry = () => {
    switch (shape) {
      case 'cube':
        return <boxGeometry args={[1.64, 1.64, 1.64]} />;
      case 'sphere':
        return <sphereGeometry args={[1.14, 16, 16]} />;
      case 'cone':
        return <coneGeometry args={[1.04, 1.94, 16]} />;
      case 'torus':
        return <torusGeometry args={[0.82, 0.32, 8, 40]} />;
      case 'icosahedron':
      default:
        return <icosahedronGeometry args={[1.54, 1]} />;
    }
  };

  return (
    <group ref={groupRef}>
      {/* Main shape */}
      <mesh>
        {renderGeometry()}
        <meshPhongMaterial
          color={hColor}
          emissive={hColor}
          emissiveIntensity={0.3}
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
          depthWrite={false}
          shininess={100}
        />
      </mesh>
      {/* Wireframe overlay */}
      <mesh>
        {renderWireframeGeometry()}
        <meshBasicMaterial
          color={hColor}
          wireframe
          transparent
          opacity={0.2}
          depthWrite={false}
        />
      </mesh>
      {/* Inner glow */}
      {shape !== 'torus' && (
        <mesh>
          <sphereGeometry args={[shape === 'cube' ? 0.7 : 0.6, 16, 16]} />
          <meshBasicMaterial
            color={hColor}
            transparent
            opacity={0.15}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}

// ─── Loading Spinner ─────────────────────────────────────────────────
function LoadingSpinner({ label, color }: { label: string; color: string }) {
  return (
    <Html center>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        pointerEvents: 'none',
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: `3px solid ${color}33`,
          borderTop: `3px solid ${color}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <span style={{
          color: color,
          fontSize: '12px',
          fontWeight: 700,
          letterSpacing: '0.05em',
          textAlign: 'center',
          whiteSpace: 'nowrap',
        }}>
          {label}
        </span>
      </div>
    </Html>
  );
}

// ─── Scene Content ───────────────────────────────────────────────────
function SceneContent({
  modelUrl,
  scale,
  positionY,
  rotation,
  hologramColor,
  autoRotate,
  rotateSpeed,
  enableOrbitControls,
  onPartClick,
  loadingLabel,
  useFallback,
  proceduralShape,
}: Omit<HologramViewerProps, 'style' | 'children'> & {
  modelUrl: string;
  useFallback: boolean;
}) {
  const [loadError, setLoadError] = useState(false);
  const showFallback = useFallback || loadError;

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 8, 5]} intensity={0.6} color="#ffffff" />
      <directionalLight position={[-4, -4, -3]} intensity={0.4} color={hologramColor} />
      <pointLight position={[0, 0, 3]} intensity={1.0} color={hologramColor} distance={12} />

      {/* Fog */}
      <fog attach="fog" args={['#020509', 8, 20]} />

      {/* Hologram Base */}
      <HologramBasePlate color={hologramColor || '#10b981'} />

      {/* Particles */}
      <HologramParticles color={hologramColor || '#10b981'} />

      {/* Orbit Controls */}
      {enableOrbitControls && (
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={3}
          maxDistance={10}
          autoRotate={false}
          maxPolarAngle={Math.PI * 0.75}
          minPolarAngle={Math.PI * 0.25}
        />
      )}

      {/* 3D Model */}
      <Float
        speed={2}
        rotationIntensity={0.1}
        floatIntensity={0.5}
        floatingRange={[-0.1, 0.1]}
      >
        <Suspense
          fallback={
            <LoadingSpinner
              label={loadingLabel || 'Loading 3D Model...'}
              color={hologramColor || '#10b981'}
            />
          }
        >
          {showFallback ? (
            <ProceduralFallback
              shape={proceduralShape}
              hologramColor={hologramColor || '#10b981'}
              autoRotate={autoRotate ?? true}
              rotateSpeed={rotateSpeed ?? 0.5}
            />
          ) : (
            <GLBModel
              url={modelUrl}
              scale={scale ?? 1}
              positionY={positionY ?? 0}
              rotation={rotation}
              hologramColor={hologramColor || '#10b981'}
              autoRotate={autoRotate ?? true}
              rotateSpeed={rotateSpeed ?? 0.5}
              onPartClick={onPartClick}
              onError={() => setLoadError(true)}
            />
          )}
        </Suspense>
      </Float>
    </>
  );
}

// ─── Main Component ──────────────────────────────────────────────────
export const HologramViewer: React.FC<HologramViewerProps> = ({
  modelUrl,
  scale = 1,
  positionY = 0,
  rotation,
  hologramColor = '#10b981',
  autoRotate = true,
  rotateSpeed = 0.5,
  enableOrbitControls = true,
  onPartClick,
  loadingLabel = 'Loading 3D Model...',
  useFallback = false,
  proceduralShape = 'icosahedron',
  children,
  style,
}) => {
  const [hasError, setHasError] = useState(false);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 1,
        ...style,
      }}
    >
      <Canvas
        camera={{ position: [0, 1, 6], fov: 45 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        style={{ background: 'transparent' }}
        onError={() => setHasError(true)}
      >
        <SceneContent
          modelUrl={modelUrl}
          scale={scale}
          positionY={positionY}
          rotation={rotation}
          hologramColor={hologramColor}
          autoRotate={autoRotate}
          rotateSpeed={rotateSpeed}
          enableOrbitControls={enableOrbitControls}
          onPartClick={onPartClick}
          loadingLabel={loadingLabel}
          useFallback={useFallback || hasError}
          proceduralShape={proceduralShape}
        />
      </Canvas>
      {children}
    </div>
  );
};

export default HologramViewer;
