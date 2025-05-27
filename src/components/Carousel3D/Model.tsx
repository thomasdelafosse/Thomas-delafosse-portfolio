import React, { useRef, useState } from "react";
import { useGLTF } from "@react-three/drei";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ModelTypes } from "@/types/types";
import { useModelTexture } from "@/hooks/useModelTexture";

const Model = ({
  path,
  description,
  url,
  position,
  rotation,
  scale,
  hoverScaleMultiplier,
  modelIndex,
  numModels,
  carouselRotationY,
  onFocusChange,
}: ModelTypes) => {
  const { scene } = useGLTF(path);
  const modelRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const wasInFocusRef = useRef<boolean | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const baseAngleInCarousel = (modelIndex / numModels) * Math.PI * 2;

  useModelTexture({ modelPath: path, scene: scene });

  useFrame(() => {
    if (modelRef.current) {
      const model = modelRef.current;
      const baseRotX = rotation && rotation.length === 3 ? rotation[0] : 0;
      const baseRotY = rotation && rotation.length === 3 ? rotation[1] : 0;
      const baseRotZ = rotation && rotation.length === 3 ? rotation[2] : 0;
      const modelWorldPosition = new THREE.Vector3();
      model.getWorldPosition(modelWorldPosition);
      const modelAbsoluteAngleInCarousel =
        baseAngleInCarousel + carouselRotationY;
      const frontOfCarouselAngle = Math.PI / 2;
      let angleDifferenceFromFront =
        modelAbsoluteAngleInCarousel - frontOfCarouselAngle;
      angleDifferenceFromFront =
        THREE.MathUtils.euclideanModulo(
          angleDifferenceFromFront + Math.PI,
          Math.PI * 2
        ) - Math.PI;
      const FOCUS_THRESHOLD_ANGLE = Math.PI / 3.5;
      model.rotation.x = baseRotX;
      model.rotation.z = baseRotZ;
      const isInFocus =
        Math.abs(angleDifferenceFromFront) < FOCUS_THRESHOLD_ANGLE;
      if (wasInFocusRef.current !== isInFocus) {
        if (isInFocus) {
          onFocusChange({ description: description, path: path });
        } else {
          onFocusChange({ description: null, path: null });
        }
        wasInFocusRef.current = isInFocus;
      }
      if (isInFocus) {
        const lookAtMatrix = new THREE.Matrix4();
        lookAtMatrix.lookAt(modelWorldPosition, camera.position, model.up);
        const targetWorldQuaternion =
          new THREE.Quaternion().setFromRotationMatrix(lookAtMatrix);
        const parentWorldQuaternion = new THREE.Quaternion();
        if (model.parent) {
          model.parent.matrixWorld.decompose(
            new THREE.Vector3(),
            parentWorldQuaternion,
            new THREE.Vector3()
          );
          const targetLocalQuaternion = parentWorldQuaternion
            .clone()
            .invert()
            .multiply(targetWorldQuaternion);
          const euler = new THREE.Euler().setFromQuaternion(
            targetLocalQuaternion,
            "YXZ"
          );
          let finalYRotation = euler.y;
          if (path.endsWith("/models/camera.glb")) {
            finalYRotation += Math.PI;
          } else if (path.endsWith("/models/3Dchably.glb")) {
            finalYRotation += (2 * Math.PI) / 3;
          } else if (path.endsWith("/models/5xt.glb")) {
            finalYRotation += (2 * Math.PI) / 3;
          }
          model.rotation.y = finalYRotation;
        } else {
          model.rotation.y = baseRotY;
        }
      } else {
        if (path.endsWith("/models/camera.glb")) {
          model.rotation.y = baseRotY + Math.PI / 2;
        } else {
          model.rotation.y = baseRotY;
        }
      }
    }
  });

  const handlePointerOver = (event: React.PointerEvent<THREE.Object3D>) => {
    event.stopPropagation();
    setIsHovered(true);
    document.body.style.cursor = "pointer";
  };

  const handlePointerOut = (event: React.PointerEvent<THREE.Object3D>) => {
    event.stopPropagation();
    setIsHovered(false);
    document.body.style.cursor = "auto";
  };

  const handleClick = (event: React.MouseEvent<THREE.Object3D>) => {
    event.stopPropagation();
    window.open(url, "_blank");
  };

  const actualScale = isHovered ? scale * hoverScaleMultiplier : scale;

  return (
    <primitive
      object={scene}
      ref={modelRef}
      position={position}
      rotation={rotation}
      scale={actualScale}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    />
  );
};

export default Model;
