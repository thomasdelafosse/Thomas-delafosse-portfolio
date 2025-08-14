import OrthoCanvas from "./OrthoCanvas";
import { useMouseNdc } from "@/hooks/useMouseNdc";
import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree, invalidate } from "@react-three/fiber";
import {
  createParticleAttributes,
  generateTextPositions,
  getClampedDevicePixelRatio,
} from "./particles/utils";
import backgroundParticlesVertexShader from "./particles/shaders/backgroundParticlesVertexShader.glsl";
import backgroundParticlesFragmentShader from "./particles/shaders/backgroundParticlesFragmentShader.glsl";
import enterParticlesVertexShader from "./particles/shaders/enterParticlesVertexShader.glsl";
import enterParticlesFragmentShader from "./particles/shaders/enterParticlesFragmentShader.glsl";

type PointillismBackgroundProps = {
  position?: "fixed" | "absolute";
  className?: string;
  showBackground?: boolean;
  densityScale?: number;
  showEnterMorph?: boolean;
  onEnter?: () => void;
  yOffset?: number;
  textScale?: number;
};

export default function PointillismBackground({
  position = "fixed",
  className,
  showBackground = true,
  densityScale = 1,
  showEnterMorph = false,
  onEnter,
  yOffset = 0,
  textScale = 0.55,
}: PointillismBackgroundProps) {
  const { hovered, setHovered, mouseNdcRef, onMouseMove } = useMouseNdc();

  const bgColor = showBackground ? [0.04, 0.04, 0.04] : null;
  const allowAlpha = !showBackground;
  const pointerEventsStyle = showEnterMorph ? "auto" : "none";
  const containerClassName = [className ?? ""].filter(Boolean).join(" ");

  return (
    <OrthoCanvas
      position={position}
      className={containerClassName}
      backgroundColor={bgColor as unknown as [number, number, number] | null}
      glAlpha={allowAlpha}
      dpr={[1, 2]}
      frameloop={showBackground ? "demand" : undefined}
      onMouseEnter={showEnterMorph ? () => setHovered(true) : undefined}
      onMouseLeave={showEnterMorph ? () => setHovered(false) : undefined}
      onMouseMove={showEnterMorph ? onMouseMove : undefined}
      onClick={showEnterMorph ? onEnter : undefined}
      aria-label={showEnterMorph ? "Enter" : undefined}
      role={showEnterMorph ? "button" : undefined}
      tabIndex={showEnterMorph ? 0 : undefined}
      onKeyDown={
        showEnterMorph
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") onEnter?.();
            }
          : undefined
      }
      style={{ pointerEvents: pointerEventsStyle }}
    >
      {showBackground ? (
        <BackgroundParticlesInline countScale={densityScale} />
      ) : null}
      {showEnterMorph ? (
        <EnterParticlesInline
          hovered={hovered}
          yOffset={yOffset}
          mouseNdcRef={mouseNdcRef}
          textScale={textScale}
        />
      ) : null}
    </OrthoCanvas>
  );
}

type BackgroundParticlesProps = {
  count?: number;
  countScale?: number;
};

function BackgroundParticlesInline({
  count: countProp,
  countScale = 1,
}: BackgroundParticlesProps = {}) {
  const { size, camera } = useThree();
  const ortho = camera as THREE.OrthographicCamera;

  const defaultCount = size.width < 1024 ? 10000 : 20055;
  const count = Math.max(
    500,
    Math.floor(
      (typeof countProp === "number" ? countProp : defaultCount) * countScale
    )
  );

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    const halfW = size.width / ortho.zoom / 2;
    const halfH = size.height / ortho.zoom / 2;
    const nx = Math.max(
      8,
      Math.ceil(Math.sqrt((count * size.width) / size.height))
    );
    const ny = Math.max(8, Math.ceil(count / nx));
    const stepX = (halfW * 2) / nx;
    const stepY = (halfH * 2) / ny;
    let idx = 0;
    for (let j = 0; j < ny; j += 1) {
      for (let i = 0; i < nx; i += 1) {
        if (idx >= count) break;
        const x = -halfW + (i + 0.5) * stepX;
        const y = -halfH + (j + 0.5) * stepY;
        arr[idx * 3] = x;
        arr[idx * 3 + 1] = y;
        arr[idx * 3 + 2] = 0;
        idx += 1;
      }
    }
    return arr;
  }, [count, size.width, size.height, ortho.zoom]);

  const sizes = useMemo(() => {
    const arr = new Float32Array(count);
    for (let i = 0; i < count; i += 1) arr[i] = 0.9 + Math.random() * 0.2;
    return arr;
  }, [count]);

  const geometry = useMemo(() => new THREE.BufferGeometry(), []);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);

  useEffect(() => {
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );
    geometry.setAttribute("aSize", new THREE.Float32BufferAttribute(sizes, 1));
    geometry.computeBoundingSphere();
    invalidate();
    return () => geometry.dispose();
  }, [geometry, positions, sizes]);

  useEffect(() => {
    const updateDpr = () => {
      if (materialRef.current) {
        materialRef.current.uniforms.uDevicePixelRatio.value =
          getClampedDevicePixelRatio(2);
      }
      invalidate();
    };
    updateDpr();
    if (typeof window !== "undefined") {
      window.addEventListener("resize", updateDpr);
      return () => window.removeEventListener("resize", updateDpr);
    }
  }, []);

  const uniforms = useMemo(() => {
    const halfW = size.width / ortho.zoom / 2;
    const halfH = size.height / ortho.zoom / 2;
    const cyclesX = 3.0;
    const cyclesY = 2.0;
    const waveFreqX = (Math.PI * 2 * cyclesX) / (halfW * 2);
    const waveFreqY = (Math.PI * 2 * cyclesY) / (halfH * 2);
    return {
      uColor: { value: new THREE.Color(0xffffff) },
      uAlpha: { value: 0.45 },
      uBaseSize: { value: 3.0 },
      uDevicePixelRatio: { value: getClampedDevicePixelRatio(2) },
      uHalfH: { value: halfH },
      uBulge1: { value: new THREE.Vector2(-halfW * 0.33, -halfH * 0.05) },
      uBulge2: { value: new THREE.Vector2(halfW * 0.33, -halfH * 0.05) },
      uBulgeFalloff: { value: 0.015 },
      uBulgeStrength: { value: 1.15 },
      uWaveFreq: { value: new THREE.Vector2(waveFreqX, waveFreqY) },
      uWaveAmplitude: { value: 0.35 },
      uMinScale: { value: 0.25 },
      uMaxScale: { value: 3.2 },
    } as const;
  }, [size.width, size.height, ortho.zoom]);

  useEffect(() => {
    invalidate();
  }, [uniforms]);

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={materialRef}
        depthWrite={false}
        transparent
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={backgroundParticlesVertexShader}
        fragmentShader={backgroundParticlesFragmentShader}
      />
    </points>
  );
}

function EnterParticlesInline({
  hovered,
  yOffset = 0,
  mouseNdcRef,
  textScale = 0.55,
}: {
  hovered: boolean;
  yOffset?: number;
  mouseNdcRef: React.MutableRefObject<THREE.Vector2>;
  textScale?: number;
}) {
  const { size, camera } = useThree();
  const ortho = camera as THREE.OrthographicCamera;
  const halfWidthWorld = size.width / ortho.zoom / 2;
  const halfHeightWorld = size.height / ortho.zoom / 2;

  const particleCount = 3000;

  const textPositions = useMemo(() => {
    const w = 480;
    const h = 180;
    return generateTextPositions(
      "ENTER",
      w,
      h,
      halfWidthWorld,
      halfHeightWorld
    );
  }, [halfWidthWorld, halfHeightWorld]);

  const { startPositions, targetPositions, sizes } = useMemo(
    () =>
      createParticleAttributes(
        particleCount,
        halfWidthWorld,
        halfHeightWorld,
        textPositions
      ),
    [particleCount, halfWidthWorld, halfHeightWorld, textPositions]
  );

  const geometry = useMemo(() => new THREE.BufferGeometry(), []);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const targetOffsetRef = useRef(
    new THREE.Vector3(0, yOffset * halfHeightWorld, 0)
  );
  const morphRef = useRef(0);

  useEffect(() => {
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(startPositions, 3)
    );
    geometry.setAttribute(
      "aTarget",
      new THREE.Float32BufferAttribute(targetPositions, 3)
    );
    geometry.setAttribute("aSize", new THREE.Float32BufferAttribute(sizes, 1));
    geometry.computeBoundingSphere();
    return () => {
      geometry.dispose();
    };
  }, [geometry, startPositions, targetPositions, sizes]);

  useFrame((_, delta) => {
    const target = hovered ? 1 : 0;
    const speed = 3;
    morphRef.current +=
      (target - morphRef.current) * (1 - Math.exp(-speed * delta));
    if (materialRef.current) {
      materialRef.current.uniforms.uMorph.value = morphRef.current;
      materialRef.current.uniforms.uTime.value += delta;
      materialRef.current.uniforms.uDevicePixelRatio.value =
        getClampedDevicePixelRatio(2);
      const desiredX = mouseNdcRef.current.x * halfWidthWorld;
      const desiredY =
        mouseNdcRef.current.y * halfHeightWorld + yOffset * halfHeightWorld;
      const desired = new THREE.Vector3(desiredX, desiredY, 0);
      targetOffsetRef.current.lerp(desired, 1 - Math.exp(-8.0 * delta));
      materialRef.current.uniforms.uTargetOffset.value.copy(
        targetOffsetRef.current
      );
    }
  });

  const uniforms = useMemo(
    () => ({
      uMorph: { value: 0 },
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(0xffffff) },
      uAlpha: { value: 0.85 },
      uBaseSize: { value: 2.8 },
      uDevicePixelRatio: { value: getClampedDevicePixelRatio(2) },
      uTargetOffset: {
        value: new THREE.Vector3(0, yOffset * halfHeightWorld, 0),
      },
      uTextScale: { value: textScale },
    }),
    [yOffset, halfHeightWorld, textScale]
  );

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={materialRef}
        depthWrite={false}
        transparent
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={enterParticlesVertexShader}
        fragmentShader={enterParticlesFragmentShader}
      />
    </points>
  );
}
