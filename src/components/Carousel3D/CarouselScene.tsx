import React, { useRef, useState, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { useControls } from "leva";
import * as THREE from "three";
import Model from "./Model";
import { CarouselSceneTypes } from "@/types/types";

const CarouselScene = ({ models = [], onFocusChange }: CarouselSceneTypes) => {
  const groupRef = useRef<THREE.Group>(null);
  const { gl } = useThree();
  const [currentYRotation, setCurrentYRotation] = useState(0.0);
  const dragStateRef = useRef({ isDragging: false, prevX: 0 });
  const { carouselRadius, modelScale, modelYOffset, levaHoverScaleMultiplier } =
    useControls("Carousel Settings", {
      carouselRadius: { value: 0.5, min: 1, max: 20, step: 0.5 },
      modelScale: { value: 0.6, min: 0.1, max: 5, step: 0.1 },
      modelYOffset: { value: 0.3, min: -5, max: 5, step: 0.1 },
      levaHoverScaleMultiplier: {
        value: 1.2,
        min: 1,
        max: 5,
        step: 0.1,
        label: "Hover Scale Multiplier",
      },
    });
  const DRAG_SENSITIVITY = 0.0025;
  const rawModelPositions = models.map((model, index) => {
    const angle = (index / models.length) * Math.PI * 2;
    let x = Math.cos(angle) * carouselRadius;
    let z = Math.sin(angle) * carouselRadius;
    if (model.path.endsWith("/5xt.glb")) {
      x = -2;
      z = 0;
    }
    return new THREE.Vector3(x, 0, z);
  });
  const sceneCenter = new THREE.Vector3();
  if (models.length > 0) {
    rawModelPositions.forEach((pos) => sceneCenter.add(pos));
    sceneCenter.divideScalar(models.length);
  }
  useEffect(() => {
    const domElement = gl.domElement;
    const handlePointerDown = (event: PointerEvent) => {
      dragStateRef.current.isDragging = true;
      dragStateRef.current.prevX = event.clientX;
      domElement.setPointerCapture(event.pointerId);
      event.preventDefault();
    };
    const handlePointerMove = (event: PointerEvent) => {
      if (!dragStateRef.current.isDragging) return;
      event.preventDefault();
      const deltaX = event.clientX - dragStateRef.current.prevX;
      dragStateRef.current.prevX = event.clientX;
      setCurrentYRotation((prevRotation) => {
        const newRotation = prevRotation + deltaX * DRAG_SENSITIVITY;
        if (groupRef.current) {
          groupRef.current.rotation.y = newRotation;
        }
        return newRotation;
      });
    };
    const handlePointerUpOrLeave = (event: PointerEvent) => {
      if (dragStateRef.current.isDragging) {
        dragStateRef.current.isDragging = false;
        domElement.releasePointerCapture(event.pointerId);
      }
    };
    domElement.addEventListener("pointerdown", handlePointerDown);
    domElement.addEventListener("pointermove", handlePointerMove);
    domElement.addEventListener("pointerup", handlePointerUpOrLeave);
    domElement.addEventListener("pointerleave", handlePointerUpOrLeave);
    return () => {
      domElement.removeEventListener("pointerdown", handlePointerDown);
      domElement.removeEventListener("pointermove", handlePointerMove);
      domElement.removeEventListener("pointerup", handlePointerUpOrLeave);
      domElement.removeEventListener("pointerleave", handlePointerUpOrLeave);
    };
  }, [gl, setCurrentYRotation, DRAG_SENSITIVITY]);
  return (
    <group ref={groupRef}>
      {models.map((model, index) => {
        const angle = (index / models.length) * Math.PI * 2;
        let currentModelInitialX = Math.cos(angle) * carouselRadius;
        let currentModelInitialZ = Math.sin(angle) * carouselRadius;
        const initialModelYRotation = angle + Math.PI;
        if (model.path.endsWith("/5xt.glb")) {
          currentModelInitialX = -2;
          currentModelInitialZ = 0;
        }
        const finalX = currentModelInitialX - sceneCenter.x;
        let finalY = modelYOffset - sceneCenter.y;
        const finalZ = currentModelInitialZ - sceneCenter.z;

        if (model.path.endsWith("/models/camera.glb")) {
          finalY -= 0.2;
        }

        let currentModelScale = modelScale;
        if (model.path.endsWith("/models/camera.glb")) {
          currentModelScale = modelScale * 5;
        }

        return (
          <Model
            key={`${model.path}-${index}`}
            path={model.path}
            description={model.description}
            url={model.url}
            position={[finalX, finalY, finalZ]}
            rotation={[0, initialModelYRotation, 0]}
            scale={currentModelScale}
            hoverScaleMultiplier={levaHoverScaleMultiplier}
            modelIndex={index}
            numModels={models.length}
            carouselRotationY={currentYRotation}
            onFocusChange={onFocusChange}
          />
        );
      })}
    </group>
  );
};

export default CarouselScene;
