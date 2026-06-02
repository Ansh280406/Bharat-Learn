import type { PageType } from '../../types';

/**
 * Configuration for 3D GLB models mapped to each subject/page type.
 * Models are hosted locally in public/models/ directory.
 */

export interface ModelConfig {
  /** URL to the .glb file */
  url: string;
  /** Scale factor for the model */
  scale: number;
  /** Y-axis offset to center the model */
  positionY: number;
  /** Optional initial rotation [x, y, z] in radians */
  rotation?: [number, number, number];
  /** Primary hologram glow color (hex) */
  hologramColor: string;
  /** Whether to auto-rotate */
  autoRotate: boolean;
  /** Rotation speed multiplier */
  rotateSpeed: number;
  /** Label shown while loading */
  loadingLabel: string;
}

/**
 * Free GLB models hosted locally in public/models/
 */
export const MODEL_CONFIGS: Record<PageType, ModelConfig> = {
  heart: {
    url: '/models/heart.glb',
    scale: 2.2,
    positionY: 0,
    rotation: [-Math.PI / 2, 0, 0],
    hologramColor: '#ef4444',
    autoRotate: true,
    rotateSpeed: 0.5,
    loadingLabel: 'Loading Heart Model...',
  },
  chemistry: {
    url: '/models/dna.glb',
    scale: 3.0,
    positionY: 0,
    hologramColor: '#14b8a6',
    autoRotate: true,
    rotateSpeed: 0.3,
    loadingLabel: 'Loading Molecular Model...',
  },
  physics: {
    url: '/models/primary_ion_drive.glb',
    scale: 0.75,
    positionY: 0,
    hologramColor: '#8b5cf6',
    autoRotate: true,
    rotateSpeed: 0.4,
    loadingLabel: 'Loading Prism Model...',
  },
  water_cycle: {
    url: '/models/earth.glb',
    scale: 1.5,
    positionY: 0,
    hologramColor: '#0ea5e9',
    autoRotate: true,
    rotateSpeed: 0.2,
    loadingLabel: 'Loading Earth Model...',
  },
  math_3d: {
    url: '/models/robot.glb',
    scale: 45.0,
    positionY: 0,
    hologramColor: '#0ea5e9',
    autoRotate: true,
    rotateSpeed: 0.5,
    loadingLabel: 'Loading 3D Geometry...',
  },
  math: {
    url: '/models/robot.glb',
    scale: 45.0,
    positionY: 0,
    hologramColor: '#10b981',
    autoRotate: true,
    rotateSpeed: 0.5,
    loadingLabel: 'Loading 3D Math Model...',
  },
  history: {
    url: '/models/soldier.glb',
    scale: 0.016,
    positionY: 0,
    rotation: [-Math.PI / 2, 0, 0],
    hologramColor: '#f59e0b',
    autoRotate: true,
    rotateSpeed: 0.4,
    loadingLabel: 'Loading Battle Model...',
  },
  unknown: {
    url: '/models/robot.glb',
    scale: 45.0,
    positionY: 0,
    hologramColor: '#10b981',
    autoRotate: true,
    rotateSpeed: 0.6,
    loadingLabel: 'Generating AI Hologram...',
  },
};

/**
 * Gets the model config for a given page type.
 * Falls back to the 'unknown' config if no specific model exists.
 */
export function getModelConfig(pageType: PageType): ModelConfig | null {
  return MODEL_CONFIGS[pageType] || MODEL_CONFIGS.unknown || null;
}
