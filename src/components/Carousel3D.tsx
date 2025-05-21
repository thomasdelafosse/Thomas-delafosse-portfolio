import React, { useRef, useState, Suspense, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useControls, button, Leva } from "leva";

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

interface ModelProps {
  path: string;
  description: string;
  url: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale: number;
  hoverScaleMultiplier: number;
  modelIndex: number;
  numModels: number;
  carouselRotationY: number;
  onFocusChange: (description: string | null) => void;
}

function Model({
  path,
  description,
  url,
  position,
  rotation,
  scale,
  hoverScaleMultiplier,
  modelIndex,
  numModels,
  carouselRotationY,
  onFocusChange,
}: ModelProps) {
  const { scene } = useGLTF(path);
  const modelRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const wasInFocusRef = useRef<boolean | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const baseAngleInCarousel = (modelIndex / numModels) * Math.PI * 2;

  useFrame(() => {
    if (modelRef.current) {
      const model = modelRef.current;

      const baseRotX = rotation && rotation.length === 3 ? rotation[0] : 0;
      const baseRotY = rotation && rotation.length === 3 ? rotation[1] : 0;
      const baseRotZ = rotation && rotation.length === 3 ? rotation[2] : 0;

      const modelWorldPosition = new THREE.Vector3();
      model.getWorldPosition(modelWorldPosition);

      const modelAbsoluteAngleInCarousel =
        baseAngleInCarousel + carouselRotationY;
      const frontOfCarouselAngle = Math.PI / 2;

      let angleDifferenceFromFront =
        modelAbsoluteAngleInCarousel - frontOfCarouselAngle;
      angleDifferenceFromFront =
        THREE.MathUtils.euclideanModulo(
          angleDifferenceFromFront + Math.PI,
          Math.PI * 2
        ) - Math.PI;

      const FOCUS_THRESHOLD_ANGLE = Math.PI / 3.5;

      model.rotation.x = baseRotX;
      model.rotation.z = baseRotZ;

      const isInFocus =
        Math.abs(angleDifferenceFromFront) < FOCUS_THRESHOLD_ANGLE;

      if (wasInFocusRef.current !== isInFocus) {
        if (isInFocus) {
          console.log(
            `Model ENTERED focus: ${path}, DiffFromFront: ${angleDifferenceFromFront.toFixed(
              2
            )}`
          );
          onFocusChange(description);
        } else {
          console.log(
            `Model LEFT focus: ${path}, DiffFromFront: ${angleDifferenceFromFront.toFixed(
              2
            )}`
          );
          onFocusChange(null);
        }
        wasInFocusRef.current = isInFocus;
      }

      if (isInFocus) {
        const lookAtMatrix = new THREE.Matrix4();
        lookAtMatrix.lookAt(modelWorldPosition, camera.position, model.up);
        const targetWorldQuaternion =
          new THREE.Quaternion().setFromRotationMatrix(lookAtMatrix);

        const parentWorldQuaternion = new THREE.Quaternion();
        if (model.parent) {
          model.parent.matrixWorld.decompose(
            new THREE.Vector3(),
            parentWorldQuaternion,
            new THREE.Vector3()
          );

          const targetLocalQuaternion = parentWorldQuaternion
            .clone()
            .invert()
            .multiply(targetWorldQuaternion);

          const euler = new THREE.Euler().setFromQuaternion(
            targetLocalQuaternion,
            "YXZ"
          );

          let finalYRotation = euler.y;
          // Apply corrective rotations for specific models when in focus
          if (path.endsWith("/3Dzebre.glb")) {
            // Path includes leading /
            // finalYRotation -= (2 * Math.PI) / 3; // Correct by -120 degrees // User wants this fixed
          } else if (path.endsWith("/3Dchably.glb")) {
            // Path includes leading /
            finalYRotation += (2 * Math.PI) / 3; // Correct by +120 degrees
          } else if (path.endsWith("/5xt.glb")) {
            finalYRotation += (2 * Math.PI) / 3; // Correct by +120 degrees

            // No specific initial rotation for zebre, defaults to angle + Math.PI (facing center)
          }

          model.rotation.y = finalYRotation;
        } else {
          model.rotation.y = baseRotY;
        }
      } else {
        model.rotation.y = baseRotY;
      }
    }
  });

  const handlePointerOver = (event: any) => {
    event.stopPropagation();
    setIsHovered(true);
    document.body.style.cursor = "pointer";
  };

  const handlePointerOut = (event: any) => {
    event.stopPropagation();
    setIsHovered(false);
    document.body.style.cursor = "auto";
  };

  const handleClick = (event: any) => {
    event.stopPropagation();
    window.open(url, "_blank");
  };

  const actualScale = isHovered ? scale * hoverScaleMultiplier : scale;

  return (
    <primitive
      object={scene}
      ref={modelRef}
      position={position}
      rotation={rotation}
      scale={actualScale}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    />
  );
}

interface CarouselSceneProps {
  models: Array<{ path: string; description: string; url: string }>;
  onFocusChange: (description: string | null) => void;
}

function CarouselScene({ models = [], onFocusChange }: CarouselSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { gl } = useThree();

  const [currentYRotation, setCurrentYRotation] = useState(0.0);
  const dragStateRef = useRef({ isDragging: false, prevX: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const { carouselRadius, modelScale, modelYOffset, levaHoverScaleMultiplier } =
    useControls("Carousel Settings", {
      carouselRadius: {
        value: 0.5,
        min: 1,
        max: 20,
        step: 0.5,
      },
      modelScale: {
        value: 0.6,
        min: 0.1,
        max: 5,
        step: 0.1,
      },
      modelYOffset: {
        value: 0.3,
        min: -5,
        max: 5,
        step: 0.1,
      },
      levaHoverScaleMultiplier: {
        value: 1.3,
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
      setIsDragging(true);
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
        setIsDragging(false);
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
  }, [gl, setCurrentYRotation, setIsDragging, DRAG_SENSITIVITY]);

  return (
    <group ref={groupRef}>
      {models.map((model, index) => {
        const angle = (index / models.length) * Math.PI * 2;
        let currentModelInitialX = Math.cos(angle) * carouselRadius;
        let currentModelInitialZ = Math.sin(angle) * carouselRadius;
        let initialModelYRotation = angle + Math.PI;

        if (model.path.endsWith("/5xt.glb")) {
          currentModelInitialX = -2;
          currentModelInitialZ = 0;
        } else if (model.path.endsWith("/3Dchably.glb")) {
        } else if (model.path.endsWith("/3Dzebre.glb")) {
        }

        const finalX = currentModelInitialX - sceneCenter.x;
        const finalY = modelYOffset - sceneCenter.y;
        const finalZ = currentModelInitialZ - sceneCenter.z;

        return (
          <Model
            key={`${model.path}-${index}`}
            path={model.path}
            description={model.description}
            url={model.url}
            position={[finalX, finalY, finalZ]}
            rotation={[0, initialModelYRotation, 0]}
            scale={modelScale}
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
}

interface CarouselProps {
  models: Array<{ path: string; description: string; url: string }>;
  onModelFocusStatusChange?: (isFocused: boolean) => void;
}

const Carousel3D: React.FC<CarouselProps> = ({
  models,
  onModelFocusStatusChange,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [focusedModelDescription, setFocusedModelDescription] = useState<
    string | null
  >(null);
  const [isLandscapeMobile, setIsLandscapeMobile] = useState(false);

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

  useEffect(() => {
    if (onModelFocusStatusChange) {
      onModelFocusStatusChange(!!focusedModelDescription);
    }
  }, [focusedModelDescription, onModelFocusStatusChange]);

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(max-height: 500px) and (orientation: landscape)"
    );
    const handleChange = (e: MediaQueryListEvent | { matches: boolean }) => {
      setIsLandscapeMobile(e.matches);
    };

    // Initial check
    handleChange(mediaQuery);

    // Listener for changes
    // AddEventListener has a different signature for MediaQueryList in some environments.
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
    } else if (mediaQuery.addListener) {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleChange);
      } else if (mediaQuery.removeListener) {
        // Fallback for older browsers
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  const descriptionStyle: React.CSSProperties = {
    position: "absolute",
    left: isLandscapeMobile ? "2%" : "3%",
    top: isLandscapeMobile ? "80%" : "80%", // Adjusted top significantly for landscape to center it more
    transform: "translateY(-50%)", // Simpler transform, as top is now 50% in landscape
    color: "white",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: isLandscapeMobile ? "10px" : "20px",
    borderRadius: "10px",
    zIndex: 10,
    textAlign: "left",
    fontSize: isLandscapeMobile ? "0.7rem" : "0.9rem",
    fontFamily:
      "var(--font-geist-mono), Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    maxWidth: isLandscapeMobile ? "40%" : "70%", // Reduced max width more for landscape
    maxHeight: isLandscapeMobile ? "80vh" : "70vh", // Allow more height in landscape as width is constrained
    overflowY: "auto",
    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
    whiteSpace: "pre-line",
    opacity: focusedModelDescription ? 1 : 0,
    transition:
      "opacity 0.5s ease-in-out, transform 0.5s ease-in-out, padding 0.3s ease, font-size 0.3s ease, max-width 0.3s ease, max-height 0.3s ease, left 0.3s ease, top 0.3s ease",
    pointerEvents: focusedModelDescription ? "auto" : "none",
  };

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

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={false}
          target={[0, 0, 0]}
        />
        <Suspense fallback={null}>
          <CarouselScene
            models={models}
            onFocusChange={setFocusedModelDescription}
          />
        </Suspense>
      </Canvas>

      <div style={descriptionStyle}>{focusedModelDescription || ""}</div>
    </div>
  );
};

export default Carousel3D;
