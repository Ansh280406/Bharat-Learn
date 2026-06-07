import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ─── Simplex-style Noise (lightweight, no dependencies) ──────────────
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 43758.5453123;
  return x - Math.floor(x);
}

function noise2D(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const a = seededRandom(ix + iy * 57);
  const b = seededRandom(ix + 1 + iy * 57);
  const c = seededRandom(ix + (iy + 1) * 57);
  const d = seededRandom(ix + 1 + (iy + 1) * 57);
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

function fbm(x: number, y: number, octaves = 4): number {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;
  for (let i = 0; i < octaves; i++) {
    value += amplitude * noise2D(x * frequency, y * frequency);
    amplitude *= 0.5;
    frequency *= 2;
  }
  return value;
}

// ─── Terrain Mesh ───────────────────────────────────────────────────
// Noise-displaced PlaneGeometry for rugged mountain peaks
interface TerrainMeshProps {
  width?: number;
  depth?: number;
  segments?: number;
  heightScale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
  snowColor?: string;
  snowThreshold?: number;
}

export function TerrainMesh({
  width = 10,
  depth = 10,
  segments = 64,
  heightScale = 2.5,
  position = [0, -2, 0],
  rotation = [-Math.PI / 2, 0, 0],
  color = '#2d1f0e',
  snowColor = '#e8e8e8',
  snowThreshold = 0.65,
}: TerrainMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null!);

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(width, depth, segments, segments);
    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const baseColor = new THREE.Color(color);
    const snowCol = new THREE.Color(snowColor);
    const grassColor = new THREE.Color('#1a3a1a');

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const height = fbm(x * 0.4 + 5, y * 0.4 + 5, 5) * heightScale;
      pos.setZ(i, height);

      // Vertex coloring: snow on peaks, grass on mid, rock on low
      const normalizedHeight = height / heightScale;
      const c = new THREE.Color();
      if (normalizedHeight > snowThreshold) {
        c.lerpColors(baseColor, snowCol, (normalizedHeight - snowThreshold) / (1 - snowThreshold));
      } else if (normalizedHeight > 0.3) {
        c.lerpColors(grassColor, baseColor, (normalizedHeight - 0.3) / (snowThreshold - 0.3));
      } else {
        c.copy(grassColor);
      }
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return geo;
  }, [width, depth, segments, heightScale, color, snowColor, snowThreshold]);

  return (
    <mesh ref={meshRef} geometry={geometry} position={position} rotation={rotation}
      castShadow receiveShadow>
      <meshStandardMaterial
        vertexColors
        roughness={0.88}
        metalness={0}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ─── Water Body ─────────────────────────────────────────────────────
// Animated rippling water surface with PBR transparency
interface WaterBodyProps {
  width?: number;
  depth?: number;
  segments?: number;
  position?: [number, number, number];
  color?: string;
  opacity?: number;
  waveSpeed?: number;
  waveHeight?: number;
}

export function WaterBody({
  width = 10,
  depth = 5,
  segments = 48,
  position = [0, -1.8, 0],
  color = '#0891b2',
  opacity = 0.72,
  waveSpeed = 1.2,
  waveHeight = 0.08,
}: WaterBodyProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const geoRef = useRef<THREE.PlaneGeometry>(null!);

  const basePositions = useMemo(() => {
    const geo = new THREE.PlaneGeometry(width, depth, segments, segments);
    return geo.attributes.position.array.slice();
  }, [width, depth, segments]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const geo = meshRef.current.geometry as THREE.PlaneGeometry;
    const pos = geo.attributes.position;
    const t = clock.getElapsedTime() * waveSpeed;

    for (let i = 0; i < pos.count; i++) {
      const x = basePositions[i * 3];
      const y = basePositions[i * 3 + 1];
      const wave = Math.sin(x * 2.5 + t) * Math.cos(y * 3.0 + t * 0.7) * waveHeight
        + Math.sin(x * 5 + t * 1.5) * waveHeight * 0.3;
      pos.setZ(i, wave);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
  });

  return (
    <mesh ref={meshRef} position={position} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry ref={geoRef} args={[width, depth, segments, segments]} />
      <meshPhysicalMaterial
        color={color}
        roughness={0.08}
        metalness={0.1}
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
        envMapIntensity={1.0}
      />
    </mesh>
  );
}

// ─── Volumetric Cloud ───────────────────────────────────────────────
// Multiple overlapping spheres for organic puffy clouds
interface VolumetricCloudProps {
  position?: [number, number, number];
  scale?: number;
  color?: string;
  opacity?: number;
  puffCount?: number;
}

export function VolumetricCloud({
  position = [0, 3, 0],
  scale = 1,
  color = '#ffffff',
  opacity = 0.65,
  puffCount = 7,
}: VolumetricCloudProps) {
  const groupRef = useRef<THREE.Group>(null!);

  const puffs = useMemo(() => {
    const result: { pos: [number, number, number]; s: number }[] = [];
    for (let i = 0; i < puffCount; i++) {
      result.push({
        pos: [
          (Math.random() - 0.5) * 2.0,
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.8,
        ],
        s: 0.4 + Math.random() * 0.6,
      });
    }
    return result;
  }, [puffCount]);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.position.x = position[0] + Math.sin(clock.getElapsedTime() * 0.15) * 0.3;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {puffs.map((puff, i) => (
        <mesh key={i} position={puff.pos} castShadow>
          <icosahedronGeometry args={[puff.s, 3]} />
          <meshStandardMaterial
            color={color}
            roughness={1}
            metalness={0}
            transparent
            opacity={opacity}
            emissive={color}
            emissiveIntensity={0.15}
          />
        </mesh>
      ))}
    </group>
  );
}

// ─── Rain Particle System ───────────────────────────────────────────
// Falling semi-transparent rain drops using THREE.Points
interface RainParticleSystemProps {
  count?: number;
  area?: [number, number, number]; // spread x, y, z
  position?: [number, number, number];
  color?: string;
  speed?: number;
}

export function RainParticleSystem({
  count = 200,
  area = [6, 4, 4],
  position = [0, 3, 0],
  color = '#7dd3fc',
  speed = 4,
}: RainParticleSystemProps) {
  const pointsRef = useRef<THREE.Points>(null!);

  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * area[0];
      pos[i * 3 + 1] = Math.random() * area[1];
      pos[i * 3 + 2] = (Math.random() - 0.5) * area[2];
      vel[i] = speed + Math.random() * speed * 0.5;
    }
    return [pos, vel];
  }, [count, area, speed]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] -= velocities[i] * delta;
      pos[i * 3] -= delta * 0.3; // slight wind
      if (pos[i * 3 + 1] < -area[1] * 0.5) {
        pos[i * 3 + 1] = area[1] * 0.5 + Math.random() * 0.5;
        pos[i * 3] = (Math.random() - 0.5) * area[0];
        pos[i * 3 + 2] = (Math.random() - 0.5) * area[2];
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} position={position}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={0.04}
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// ─── Evaporation Particles ──────────────────────────────────────────
// Rising vapor with fade-out effect
interface EvaporationParticlesProps {
  count?: number;
  position?: [number, number, number];
  color?: string;
  area?: [number, number];
  speed?: number;
}

export function EvaporationParticles({
  count = 60,
  position = [0, -1.5, 0],
  color = '#fbbf24',
  area = [3, 1],
  speed = 0.6,
}: EvaporationParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null!);
  const opacitiesRef = useRef<Float32Array>(new Float32Array(count));

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * area[0];
      pos[i * 3 + 1] = Math.random() * 3;
      pos[i * 3 + 2] = (Math.random() - 0.5) * area[1];
      opacitiesRef.current[i] = Math.random();
    }
    return pos;
  }, [count, area]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += speed * delta;
      pos[i * 3] += Math.sin(pos[i * 3 + 1] * 2 + i) * delta * 0.15;
      if (pos[i * 3 + 1] > 4) {
        pos[i * 3 + 1] = 0;
        pos[i * 3] = (Math.random() - 0.5) * area[0];
        pos[i * 3 + 2] = (Math.random() - 0.5) * area[1];
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} position={position}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={0.06}
        transparent
        opacity={0.45}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// ─── Emissive Sun ───────────────────────────────────────────────────
// Glowing sphere with high emissive intensity
interface EmissiveSunProps {
  position?: [number, number, number];
  radius?: number;
  color?: string;
  intensity?: number;
}

export function EmissiveSun({
  position = [4, 4, -3],
  radius = 0.6,
  color = '#fbbf24',
  intensity = 3.0,
}: EmissiveSunProps) {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const pulse = 1 + Math.sin(clock.getElapsedTime() * 1.5) * 0.05;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group position={position}>
      {/* Core sun sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={intensity}
          roughness={0.1}
          metalness={0}
        />
      </mesh>
      {/* Outer glow */}
      <mesh>
        <sphereGeometry args={[radius * 1.8, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.12}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {/* Point light from sun */}
      <pointLight color={color} intensity={2} distance={15} decay={2} />
    </group>
  );
}

// ─── River Mesh ─────────────────────────────────────────────────────
// A flowing river that follows a path down terrain
interface RiverMeshProps {
  points?: THREE.Vector3[];
  width?: number;
  color?: string;
}

export function RiverMesh({
  points,
  width = 0.3,
  color = '#06b6d4',
}: RiverMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null!);

  const defaultPoints = useMemo(() =>
    points || [
      new THREE.Vector3(-1, 1.5, 0.5),
      new THREE.Vector3(-0.5, 0.5, 0.3),
      new THREE.Vector3(0.2, -0.2, 0),
      new THREE.Vector3(1, -1, -0.2),
      new THREE.Vector3(2.5, -1.5, -0.5),
    ], [points]);

  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(defaultPoints);
    return new THREE.TubeGeometry(curve, 32, width, 8, false);
  }, [defaultPoints, width]);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.MeshPhysicalMaterial;
      mat.emissiveIntensity = 0.3 + Math.sin(clock.getElapsedTime() * 2) * 0.15;
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry} receiveShadow>
      <meshPhysicalMaterial
        color={color}
        roughness={0.1}
        metalness={0.05}
        transparent
        opacity={0.75}
        emissive={color}
        emissiveIntensity={0.3}
      />
    </mesh>
  );
}

// ─── Prism Mesh ─────────────────────────────────────────────────────
// Glass-like triangular prism using MeshPhysicalMaterial
interface PrismMeshProps {
  position?: [number, number, number];
  scale?: number;
  rotation?: [number, number, number];
}

export function PrismMesh({
  position = [0, 0, 0],
  scale = 1,
  rotation = [0, 0, 0],
}: PrismMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null!);

  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    const size = 1.2;
    shape.moveTo(0, size);
    shape.lineTo(-size * 0.866, -size * 0.5);
    shape.lineTo(size * 0.866, -size * 0.5);
    shape.closePath();
    const extrudeSettings = { depth: 0.8, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 3 };
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, []);

  return (
    <mesh ref={meshRef} geometry={geometry} position={position} scale={scale} rotation={rotation}
      castShadow receiveShadow>
      <meshPhysicalMaterial
        color="#e0e7ff"
        roughness={0.02}
        metalness={0.0}
        transmission={0.85}
        transparent
        opacity={0.6}
        ior={2.4}
        thickness={1.5}
        envMapIntensity={1}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ─── Light Beam ─────────────────────────────────────────────────────
// Tube geometry beam for visible light rays
interface LightBeamProps {
  start: [number, number, number];
  end: [number, number, number];
  color?: string;
  radius?: number;
  opacity?: number;
}

export function LightBeam({
  start,
  end,
  color = '#ffffff',
  radius = 0.03,
  opacity = 0.85,
}: LightBeamProps) {
  const geometry = useMemo(() => {
    const curve = new THREE.LineCurve3(
      new THREE.Vector3(...start),
      new THREE.Vector3(...end)
    );
    return new THREE.TubeGeometry(curve, 8, radius, 8, false);
  }, [start, end, radius]);

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={2.5}
        transparent
        opacity={opacity}
        roughness={0.1}
        metalness={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// ─── Molecule Builder Atoms ─────────────────────────────────────────
// Sphere atom with PBR material
interface AtomSphereProps {
  position: [number, number, number];
  radius: number;
  color: string;
  emissiveIntensity?: number;
  onClick?: () => void;
}

export function AtomSphere({
  position,
  radius,
  color,
  emissiveIntensity = 0.3,
  onClick,
}: AtomSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null!);

  return (
    <mesh ref={meshRef} position={position} castShadow onClick={onClick}>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshStandardMaterial
        color={color}
        roughness={0.28}
        metalness={0.15}
        emissive={color}
        emissiveIntensity={emissiveIntensity}
      />
    </mesh>
  );
}

// ─── Bond Cylinder ──────────────────────────────────────────────────
// Cylinder connecting two atom positions
interface BondCylinderProps {
  start: [number, number, number];
  end: [number, number, number];
  radius?: number;
  color?: string;
}

export function BondCylinder({
  start,
  end,
  radius = 0.06,
  color = '#94a3b8',
}: BondCylinderProps) {
  const meshRef = useRef<THREE.Mesh>(null!);

  const { position, quaternion, length } = useMemo(() => {
    const s = new THREE.Vector3(...start);
    const e = new THREE.Vector3(...end);
    const mid = new THREE.Vector3().addVectors(s, e).multiplyScalar(0.5);
    const dir = new THREE.Vector3().subVectors(e, s);
    const len = dir.length();
    dir.normalize();
    const quat = new THREE.Quaternion();
    quat.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    return { position: mid, quaternion: quat, length: len };
  }, [start, end]);

  return (
    <mesh ref={meshRef} position={position} quaternion={quaternion}>
      <cylinderGeometry args={[radius, radius, length, 12]} />
      <meshStandardMaterial
        color={color}
        roughness={0.4}
        metalness={0.2}
        transparent
        opacity={0.7}
      />
    </mesh>
  );
}

// ─── Shadow Catcher Plane ───────────────────────────────────────────
// Invisible plane that receives shadows to ground AR content
interface ShadowCatcherPlaneProps {
  position?: [number, number, number];
  size?: number;
}

export function ShadowCatcherPlane({
  position = [0, -2.2, 0],
  size = 12,
}: ShadowCatcherPlaneProps) {
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[size, size]} />
      <shadowMaterial transparent opacity={0.3} />
    </mesh>
  );
}

// ─── AR Lighting Rig ────────────────────────────────────────────────
// Complete AR-compatible lighting setup with shadows
interface ARLightingProps {
  sunColor?: string;
  sunIntensity?: number;
  sunPosition?: [number, number, number];
  ambientIntensity?: number;
}

export function ARLighting({
  sunColor = '#fff5e6',
  sunIntensity = 1.8,
  sunPosition = [5, 8, 5],
  ambientIntensity = 0.4,
}: ARLightingProps) {
  return (
    <>
      <hemisphereLight
        color="#b1e1ff"
        groundColor="#2d1b3d"
        intensity={ambientIntensity}
      />
      <directionalLight
        position={sunPosition}
        intensity={sunIntensity}
        color={sunColor}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={30}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.0005}
      />
      <directionalLight
        position={[-3, 2, -4]}
        intensity={0.3}
        color="#6366f1"
      />
    </>
  );
}

// ─── Electron Cloud Particles ───────────────────────────────────────
// Orbiting particles around a center point (for molecules)
interface ElectronCloudProps {
  center?: [number, number, number];
  radius?: number;
  count?: number;
  color?: string;
  speed?: number;
}

export function ElectronCloud({
  center = [0, 0, 0],
  radius = 1.5,
  count = 30,
  color = '#60a5fa',
  speed = 1,
}: ElectronCloudProps) {
  const pointsRef = useRef<THREE.Points>(null!);

  const offsets = useMemo(() => {
    const data = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      data[i * 3] = Math.random() * Math.PI * 2;     // angle
      data[i * 3 + 1] = (Math.random() - 0.5) * 0.5; // y offset
      data[i * 3 + 2] = radius * (0.8 + Math.random() * 0.4); // radius variation
    }
    return data;
  }, [count, radius]);

  const positions = useMemo(() => new Float32Array(count * 3), [count]);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const t = clock.getElapsedTime() * speed;
    for (let i = 0; i < count; i++) {
      const angle = offsets[i * 3] + t * (0.5 + i * 0.02);
      const yOff = offsets[i * 3 + 1];
      const r = offsets[i * 3 + 2];
      pos[i * 3] = center[0] + Math.cos(angle) * r;
      pos[i * 3 + 1] = center[1] + yOff + Math.sin(t + i) * 0.1;
      pos[i * 3 + 2] = center[2] + Math.sin(angle) * r;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} position={center}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={0.05}
        transparent
        opacity={0.5}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// ─── Holographic Ring ───────────────────────────────────────────────
// Rotating torus ring with emissive material (for DynamicAI overlay)
interface HolographicRingProps {
  radius?: number;
  tube?: number;
  color?: string;
  rotationAxis?: 'x' | 'y' | 'z';
  speed?: number;
  position?: [number, number, number];
}

export function HolographicRing({
  radius = 2,
  tube = 0.015,
  color = '#10b981',
  rotationAxis = 'y',
  speed = 0.5,
  position = [0, 0, 0],
}: HolographicRingProps) {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime() * speed;
    if (rotationAxis === 'x') meshRef.current.rotation.x = t;
    else if (rotationAxis === 'y') meshRef.current.rotation.y = t;
    else meshRef.current.rotation.z = t;
  });

  return (
    <mesh ref={meshRef} position={position}>
      <torusGeometry args={[radius, tube, 16, 100]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={1.5}
        transparent
        opacity={0.6}
        roughness={0.1}
        metalness={0.3}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
