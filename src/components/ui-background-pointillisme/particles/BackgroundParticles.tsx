import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { getClampedDevicePixelRatio } from "./utils";
import backgroundParticlesVertexShader from "./shaders/backgroundParticlesVertexShader.glsl";
import backgroundParticlesFragmentShader from "./shaders/backgroundParticlesFragmentShader.glsl";

export function BackgroundParticles() {
  const { size, camera } = useThree();
  const ortho = camera as THREE.OrthographicCamera;

  const count = size.width < 1024 ? 10000 : 20055;

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
    return () => geometry.dispose();
  }, [geometry, positions, sizes]);

  useFrame(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uDevicePixelRatio.value =
        getClampedDevicePixelRatio(2);
    }
  });

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
