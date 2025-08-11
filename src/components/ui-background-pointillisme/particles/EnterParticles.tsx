import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { MutableRefObject } from "react";
import * as THREE from "three";
import {
  createParticleAttributes,
  generateTextPositions,
  getClampedDevicePixelRatio,
} from "./utils";
import enterParticlesVertexShader from "./shaders/enterParticlesVertexShader.glsl";
import enterParticlesFragmentShader from "./shaders/enterParticlesFragmentShader.glsl";

export function EnterParticles({
  hovered,
  yOffset = 0,
  mouseNdcRef,
  textScale = 0.55,
}: {
  hovered: boolean;
  yOffset?: number;
  mouseNdcRef: MutableRefObject<THREE.Vector2>;
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
      uDevicePixelRatio: {
        value: getClampedDevicePixelRatio(2),
      },
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
