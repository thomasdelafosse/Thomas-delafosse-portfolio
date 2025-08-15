import React, {
  useRef,
  useImperativeHandle,
  forwardRef,
  useLayoutEffect,
} from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import Model from "./Model";
import { CarouselSceneTypes, CarouselSceneApi } from "@/types/types";
import { useCarouselSettings } from "@/hooks/useCarouselSettings";
import { useCarouselRotation } from "@/hooks/useCarouselRotation";
import { FRONT_OF_CAROUSEL_ANGLE } from "./constants";
import { closestAngleDelta, easeInOutQuad } from "./utils/math";
import { computeTransforms } from "./utils/computeTransforms";

const CarouselScene = forwardRef<CarouselSceneApi, CarouselSceneTypes>(
  ({ models = [], onFocusChange }, ref) => {
    const groupRef = useRef<THREE.Group>(null);
    const settings = useCarouselSettings();
    const { currentYRotationRef } = useCarouselRotation(
      groupRef,
      {},
      ({ rotation, angularVelocity }) => {
        if (!groupRef.current || models.length === 0) return;
        const stepAngle = (Math.PI * 2) / models.length;
        // Compute floating index from rotation
        const indexFloat =
          ((FRONT_OF_CAROUSEL_ANGLE - rotation) / (Math.PI * 2)) *
          models.length;
        let nearestIndex = Math.round(indexFloat);
        // Wrap to [0, length-1]
        nearestIndex =
          ((nearestIndex % models.length) + models.length) % models.length;

        // If flick velocity is strong, bias to next/prev in the direction of velocity
        const VELOCITY_THRESHOLD = 0.0006; // rad/ms
        let targetIndex = nearestIndex;
        if (Math.abs(angularVelocity) > VELOCITY_THRESHOLD) {
          // Positive angular velocity means rotation increasing → move to previous index
          const direction = angularVelocity > 0 ? -1 : 1;
          targetIndex =
            (((nearestIndex + direction) % models.length) + models.length) %
            models.length;
        }

        const baseAngle = (targetIndex / models.length) * Math.PI * 2;
        const desiredRotation = FRONT_OF_CAROUSEL_ANGLE - baseAngle;
        const current = groupRef.current.rotation.y;
        const delta = closestAngleDelta(current, desiredRotation);
        const target = current + delta;
        animationRef.current = {
          isAnimating: true,
          startTime: performance.now(),
          from: current,
          to: target,
          durationMs: 450,
        };
      }
    );
    const animationRef = useRef<{
      isAnimating: boolean;
      startTime: number;
      from: number;
      to: number;
      durationMs: number;
    }>({ isAnimating: false, startTime: 0, from: 0, to: 0, durationMs: 450 });
    const { items } = computeTransforms({
      models,
      carouselRadius: settings.carouselRadius,
      modelScale: settings.modelScale,
      modelYOffset: settings.modelYOffset,
      syvaXExtraOffset: settings.syvaXExtraOffset,
      syvaZExtraOffset: settings.syvaZExtraOffset,
      cameraYExtraOffset: settings.cameraYExtraOffset,
      cameraYawOffsetDeg: settings.cameraYawOffsetDeg,
      syvaYExtraOffset: settings.syvaYExtraOffset,
      syvaYawOffsetDeg: settings.syvaYawOffsetDeg,
    });

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
    }, [models, currentYRotationRef]);

    useFrame(() => {
      if (!groupRef.current) return;

      if (animationRef.current.isAnimating) {
        const now = performance.now();
        const t = Math.min(
          (now - animationRef.current.startTime) /
            animationRef.current.durationMs,
          1
        );
        const eased = easeInOutQuad(t);
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
    });

    useImperativeHandle(ref, () => ({
      rotateToIndex: (index: number) => {
        if (!groupRef.current || models.length === 0) return;
        const baseAngle = (index / models.length) * Math.PI * 2;
        const desiredRotation = FRONT_OF_CAROUSEL_ANGLE - baseAngle;
        const current = groupRef.current.rotation.y;
        const delta = closestAngleDelta(current, desiredRotation);
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
      <group ref={groupRef} position={[0, 0, settings.carouselZOffset]}>
        {models.map((model, index) => {
          const item = items[index];
          return (
            <Model
              key={`${model.path}-${index}`}
              path={model.path}
              description={model.description}
              url={model.url}
              position={item.position}
              rotation={[0, item.rotationY, 0]}
              scale={item.scale}
              hoverScaleMultiplier={settings.hoverScaleMultiplier}
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
