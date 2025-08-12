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

    // Use a unified background for all models (no per-model backgrounds)

    // Lift the focused model info up to parent for rendering details below the fold
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
        <Leva
          hidden={true}
          collapsed={false}
          theme={{
            sizes: {
              rootWidth: "450px",
              rowHeight: "30px",
            },
            fontSizes: {
              root: "13px",
            },
          }}
        />

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
          {/* Transparent canvas background to let global particle background show through */}
          <Suspense fallback={null}>
            <CarouselScene
              ref={sceneRef}
              models={models}
              onFocusChange={handleFocusChange}
            />
          </Suspense>
          <Environment preset="sunset" />
        </Canvas>
        {/* No per-model decorative overlays */}
      </div>
    );
  }
);

export default CarouselCanvas;
