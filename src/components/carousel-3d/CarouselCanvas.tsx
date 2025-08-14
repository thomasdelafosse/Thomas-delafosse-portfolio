import {
  Suspense,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import CarouselScene from "./CarouselScene";
import {
  CarouselTypes,
  CarouselCanvasApi,
  CarouselSceneApi,
} from "@/types/types";
import CameraUpdater from "./CameraUpdater";
import SceneLighting from "./SceneLighting";
import { getWrappedIndex } from "./utils/math";
import { useFocusedModelInfo } from "@/hooks/useFocusedModelInfo";
import useSceneControls from "@/hooks/useSceneControls";
import { usePreloadGLTF } from "@/hooks/usePreloadGLTF";
import { useOnModelProgress } from "@/hooks/useOnModelProgress";

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
    const { cameraFov, cameraPosition } = useSceneControls();

    const { focusedModelInfo, handleFocusChange, currentIndex } =
      useFocusedModelInfo(models, onModelFocusStatusChange);

    useOnModelProgress(onModelProgress);

    usePreloadGLTF(models);

    useEffect(() => {
      onFocusedModelInfoChange?.(focusedModelInfo ?? null);
    }, [focusedModelInfo, onFocusedModelInfoChange]);

    const sceneRef = useRef<CarouselSceneApi | null>(null);

    const next = () => {
      if (!models.length) return;
      const target = getWrappedIndex(currentIndex, 1, models.length);
      sceneRef.current?.rotateToIndex(target);
    };

    const prev = () => {
      if (!models.length) return;
      const target = getWrappedIndex(currentIndex, -1, models.length);
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

          <Suspense fallback={null}>
            <CarouselScene
              ref={sceneRef}
              models={models}
              onFocusChange={handleFocusChange}
            />
          </Suspense>
          <SceneLighting />
        </Canvas>
      </div>
    );
  }
);

CarouselCanvas.displayName = "CarouselCanvas";

export default CarouselCanvas;
