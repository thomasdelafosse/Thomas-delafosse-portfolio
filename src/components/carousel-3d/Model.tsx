import React, { useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ModelTypes } from "@/types/types";
import { useModelTexture } from "@/hooks/useModelTexture";
import { FOCUS_THRESHOLD_ANGLE, FRONT_OF_CAROUSEL_ANGLE } from "./constants";

const Model = ({
  path,
  description,
  position,
  rotation,
  scale,
  modelIndex,
  numModels,
  carouselRotationRef,
  onFocusChange,
}: ModelTypes) => {
  const { scene } = useGLTF(path);
  const modelRef = useRef<THREE.Group>(null);
  const wasInFocusRef = useRef<boolean | null>(null);
  const baseAngleInCarousel = useMemo(
    () => (modelIndex / numModels) * Math.PI * 2,
    [modelIndex, numModels]
  );

  useModelTexture({ modelPath: path, scene: scene });

  useFrame(() => {
    if (modelRef.current) {
      const modelAbsoluteAngleInCarousel =
        baseAngleInCarousel + carouselRotationRef.current;
      let angleDifferenceFromFront =
        modelAbsoluteAngleInCarousel - FRONT_OF_CAROUSEL_ANGLE;
      angleDifferenceFromFront =
        THREE.MathUtils.euclideanModulo(
          angleDifferenceFromFront + Math.PI,
          Math.PI * 2
        ) - Math.PI;
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
