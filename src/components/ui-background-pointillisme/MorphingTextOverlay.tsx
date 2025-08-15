import OrthoCanvas from "./OrthoCanvas";
import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { useControls, folder } from "leva";
import { useFrame, useThree, invalidate } from "@react-three/fiber";
import {
  createParticleAttributes,
  generateTextPositions,
  getClampedDevicePixelRatio,
} from "./particles/utils";
import enterParticlesVertexShader from "./particles/shaders/enterParticlesVertexShader.glsl";
import enterParticlesFragmentShader from "./particles/shaders/enterParticlesFragmentShader.glsl";

type MorphingTextOverlayProps = {
  title: string | null;
  yOffset?: number;
  textScale?: number;
  position?: "fixed" | "absolute";
  className?: string;
  onMorphComplete?: () => void;
};

export default function MorphingTextOverlay({
  title,
  yOffset = 0.4,
  textScale = 1,
  position = "absolute",
  className,
  onMorphComplete,
}: MorphingTextOverlayProps) {
  const debug = useControls(
    "MorphingTextOverlay",
    {
      yOffset: { value: yOffset, min: -1, max: 1, step: 0.01 },
      textScale: { value: textScale, min: 0.1, max: 3, step: 0.01 },
      rendering: folder({
        particleCount: { value: 3000, min: 200, max: 10000, step: 100 },
        baseSize: { value: 2.6, min: 0.2, max: 10, step: 0.1 },
        dprMax: { value: 2, min: 1, max: 3, step: 0.5 },
      }),
      layout: folder({
        safeWidthPct: { value: 0.82, min: 0.3, max: 1, step: 0.01 },
        safeHeightPct: { value: 0.22, min: 0.05, max: 1, step: 0.01 },
        canvasW: { value: 400, min: 200, max: 1600, step: 10 },
        canvasH: { value: 270, min: 80, max: 800, step: 10 },
      }),
    },
    { collapsed: false }
  );
  if (!title) return null;
  return (
    <OrthoCanvas
      position={position}
      className={className}
      backgroundColor={null}
      glAlpha
      dpr={[1, 2]}
      frameloop="always"
      style={{ pointerEvents: "none" }}
    >
      <TextParticles
        key={title}
        text={title}
        yOffset={debug.yOffset}
        textScale={debug.textScale}
        particleCount={debug.particleCount}
        baseSize={debug.baseSize}
        dprMax={debug.dprMax}
        safeWidthPct={debug.safeWidthPct}
        safeHeightPct={debug.safeHeightPct}
        canvasW={debug.canvasW}
        canvasH={debug.canvasH}
        onMorphComplete={onMorphComplete}
      />
    </OrthoCanvas>
  );
}

function TextParticles({
  text,
  yOffset = 0,
  textScale = 0.55,
  particleCount = 3000,
  baseSize = 2.6,
  dprMax = 2,
  safeWidthPct = 0.8,
  safeHeightPct = 0.12,
  canvasW = 430,
  canvasH = 290,
  onMorphComplete,
}: {
  text: string;
  yOffset?: number;
  textScale?: number;
  particleCount?: number;
  baseSize?: number;
  dprMax?: number;
  safeWidthPct?: number;
  safeHeightPct?: number;
  canvasW?: number;
  canvasH?: number;
  onMorphComplete?: () => void;
}) {
  const { size, camera } = useThree();
  const ortho = camera as THREE.OrthographicCamera;
  const halfWidthWorld = size.width / ortho.zoom / 2;
  const halfHeightWorld = size.height / ortho.zoom / 2;

  const textPositions = useMemo(() => {
    return generateTextPositions(
      text.toUpperCase(),
      canvasW,
      canvasH,
      halfWidthWorld,
      halfHeightWorld
    );
  }, [text, halfWidthWorld, halfHeightWorld, canvasW, canvasH]);

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

  // Compute text bounds in world units to enable auto-fit scaling with margins
  const textBounds = useMemo(() => {
    if (textPositions.length === 0)
      return { width: 1, height: 1, centerX: 0, centerY: 0 };
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (let i = 0; i < textPositions.length; i += 3) {
      const x = textPositions[i + 0];
      const y = textPositions[i + 1];
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
    return {
      width: Math.max(0.0001, maxX - minX),
      height: Math.max(0.0001, maxY - minY),
      centerX: (minX + maxX) / 2,
      centerY: (minY + maxY) / 2,
    };
  }, [textPositions]);

  const fittedScale = useMemo(() => {
    // Fit within both width and height with margins
    const viewportWidth = halfWidthWorld * 2;
    const viewportHeight = halfHeightWorld * 2;
    const safeWidth = viewportWidth * safeWidthPct;
    const safeHeight = viewportHeight * safeHeightPct;
    const scaleByWidth = safeWidth / textBounds.width;
    const scaleByHeight = safeHeight / textBounds.height;
    const autoScale = Math.min(scaleByWidth, scaleByHeight);
    return Math.min(textScale, autoScale);
  }, [
    halfWidthWorld,
    halfHeightWorld,
    textBounds.width,
    textBounds.height,
    textScale,
    safeWidthPct,
    safeHeightPct,
  ]);

  const geometry = useMemo(() => new THREE.BufferGeometry(), []);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const targetOffsetRef = useRef(
    new THREE.Vector3(0, yOffset * halfHeightWorld, 0)
  );
  const morphRef = useRef(0);
  const notifiedRef = useRef(false);

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
    invalidate();
    return () => {
      geometry.dispose();
    };
  }, [geometry, startPositions, targetPositions, sizes]);

  useFrame((_, delta) => {
    const target = 1;
    const speed = 3;
    morphRef.current +=
      (target - morphRef.current) * (1 - Math.exp(-speed * delta));
    if (materialRef.current) {
      materialRef.current.uniforms.uMorph.value = morphRef.current;
      materialRef.current.uniforms.uTime.value += delta;
      materialRef.current.uniforms.uDevicePixelRatio.value =
        getClampedDevicePixelRatio(dprMax);
      materialRef.current.uniforms.uTargetOffset.value.copy(
        targetOffsetRef.current
      );
    }
    if (!notifiedRef.current && morphRef.current > 0.96) {
      notifiedRef.current = true;
      onMorphComplete?.();
    }
  });

  const uniforms = useMemo(
    () => ({
      uMorph: { value: 0 },
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(0xffffff) },
      uAlpha: { value: 0.9 },
      uBaseSize: { value: baseSize },
      uDevicePixelRatio: { value: getClampedDevicePixelRatio(dprMax) },
      uTargetOffset: {
        value: new THREE.Vector3(0, yOffset * halfHeightWorld, 0),
      },
      uTextScale: { value: fittedScale },
    }),
    [yOffset, halfHeightWorld, fittedScale, baseSize, dprMax]
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
