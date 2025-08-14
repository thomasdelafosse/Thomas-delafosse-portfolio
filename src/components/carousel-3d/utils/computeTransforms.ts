import * as THREE from "three";
import type { ModelData } from "@/types/types";

export interface ModelConfigOverride {
  scaleMultiplier?: number;
  initialOverride?: { x?: number; z?: number };
}

const MODEL_CONFIG: Record<string, ModelConfigOverride> = {
  "/models/camera.glb": {
    scaleMultiplier: 4,
  },
  "/models/logo-sweet-spot.glb": {
    scaleMultiplier: 1,
    initialOverride: { x: -2, z: 0 },
  },
  "/models/3Dchably.glb": {
    scaleMultiplier: 0.9,
  },
};

export interface ComputeTransformsInput {
  models: ModelData[];
  carouselRadius: number;
  modelScale: number;
  modelYOffset: number;
  syvaXExtraOffset: number;
  syvaZExtraOffset: number;
  cameraYExtraOffset: number;
  cameraYawOffsetDeg: number;
  syvaYExtraOffset: number;
  syvaYawOffsetDeg: number;
}

export interface TransformResultItem {
  position: [number, number, number];
  rotationY: number;
  scale: number;
}

export interface ComputeTransformsResult {
  items: TransformResultItem[];
  sceneCenter: THREE.Vector3;
}

export function computeTransforms(
  input: ComputeTransformsInput
): ComputeTransformsResult {
  const {
    models,
    carouselRadius,
    modelScale,
    modelYOffset,
    syvaXExtraOffset,
    syvaZExtraOffset,
    cameraYExtraOffset,
    cameraYawOffsetDeg,
    syvaYExtraOffset,
    syvaYawOffsetDeg,
  } = input;

  const rawPositions: THREE.Vector3[] = models.map((model, index) => {
    const angle = (index / models.length) * Math.PI * 2;
    let x = Math.cos(angle) * carouselRadius;
    let z = Math.sin(angle) * carouselRadius;
    if (model.path.endsWith("/logo-sweet-spot.glb")) {
      x = -2 + syvaXExtraOffset;
      z = 0 + syvaZExtraOffset;
    }
    return new THREE.Vector3(x, 0, z);
  });

  const sceneCenter = new THREE.Vector3();
  if (models.length > 0) {
    rawPositions.forEach((pos) => sceneCenter.add(pos));
    sceneCenter.divideScalar(models.length);
  }

  const items: TransformResultItem[] = models.map((model, index) => {
    const angle = (index / models.length) * Math.PI * 2;
    const initialYRotation = angle + Math.PI;

    const override = Object.entries(MODEL_CONFIG).find(([suffix]) =>
      model.path.endsWith(suffix)
    )?.[1];

    const x = rawPositions[index].x - sceneCenter.x;
    const z = rawPositions[index].z - sceneCenter.z;
    let y = modelYOffset - sceneCenter.y;

    if (model.path.endsWith("/models/camera.glb")) {
      y += cameraYExtraOffset;
    } else if (model.path.endsWith("/models/logo-sweet-spot.glb")) {
      y += syvaYExtraOffset;
    }

    const effectiveScale = modelScale * (override?.scaleMultiplier ?? 1);
    let rotationY = initialYRotation;
    if (model.path.endsWith("/models/camera.glb")) {
      rotationY += THREE.MathUtils.degToRad(cameraYawOffsetDeg);
    } else if (model.path.endsWith("/models/logo-sweet-spot.glb")) {
      rotationY += THREE.MathUtils.degToRad(syvaYawOffsetDeg);
    }

    return {
      position: [x, y, z],
      rotationY,
      scale: effectiveScale,
    };
  });

  return { items, sceneCenter };
}
