import React, { useState, useEffect, Suspense } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Leva, useControls, button } from "leva";
import * as THREE from "three";
import CarouselScene from "./CarouselScene";
import BackgroundController from "./BackgroundController";
import { CarouselProps } from "@/types/types";

const PLANET_IMAGE_PATHS = [
  "/images/sweetSpot/planets2.webp",
  "/images/sweetSpot/planets3.webp",
  "/images/sweetSpot/planets.webp",
  "/images/sweetSpot/planets4.webp",
];

function CameraUpdater() {
  const { camera, size } = useThree();
  useEffect(() => {
    if (size.width > 0 && size.height > 0) {
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.aspect = size.width / size.height;
        camera.updateProjectionMatrix();
      }
    }
  }, [size, camera]);
  return null;
}

const Carousel3D: React.FC<CarouselProps> = ({
  models,
  onModelFocusStatusChange,
}) => {
  const [focusedModelInfo, setFocusedModelInfo] = useState<{
    description: string | null;
    path: string | null;
  } | null>(null);
  const [isLandscapeMobile, setIsLandscapeMobile] = useState(false);
  const [animationTime, setAnimationTime] = useState(0);
  const {
    ambientLightIntensity,
    pointLightIntensity,
    pointLightPosition,
    cameraFov,
    cameraPosition,
  } = useControls("Scene Controls", {
    ambientLightIntensity: { value: 2.0, min: 0, max: 2, step: 0.1 },
    pointLightIntensity: { value: 5.0, min: 0, max: 5, step: 0.1 },
    pointLightPosition: { value: [10, 10, 10], step: 1 },
    cameraFov: { value: 10, min: 10, max: 120, step: 1 },
    cameraPosition: { value: [2.0, 2.0, 10.0], step: 0.5 },
    OrbitControls: button(() =>
      console.log("OrbitControls enabled/disabled state could be managed here")
    ),
  });
  const handleFocusChange = (
    focusData: { description: string | null; path: string | null } | null
  ) => {
    setFocusedModelInfo(focusData);
    if (onModelFocusStatusChange) {
      onModelFocusStatusChange(!!focusData?.description);
    }
  };
  useEffect(() => {
    if (onModelFocusStatusChange) {
      onModelFocusStatusChange(!!focusedModelInfo?.description);
    }
  }, [focusedModelInfo, onModelFocusStatusChange]);
  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(max-height: 500px) and (orientation: landscape)"
    );
    const handleChange = (e: MediaQueryListEvent | { matches: boolean }) => {
      setIsLandscapeMobile(e.matches);
    };
    handleChange(mediaQuery);
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
    }
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleChange);
      } else if (mediaQuery.removeListener) {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);
  useEffect(() => {
    if (isLandscapeMobile && focusedModelInfo?.description) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isLandscapeMobile, focusedModelInfo?.description]);
  const descriptionStyle: React.CSSProperties = {
    position: "absolute",
    left: isLandscapeMobile ? "2%" : "3%",
    top: isLandscapeMobile ? "80%" : "80%",
    transform: "translateY(-50%)",
    color: "white",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: isLandscapeMobile ? "10px" : "20px",
    borderRadius: "10px",
    zIndex: 10,
    textAlign: "left",
    fontSize: isLandscapeMobile ? "0.7rem" : "0.9rem",
    fontFamily:
      "var(--font-geist-mono), Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    maxWidth: isLandscapeMobile ? "40%" : "70%",
    maxHeight: isLandscapeMobile ? "80vh" : "70vh",
    overflowY: "auto",
    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
    whiteSpace: "pre-line",
    opacity: focusedModelInfo?.description ? 1 : 0,
    transition:
      "opacity 0.5s ease-in-out, transform 0.5s ease-in-out, padding 0.3s ease, font-size 0.3s ease, max-width 0.3s ease, max-height 0.3s ease, left 0.3s ease, top 0.3s ease",
    pointerEvents: isLandscapeMobile
      ? "auto"
      : focusedModelInfo?.description
      ? "auto"
      : "none",
  };
  const showCornerPlanets = focusedModelInfo?.path?.endsWith("/5xt.glb");
  const cornerImageBaseStyle: React.CSSProperties = {
    position: "absolute",
    width: isLandscapeMobile ? "150px" : "200px",
    height: isLandscapeMobile ? "150px" : "200px",
    objectFit: "contain",
    zIndex: 5,
    transition: "opacity 0.5s ease-in-out",
    opacity: showCornerPlanets ? 1 : 0,
    pointerEvents: isLandscapeMobile
      ? "auto"
      : showCornerPlanets
      ? "auto"
      : "none",
  };
  const floatAmplitude = 5;
  const floatSpeed = 1.2;
  const planetImageStyles: React.CSSProperties[] = [
    {
      ...cornerImageBaseStyle,
      top: "20px",
      left: "20px",
      transform: `translateY(${
        Math.sin(animationTime * floatSpeed) * floatAmplitude
      }px)`,
    },
    {
      ...cornerImageBaseStyle,
      top: "20px",
      right: "20px",
      transform: `translateY(${
        Math.sin(animationTime * floatSpeed + Math.PI / 2) * floatAmplitude
      }px)`,
    },
    {
      ...cornerImageBaseStyle,
      bottom: "20px",
      left: "20px",
      transform: `translateY(${
        Math.sin(animationTime * floatSpeed + Math.PI) * floatAmplitude
      }px)`,
    },
    {
      ...cornerImageBaseStyle,
      bottom: "20px",
      right: "20px",
      transform: `translateY(${
        Math.sin(animationTime * floatSpeed + (3 * Math.PI) / 2) *
        floatAmplitude
      }px)`,
    },
  ];
  useEffect(() => {
    let animationFrameId: number;
    const animate = (timestamp: number) => {
      setAnimationTime(timestamp / 1000);
      animationFrameId = requestAnimationFrame(animate);
    };
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);
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
      <Leva hidden={true} />
      <Canvas camera={{ position: cameraPosition, fov: cameraFov }}>
        <CameraUpdater />
        <ambientLight intensity={ambientLightIntensity} />
        <pointLight
          position={new THREE.Vector3(...pointLightPosition)}
          intensity={pointLightIntensity}
        />
        <BackgroundController
          focusedPath={focusedModelInfo?.path}
          videoTexturePath="/images/mathieuLg/texture_noir.mp4"
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
      </Canvas>
      <div style={descriptionStyle}>{focusedModelInfo?.description || ""}</div>
      {PLANET_IMAGE_PATHS.map((path, index) => (
        <img
          key={`planet-${index}`}
          src={path}
          alt={`Planet ${index + 1}`}
          style={planetImageStyles[index]}
        />
      ))}
    </div>
  );
};

export default Carousel3D;
