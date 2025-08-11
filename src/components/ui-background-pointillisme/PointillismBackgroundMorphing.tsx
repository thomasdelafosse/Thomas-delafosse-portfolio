import { useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { BackgroundParticles } from "./particles/BackgroundParticles";
import { EnterParticles } from "./particles/EnterParticles";

interface PointillismBackgroundMorphingProps {
  onEnter: () => void;
}

export default function PointillismBackgroundMorphing({
  onEnter,
}: PointillismBackgroundMorphingProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hovered, setHovered] = useState(false);
  const mouseNdcRef = useRef(new THREE.Vector2(0, 0));

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-screen h-screen z-0"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={(e) => {
        const rect = (
          e.currentTarget as HTMLDivElement
        ).getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
        mouseNdcRef.current.set(x, y);
      }}
      onClick={onEnter}
      aria-label="Enter"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onEnter();
      }}
    >
      <Canvas
        orthographic
        camera={{ position: [0, 0, 10], zoom: 180 }}
        className="w-full h-full"
        style={{ position: "absolute", inset: 0 }}
      >
        <color attach="background" args={[0.04, 0.04, 0.04]} />
        <BackgroundParticles />
        <EnterParticles
          hovered={hovered}
          yOffset={0}
          mouseNdcRef={mouseNdcRef}
          textScale={0.55}
        />
      </Canvas>
    </div>
  );
}
