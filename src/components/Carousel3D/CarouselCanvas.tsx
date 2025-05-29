import { Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useProgress, Environment } from "@react-three/drei";
import { Leva } from "leva";
import Link from "next/link";
import CarouselScene from "./CarouselScene";
import BackgroundController from "./BackgroundController";
import { CarouselTypes } from "@/types/types";
import useMediaQueries from "@/hooks/useMediaQueries";
import FloatingPlanets from "./FloatingPlanets";
import useFloatingAnimation from "@/hooks/useFloatingAnimation";
import CameraUpdater from "./CameraUpdater";
import { useFocusedModelInfo } from "@/hooks/useFocusedModelInfo";
import useBodyOverflowOnFocus from "@/hooks/useBodyOverflowOnFocus";
import useSceneControls from "@/hooks/useSceneControls";

const CarouselCanvas = ({
  models,
  onModelFocusStatusChange,
  onModelProgress,
}: CarouselTypes) => {
  const { isLandscape, isMobileOrTablet } = useMediaQueries();
  const isLandscapeMobile = isLandscape && isMobileOrTablet;
  const animationTime = useFloatingAnimation(1.2);
  const { ambientLightIntensity, cameraFov, cameraPosition } =
    useSceneControls();

  const { focusedModelInfo, handleFocusChange, currentIndex } =
    useFocusedModelInfo(models, onModelFocusStatusChange);
  useBodyOverflowOnFocus(isLandscapeMobile, focusedModelInfo);

  const { progress } = useProgress();

  useEffect(() => {
    if (onModelProgress) {
      onModelProgress(progress);
    }
  }, [progress, onModelProgress]);

  const showCornerPlanets =
    !!focusedModelInfo?.path?.endsWith("/models/5xt.glb");

  let descriptionContent;
  const descriptionText = focusedModelInfo?.description || "";

  if (descriptionText) {
    const linkRegex =
      /([\s\S]*?)<Link href='([^']*)' target='_blank' rel='noopener noreferrer'>([^<]*)<\/Link>([\s\S]*)/;
    const match = descriptionText.match(linkRegex);

    if (match) {
      const [, textBefore, href, linkText, textAfter] = match;
      descriptionContent = (
        <>
          {textBefore}
          <Link
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-400"
          >
            {linkText}
          </Link>
          {textAfter}
        </>
      );
    } else {
      descriptionContent = descriptionText;
    }
  } else {
    descriptionContent = "";
  }

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
      }}
    >
      <Leva
        hidden={true}
        collapsed={true}
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

      <Canvas camera={{ position: cameraPosition, fov: cameraFov }}>
        <CameraUpdater />
        <ambientLight intensity={ambientLightIntensity} />

        <BackgroundController
          focusedPath={focusedModelInfo?.path}
          videoTexturePath="/images/mathieuLg/texture_noir1.mp4"
          videoTexturePathChably="/images/maisonMine/texture_beige.mp4"
          models={models}
        />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={false}
          target={[0, 0, 0]}
        />
        <Suspense fallback={null}>
          <CarouselScene models={models} onFocusChange={handleFocusChange} />
        </Suspense>
        <Environment preset="sunset" />
      </Canvas>
      <div
        className={`absolute z-10 text-left bg-black/70 text-white rounded-[10px] shadow-lg whitespace-pre-line overflow-y-auto transition-all duration-500 ease-in-out font-medium text-3xl
          ${
            isLandscapeMobile
              ? "left-[2%] top-[80%] p-[10px] text-[0.7rem] max-w-[40%] max-h-[80vh]"
              : "left-[3%] top-[80%] p-[20px] text-[0.9rem] max-w-[70%] max-h-[70vh]"
          }
          ${
            focusedModelInfo?.description
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }
        `}
        style={{ transform: "translateY(-50%)" }}
      >
        {descriptionContent}
      </div>
      <FloatingPlanets
        show={showCornerPlanets}
        isLandscapeMobile={isLandscapeMobile}
        animationTime={animationTime}
      />
    </div>
  );
};

export default CarouselCanvas;
