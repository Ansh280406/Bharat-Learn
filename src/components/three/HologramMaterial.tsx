import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Custom holographic shader material that creates a futuristic hologram look:
 * - Fresnel-based edge glow
 * - Animated horizontal scan-lines
 * - Semi-transparent with additive blending
 * - Pulsing emissive intensity
 */

const hologramVertexShader = `
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const hologramFragmentShader = `
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uFresnelPower;
  uniform float uScanLineSpeed;
  uniform float uScanLineDensity;

  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying vec2 vUv;

  void main() {
    // Fresnel effect — brighter at edges
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), uFresnelPower);
    fresnel = clamp(fresnel, 0.0, 1.0);

    // Scan lines — horizontal animated stripes
    float scanLine = sin((vWorldPosition.y + uTime * uScanLineSpeed) * uScanLineDensity) * 0.5 + 0.5;
    scanLine = smoothstep(0.3, 0.7, scanLine);

    // Pulse effect
    float pulse = sin(uTime * 2.0) * 0.15 + 0.85;

    // Combine
    float alpha = (fresnel * 0.6 + 0.4) * scanLine * pulse * uOpacity;
    vec3 finalColor = uColor * (fresnel * 1.5 + 0.5) * pulse;

    // Add rim glow
    finalColor += uColor * fresnel * 0.8;

    gl_FragColor = vec4(finalColor, alpha);
  }
`;

interface HologramMaterialProps {
  color?: string;
  opacity?: number;
  fresnelPower?: number;
  scanLineSpeed?: number;
  scanLineDensity?: number;
}

export function HologramShaderMaterial({
  color = '#10b981',
  opacity = 0.7,
  fresnelPower = 2.5,
  scanLineSpeed = 0.8,
  scanLineDensity = 30.0,
}: HologramMaterialProps) {
  const matRef = useRef<THREE.ShaderMaterial>(null!);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uOpacity: { value: opacity },
      uFresnelPower: { value: fresnelPower },
      uScanLineSpeed: { value: scanLineSpeed },
      uScanLineDensity: { value: scanLineDensity },
    }),
    [color, opacity, fresnelPower, scanLineSpeed, scanLineDensity]
  );

  useFrame((_, delta) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value += delta;
    }
  });

  return (
    <shaderMaterial
      ref={matRef}
      vertexShader={hologramVertexShader}
      fragmentShader={hologramFragmentShader}
      uniforms={uniforms}
      transparent
      side={THREE.DoubleSide}
      depthWrite={false}
      blending={THREE.AdditiveBlending}
    />
  );
}

/**
 * Applies holographic material to all meshes in a given group/scene.
 * Call this after loading a GLTF model to convert it to hologram look.
 */
export function applyHologramEffect(
  object: THREE.Object3D,
  color: string = '#10b981',
  opacity: number = 0.65
) {
  const hologramColor = new THREE.Color(color);

  object.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      const mat = new THREE.MeshPhongMaterial({
        color: hologramColor,
        emissive: hologramColor,
        emissiveIntensity: 0.4,
        transparent: true,
        opacity: opacity,
        side: THREE.DoubleSide,
        depthWrite: false,
        shininess: 100,
        specular: new THREE.Color('#ffffff'),
      });
      mesh.material = mat;
    }
  });
}

/**
 * Creates a holographic wireframe overlay for the model.
 */
export function createWireframeOverlay(
  object: THREE.Object3D,
  color: string = '#10b981'
) {
  const wireColor = new THREE.Color(color);

  object.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      const wireGeo = mesh.geometry.clone();
      const wireMat = new THREE.MeshBasicMaterial({
        color: wireColor,
        wireframe: true,
        transparent: true,
        opacity: 0.12,
        depthWrite: false,
      });
      const wireMesh = new THREE.Mesh(wireGeo, wireMat);
      wireMesh.position.copy(mesh.position);
      wireMesh.rotation.copy(mesh.rotation);
      wireMesh.scale.copy(mesh.scale);
      mesh.parent?.add(wireMesh);
    }
  });
}
