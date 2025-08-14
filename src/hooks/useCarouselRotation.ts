import { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  AUTO_ROTATE_SPEED,
  DRAG_SENSITIVITY,
} from "../components/carousel-3d/constants";

interface UseCarouselRotationOptions {
  dragSensitivity?: number;
  autoRotateSpeed?: number;
}

export function useCarouselRotation(
  groupRef: React.RefObject<THREE.Group | null>,
  options: UseCarouselRotationOptions = {}
) {
  const { gl } = useThree();
  const currentYRotationRef = useRef(0.0);
  const dragStateRef = useRef({ isDragging: false, prevX: 0 });
  const dragSensitivity = options.dragSensitivity ?? DRAG_SENSITIVITY;
  const autoRotateSpeed = options.autoRotateSpeed ?? AUTO_ROTATE_SPEED;

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
      const newRotation =
        currentYRotationRef.current + deltaX * dragSensitivity;
      currentYRotationRef.current = newRotation;
      if (groupRef.current) {
        groupRef.current.rotation.y = newRotation;
      }
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
  }, [gl, dragSensitivity, groupRef]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    if (!dragStateRef.current.isDragging) {
      const newRotation = groupRef.current.rotation.y + autoRotateSpeed * delta;
      groupRef.current.rotation.y = newRotation;
      currentYRotationRef.current = newRotation;
    }
  });

  return { currentYRotationRef } as const;
}
