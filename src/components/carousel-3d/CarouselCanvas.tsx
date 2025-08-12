import {
  Suspense,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import { Canvas } from "@react-three/fiber";
import { useProgress, Environment, useGLTF } from "@react-three/drei";
import { Leva } from "leva";
import CarouselScene from "./CarouselScene";
import {
  CarouselTypes,
  CarouselCanvasApi,
  CarouselSceneApi,
} from "@/types/types";
import CameraUpdater from "./CameraUpdater";
import { useFocusedModelInfo } from "@/hooks/useFocusedModelInfo";
import useSceneControls from "@/hooks/useSceneControls";

const CarouselCanvas = forwardRef<CarouselCanvasApi, CarouselTypes>(
  (
    {
      models,
      onModelFocusStatusChange,
      onModelProgress,
      onFocusedModelInfoChange,
    },
    ref
  ) => {
    const { ambientLightIntensity, cameraFov, cameraPosition } =
      useSceneControls();

    const { focusedModelInfo, handleFocusChange, currentIndex } =
      useFocusedModelInfo(models, onModelFocusStatusChange);
    // No body scroll lock: users should scroll to details

    const { progress } = useProgress();

    useEffect(() => {
      if (onModelProgress) {
        onModelProgress(progress);
      }
    }, [progress, onModelProgress]);

    // Preload GLTF models to avoid hitches when rotating/focusing
    useEffect(() => {
      models?.forEach((m) => {
        if (m?.path) {
          try {
            useGLTF.preload(m.path);
          } catch {}
        }
      });
    }, [models]);

    useEffect(() => {
      onFocusedModelInfoChange?.(focusedModelInfo ?? null);
    }, [focusedModelInfo, onFocusedModelInfoChange]);

    const sceneRef = useRef<CarouselSceneApi | null>(null);

    const next = () => {
      if (!models.length) return;
      const target = (currentIndex + 1 + models.length) % models.length;
      sceneRef.current?.rotateToIndex(target);
    };

    const prev = () => {
      if (!models.length) return;
      const target = (currentIndex - 1 + models.length) % models.length;
      sceneRef.current?.rotateToIndex(target);
    };

    useImperativeHandle(ref, () => ({ next, prev }));

    return (
      <div className="relative w-full h-full">
        <Leva hidden={true} collapsed={false} />

        <Canvas
          gl={{
            alpha: true,
            antialias: true,
            powerPreference: "high-performance",
          }}
          dpr={[1, 2]}
          camera={{ position: cameraPosition, fov: cameraFov }}
        >
          <CameraUpdater />
          <ambientLight intensity={ambientLightIntensity} />
          <Suspense fallback={null}>
            <CarouselScene
              ref={sceneRef}
              models={models}
              onFocusChange={handleFocusChange}
            />
          </Suspense>
          <Environment preset="sunset" />
        </Canvas>
      </div>
    );
  }
);

CarouselCanvas.displayName = "CarouselCanvas";

export default CarouselCanvas;
