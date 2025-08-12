import { useEffect, useMemo, useRef } from "react";
import { useThree, invalidate } from "@react-three/fiber";
import * as THREE from "three";
import { getClampedDevicePixelRatio } from "./utils";
import backgroundParticlesVertexShader from "./shaders/backgroundParticlesVertexShader.glsl";
import backgroundParticlesFragmentShader from "./shaders/backgroundParticlesFragmentShader.glsl";

type BackgroundParticlesProps = {
  // Optionally reduce or override the number of particles
  count?: number;
  countScale?: number; // multiplier applied to the default count
};

export function BackgroundParticles({
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
    // With frameloop="demand" on the hosting Canvas, ensure a frame is rendered
    // after we update geometry attributes.
    invalidate();
    return () => geometry.dispose();
  }, [geometry, positions, sizes]);

  // Update DPR only on mount and when the devicePixelRatio changes (rare)
  useEffect(() => {
    const updateDpr = () => {
      if (materialRef.current) {
        materialRef.current.uniforms.uDevicePixelRatio.value =
          getClampedDevicePixelRatio(2);
      }
      // Request a new frame so DPR changes become visible with frameloop="demand".
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
      uDevicePixelRatio: {
        value: getClampedDevicePixelRatio(2),
      },
      uHalfH: { value: halfH },
      uBulge1: { value: new THREE.Vector2(-halfW * 0.33, -halfH * 0.05) },
      uBulge2: { value: new THREE.Vector2(halfW * 0.33, -halfH * 0.05) },
      uBulgeFalloff: { value: 0.015 },
      uBulgeStrength: { value: 1.15 },
      uWaveFreq: { value: new THREE.Vector2(waveFreqX, waveFreqY) },
      uWaveAmplitude: { value: 0.35 },
      uMinScale: { value: 0.25 },
      uMaxScale: { value: 3.2 },
    };
  }, [size.width, size.height, ortho.zoom]);

  // Invalidate when uniforms change so the demand-based canvas renders an updated frame.
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
