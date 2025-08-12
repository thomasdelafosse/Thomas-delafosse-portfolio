import React, {
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useLayoutEffect,
} from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import * as THREE from "three";
import Model from "./Model";
import { CarouselSceneTypes, CarouselSceneApi } from "@/types/types";

const CarouselScene = forwardRef<CarouselSceneApi, CarouselSceneTypes>(
  ({ models = [], onFocusChange }, ref) => {
    const groupRef = useRef<THREE.Group>(null);
    const { gl } = useThree();
    const currentYRotationRef = useRef(0.0);
    const dragStateRef = useRef({ isDragging: false, prevX: 0 });
    const animationRef = useRef<{
      isAnimating: boolean;
      startTime: number;
      from: number;
      to: number;
      durationMs: number;
    }>({ isAnimating: false, startTime: 0, from: 0, to: 0, durationMs: 450 });
    const {
      carouselRadius,
      modelScale,
      modelYOffset,
      levaHoverScaleMultiplier,
      carouselZOffset,
      cameraYExtraOffset,
      cameraYawOffsetDeg,
      syvaYExtraOffset,
      syvaYawOffsetDeg,
      syvaXExtraOffset,
      syvaZExtraOffset,
    } = useControls("Carousel Settings", {
      carouselRadius: { value: 1, min: 1, max: 20, step: 0.5 },
      modelScale: { value: 0.7, min: 0.1, max: 5, step: 0.1 },
      modelYOffset: { value: -0.3, min: -5, max: 5, step: 0.1 },
      levaHoverScaleMultiplier: {
        value: 1,
        min: 1,
        max: 5,
        step: 0.1,
        label: "Hover Scale Multiplier",
      },
      carouselZOffset: {
        value: -0.15,
        min: -10,
        max: 10,
        step: 0.05,
        label: "Carousel Z Offset",
      },
      cameraYExtraOffset: {
        value: -0.2,
        min: -2,
        max: 2,
        step: 0.01,
        label: "camera.glb Y Offset",
      },
      cameraYawOffsetDeg: {
        value: 90,
        min: -180,
        max: 180,
        step: 1,
        label: "camera.glb Yaw Offset (deg)",
      },
      syvaYExtraOffset: {
        value: -0.14,
        min: -2,
        max: 2,
        step: 0.01,
        label: "syva.glb Y Offset",
      },
      syvaXExtraOffset: {
        value: -0.01,
        min: -10,
        max: 10,
        step: 0.01,
        label: "syva.glb X Offset",
      },
      syvaZExtraOffset: {
        value: -0.02,
        min: -10,
        max: 10,
        step: 0.01,
        label: "syva.glb Z Offset",
      },
      syvaYawOffsetDeg: {
        value: -88,
        min: -180,
        max: 180,
        step: 1,
        label: "syva.glb Yaw Offset (deg)",
      },
    });
    const DRAG_SENSITIVITY = 0.0025;
    const AUTO_ROTATE_SPEED = 0;
    const FRONT_OF_CAROUSEL_ANGLE = Math.PI / 2;
    const rawModelPositions = models.map((model, index) => {
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
      rawModelPositions.forEach((pos) => sceneCenter.add(pos));
      sceneCenter.divideScalar(models.length);
    }

    useLayoutEffect(() => {
      if (!groupRef.current || models.length === 0) return;
      const FRONT_OF_CAROUSEL_ANGLE = Math.PI / 2;
      const preferredPathSuffix = "/models/camera.glb";
      const indexToCenter = Math.max(
        models.findIndex((m) => m.path.endsWith(preferredPathSuffix)),
        0
      );
      const baseAngle = (indexToCenter / models.length) * Math.PI * 2;
      const desiredRotation = FRONT_OF_CAROUSEL_ANGLE - baseAngle;
      groupRef.current.rotation.y = desiredRotation;
      currentYRotationRef.current = desiredRotation;
    }, [models]);

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
          currentYRotationRef.current + deltaX * DRAG_SENSITIVITY;
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
    }, [gl, DRAG_SENSITIVITY]);

    useFrame((state, delta) => {
      if (!groupRef.current) return;

      if (animationRef.current.isAnimating) {
        const now = performance.now();
        const t = Math.min(
          (now - animationRef.current.startTime) /
            animationRef.current.durationMs,
          1
        );
        const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // easeInOutQuad
        const rot =
          animationRef.current.from +
          (animationRef.current.to - animationRef.current.from) * eased;
        groupRef.current.rotation.y = rot;
        currentYRotationRef.current = rot;
        if (t >= 1) {
          animationRef.current.isAnimating = false;
        }
        return;
      }

      if (!dragStateRef.current.isDragging) {
        const newRotation =
          groupRef.current.rotation.y + AUTO_ROTATE_SPEED * delta;
        groupRef.current.rotation.y = newRotation;
        currentYRotationRef.current = newRotation;
      }
    });

    useImperativeHandle(ref, () => ({
      rotateToIndex: (index: number) => {
        if (!groupRef.current || models.length === 0) return;
        const baseAngle = (index / models.length) * Math.PI * 2;
        const desiredRotation = FRONT_OF_CAROUSEL_ANGLE - baseAngle;
        const current = groupRef.current.rotation.y;
        const delta =
          ((desiredRotation - current + Math.PI) % (Math.PI * 2)) - Math.PI;
        const target = current + delta;
        animationRef.current = {
          isAnimating: true,
          startTime: performance.now(),
          from: current,
          to: target,
          durationMs: 450,
        };
      },
    }));

    return (
      <group ref={groupRef} position={[0, 0, carouselZOffset]}>
        {models.map((model, index) => {
          const angle = (index / models.length) * Math.PI * 2;
          let currentModelInitialX = Math.cos(angle) * carouselRadius;
          let currentModelInitialZ = Math.sin(angle) * carouselRadius;
          const initialModelYRotation = angle + Math.PI;
          if (model.path.endsWith("/logo-sweet-spot.glb")) {
            currentModelInitialX = -2 + syvaXExtraOffset;
            currentModelInitialZ = 0 + syvaZExtraOffset;
          }
          const finalX = currentModelInitialX - sceneCenter.x;
          let finalY = modelYOffset - sceneCenter.y;
          const finalZ = currentModelInitialZ - sceneCenter.z;

          if (model.path.endsWith("/models/camera.glb")) {
            finalY += cameraYExtraOffset;
          } else if (model.path.endsWith("/models/logo-sweet-spot.glb")) {
            finalY += syvaYExtraOffset;
          }

          let currentModelScale = modelScale;
          if (model.path.endsWith("/models/camera.glb")) {
            currentModelScale = modelScale * 4;
          } else if (model.path.endsWith("/models/logo-sweet-spot.glb")) {
            currentModelScale = modelScale * 1;
          } else if (model.path.endsWith("/models/3Dchably.glb")) {
            currentModelScale = modelScale * 0.9;
          }

          let rotationY = initialModelYRotation;
          if (model.path.endsWith("/models/camera.glb")) {
            rotationY += THREE.MathUtils.degToRad(cameraYawOffsetDeg);
          } else if (model.path.endsWith("/models/logo-sweet-spot.glb")) {
            rotationY += THREE.MathUtils.degToRad(syvaYawOffsetDeg);
          }

          return (
            <Model
              key={`${model.path}-${index}`}
              path={model.path}
              description={model.description}
              url={model.url}
              position={[finalX, finalY, finalZ]}
              rotation={[0, rotationY, 0]}
              scale={currentModelScale}
              hoverScaleMultiplier={levaHoverScaleMultiplier}
              modelIndex={index}
              numModels={models.length}
              carouselRotationRef={currentYRotationRef}
              onFocusChange={onFocusChange}
            />
          );
        })}
      </group>
    );
  }
);

CarouselScene.displayName = "CarouselScene";

export default CarouselScene;
