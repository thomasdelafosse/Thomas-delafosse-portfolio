import React, { useRef, useState, Suspense, useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  useTexture,
  Plane,
  Billboard,
} from "@react-three/drei";
import * as THREE from "three";
import { useControls, button, Leva } from "leva";

// New component for the starfield effect
function Starfield({ count = 5000 }) {
  const pointsRef = useRef<THREE.Points>(null!); // Use ref to access points object

  const [geometry, material] = useMemo(() => {
    const vertices = [];
    const colors = [];
    const animationPhases = []; // For individual twinkle animation

    const baseColor = new THREE.Color(0xffffff);

    for (let i = 0; i < count; i++) {
      const r = THREE.MathUtils.randFloat(50, 100);
      const phi = Math.random() * Math.PI * 2;
      const theta = Math.random() * Math.PI;
      const x = r * Math.sin(theta) * Math.cos(phi);
      const y = r * Math.sin(theta) * Math.sin(phi);
      const z = r * Math.cos(theta);
      vertices.push(x, y, z);

      colors.push(baseColor.r, baseColor.g, baseColor.b);
      animationPhases.push(Math.random() * Math.PI * 2); // Random phase for each star
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3)
    );
    geom.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geom.setAttribute(
      "animationPhase",
      new THREE.Float32BufferAttribute(animationPhases, 1)
    );

    const mat = new THREE.PointsMaterial({
      size: 0.3,
      transparent: true,
      opacity: 0.9, // Slightly more opaque for better twinkle visibility
      sizeAttenuation: true,
      vertexColors: true, // Enable vertex colors
    });
    return [geom, mat];
  }, [count]);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      const geom = pointsRef.current.geometry as THREE.BufferGeometry;
      const colorAttribute = geom.attributes.color as THREE.BufferAttribute;
      const phaseAttribute = geom.attributes
        .animationPhase as THREE.BufferAttribute;
      const time = state.clock.elapsedTime;

      const twinkleSpeed = 3.0; // Speed of the twinkle oscillation
      const twinklePower = 5.0; // Higher power = sharper, briefer bright phase
      const minBrightness = 0.1; // Minimum brightness of a star
      const maxBrightness = 1.0; // Maximum brightness of a star

      for (let i = 0; i < count; i++) {
        const phase = phaseAttribute.getX(i);

        // Normalize sine wave output to 0-1 range
        const normalizedSine = (Math.sin(time * twinkleSpeed + phase) + 1) / 2;

        // Apply power to create sharp peaks (star spends more time dim)
        const poweredSine = Math.pow(normalizedSine, twinklePower);

        // Map to desired brightness range
        const twinkleFactor =
          poweredSine * (maxBrightness - minBrightness) + minBrightness;

        colorAttribute.setXYZ(i, twinkleFactor, twinkleFactor, twinkleFactor);
      }
      colorAttribute.needsUpdate = true;
      // Optional: Rotate the whole starfield slowly
      // pointsRef.current.rotation.y += delta * 0.01;
    }
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}

const PLANET_IMAGE_PATHS = [
  "/images/sweetSpot/planets2.webp", // For Top-left
  "/images/sweetSpot/planets3.webp", // For Top-right
  "/images/sweetSpot/planets.webp", // For Bottom-left
  "/images/sweetSpot/planets4.webp", // For Bottom-right
];

// Renamed back to StarfieldAndBackgroundController, only handles BG and Starfield
function StarfieldAndBackgroundController({
  focusedPath,
}: {
  focusedPath: string | null | undefined;
}) {
  const { scene } = useThree();

  useEffect(() => {
    const is5xtFocused = focusedPath?.endsWith("/5xt.glb");
    if (is5xtFocused) {
      scene.background = new THREE.Color("black");
    } else {
      scene.background = null; // Revert to default (transparent/gradient from lighting)
    }
    return () => {
      scene.background = null;
    };
  }, [focusedPath, scene]);

  if (focusedPath?.endsWith("/5xt.glb")) {
    return <Starfield />;
  }
  return null;
}

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
  onFocusChange: (focusData: {
    description: string | null;
    path: string | null;
  }) => void;
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
          onFocusChange({ description: description, path: path });
        } else {
          console.log(
            `Model LEFT focus: ${path}, DiffFromFront: ${angleDifferenceFromFront.toFixed(
              2
            )}`
          );
          onFocusChange({ description: null, path: null });
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

  const handlePointerOver = (event: React.PointerEvent<THREE.Object3D>) => {
    event.stopPropagation();
    setIsHovered(true);
    document.body.style.cursor = "pointer";
  };

  const handlePointerOut = (event: React.PointerEvent<THREE.Object3D>) => {
    event.stopPropagation();
    setIsHovered(false);
    document.body.style.cursor = "auto";
  };

  const handleClick = (event: React.MouseEvent<THREE.Object3D>) => {
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
  onFocusChange: (focusData: {
    description: string | null;
    path: string | null;
  }) => void;
}

function CarouselScene({ models = [], onFocusChange }: CarouselSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { gl } = useThree();

  const [currentYRotation, setCurrentYRotation] = useState(0.0);
  const dragStateRef = useRef({ isDragging: false, prevX: 0 });

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
  }, [gl, setCurrentYRotation, DRAG_SENSITIVITY]);

  return (
    <group ref={groupRef}>
      {models.map((model, index) => {
        const angle = (index / models.length) * Math.PI * 2;
        let currentModelInitialX = Math.cos(angle) * carouselRadius;
        let currentModelInitialZ = Math.sin(angle) * carouselRadius;
        const initialModelYRotation = angle + Math.PI;

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
  const [focusedModelInfo, setFocusedModelInfo] = useState<{
    description: string | null;
    path: string | null;
  } | null>(null);
  const [isLandscapeMobile, setIsLandscapeMobile] = useState(false);
  const [animationTime, setAnimationTime] = useState(0); // New state for animation

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

  // New handler for focus changes
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
    opacity: focusedModelInfo?.description ? 1 : 0,
    transition:
      "opacity 0.5s ease-in-out, transform 0.5s ease-in-out, padding 0.3s ease, font-size 0.3s ease, max-width 0.3s ease, max-height 0.3s ease, left 0.3s ease, top 0.3s ease",
    pointerEvents: focusedModelInfo?.description ? "auto" : "none",
  };

  const showCornerPlanets = focusedModelInfo?.path?.endsWith("/5xt.glb");

  const cornerImageBaseStyle: React.CSSProperties = {
    position: "absolute",
    width: "200px", // Adjust size as needed
    height: "200px", // Adjust size as needed
    objectFit: "contain",
    zIndex: 5, // Above canvas, potentially adjust if other UI overlaps
    transition: "opacity 0.5s ease-in-out",
    opacity: showCornerPlanets ? 1 : 0,
    pointerEvents: showCornerPlanets ? "auto" : "none",
  };

  // Animation parameters
  const floatAmplitude = 5; // Max pixels to move up/down
  const floatSpeed = 1.2; // Controls the speed of the floating

  const planetImageStyles: React.CSSProperties[] = [
    {
      // Top-left
      ...cornerImageBaseStyle,
      top: "20px",
      left: "20px",
      transform: `translateY(${
        Math.sin(animationTime * floatSpeed) * floatAmplitude
      }px)`,
    },
    {
      // Top-right
      ...cornerImageBaseStyle,
      top: "20px",
      right: "20px",
      transform: `translateY(${
        Math.sin(animationTime * floatSpeed + Math.PI / 2) * floatAmplitude
      }px)`,
    },
    {
      // Bottom-left
      ...cornerImageBaseStyle,
      bottom: "20px",
      left: "20px",
      transform: `translateY(${
        Math.sin(animationTime * floatSpeed + Math.PI) * floatAmplitude
      }px)`,
    },
    {
      // Bottom-right
      ...cornerImageBaseStyle,
      bottom: "20px",
      right: "20px",
      transform: `translateY(${
        Math.sin(animationTime * floatSpeed + (3 * Math.PI) / 2) *
        floatAmplitude
      }px)`,
    },
  ];

  // Effect for animation loop
  useEffect(() => {
    let animationFrameId: number;
    const animate = (timestamp: number) => {
      setAnimationTime(timestamp / 1000); // Convert to seconds for smoother speed control
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

        {/* Controller for background and starfield based on focus */}
        <StarfieldAndBackgroundController
          focusedPath={focusedModelInfo?.path}
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

      {/* 2D Planet Images in Corners */}
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
