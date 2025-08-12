import React, { useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ModelTypes } from "@/types/types";
import { useModelTexture } from "@/hooks/useModelTexture";

const Model = ({
  path,
  description,
  url: _url,
  position,
  rotation,
  scale,
  hoverScaleMultiplier: _hoverScaleMultiplier,
  modelIndex,
  numModels,
  carouselRotationRef,
  onFocusChange,
}: ModelTypes) => {
  const { scene } = useGLTF(path);
  const modelRef = useRef<THREE.Group>(null);
  const wasInFocusRef = useRef<boolean | null>(null);
  const baseAngleInCarousel = (modelIndex / numModels) * Math.PI * 2;

  useModelTexture({ modelPath: path, scene: scene });

  useFrame(() => {
    if (modelRef.current) {
      const model = modelRef.current;
      const modelAbsoluteAngleInCarousel =
        baseAngleInCarousel + carouselRotationRef.current;
      const frontOfCarouselAngle = Math.PI / 2;
      let angleDifferenceFromFront =
        modelAbsoluteAngleInCarousel - frontOfCarouselAngle;
      angleDifferenceFromFront =
        THREE.MathUtils.euclideanModulo(
          angleDifferenceFromFront + Math.PI,
          Math.PI * 2
        ) - Math.PI;
      const FOCUS_THRESHOLD_ANGLE = Math.PI / 3.5;
      const isInFocus =
        Math.abs(angleDifferenceFromFront) < FOCUS_THRESHOLD_ANGLE;

      if (wasInFocusRef.current !== isInFocus) {
        if (isInFocus) {
          onFocusChange({ description: description, path: path }, modelIndex);
        }
        wasInFocusRef.current = isInFocus;
      }
    }
  });

  return (
    <primitive
      object={scene}
      ref={modelRef}
      position={position}
      rotation={rotation}
      scale={scale}
    />
  );
};

export default Model;
