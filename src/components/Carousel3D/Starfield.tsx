import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Starfield component
const Starfield: React.FC<{ count?: number }> = ({ count = 5000 }) => {
  const pointsRef = useRef<THREE.Points>(null!);

  const [geometry, material] = useMemo(() => {
    const vertices = [];
    const colors = [];
    const animationPhases = [];
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
      animationPhases.push(Math.random() * Math.PI * 2);
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
      opacity: 0.9,
      sizeAttenuation: true,
      vertexColors: true,
    });
    return [geom, mat];
  }, [count]);

  useFrame((state) => {
    if (pointsRef.current) {
      const geom = pointsRef.current.geometry as THREE.BufferGeometry;
      const colorAttribute = geom.attributes.color as THREE.BufferAttribute;
      const phaseAttribute = geom.attributes
        .animationPhase as THREE.BufferAttribute;
      const time = state.clock.elapsedTime;
      const twinkleSpeed = 3.0;
      const twinklePower = 5.0;
      const minBrightness = 0.1;
      const maxBrightness = 1.0;
      for (let i = 0; i < count; i++) {
        const phase = phaseAttribute.getX(i);
        const normalizedSine = (Math.sin(time * twinkleSpeed + phase) + 1) / 2;
        const poweredSine = Math.pow(normalizedSine, twinklePower);
        const twinkleFactor =
          poweredSine * (maxBrightness - minBrightness) + minBrightness;
        colorAttribute.setXYZ(i, twinkleFactor, twinkleFactor, twinkleFactor);
      }
      colorAttribute.needsUpdate = true;
    }
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
};

export default Starfield;
