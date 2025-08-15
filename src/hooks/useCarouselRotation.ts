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
  options: UseCarouselRotationOptions = {},
  onRelease?: (state: { rotation: number; angularVelocity: number }) => void
) {
  const { gl } = useThree();
  const currentYRotationRef = useRef(0.0);
  const dragStateRef = useRef({ isDragging: false, prevX: 0 });
  // Keep a short history of pointer moves to estimate velocity at release
  const moveHistoryRef = useRef<Array<{ x: number; t: number }>>([]);
  const dragSensitivity = options.dragSensitivity ?? DRAG_SENSITIVITY;
  const autoRotateSpeed = options.autoRotateSpeed ?? AUTO_ROTATE_SPEED;

  useEffect(() => {
    const domElement = gl.domElement;
    const handlePointerDown = (event: PointerEvent) => {
      dragStateRef.current.isDragging = true;
      dragStateRef.current.prevX = event.clientX;
      moveHistoryRef.current = [{ x: event.clientX, t: performance.now() }];
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
      // Record movement for velocity estimation (keep last ~150ms)
      const now = performance.now();
      moveHistoryRef.current.push({ x: event.clientX, t: now });
      const cutoff = now - 150;
      while (
        moveHistoryRef.current.length > 2 &&
        moveHistoryRef.current[0].t < cutoff
      ) {
        moveHistoryRef.current.shift();
      }
    };
    const handlePointerUpOrLeave = (event: PointerEvent) => {
      if (dragStateRef.current.isDragging) {
        dragStateRef.current.isDragging = false;
        domElement.releasePointerCapture(event.pointerId);
        // Estimate angular velocity at release and notify
        const history = moveHistoryRef.current;
        let angularVelocity = 0; // radians per ms
        if (history.length >= 2) {
          const first = history[0];
          const last = history[history.length - 1];
          const dx = last.x - first.x; // pixels
          const dt = Math.max(1, last.t - first.t); // ms, avoid divide by zero
          const vx = dx / dt; // pixels per ms
          angularVelocity = vx * dragSensitivity; // rad/ms
        }
        moveHistoryRef.current = [];
        onRelease?.({
          rotation: currentYRotationRef.current,
          angularVelocity,
        });
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
