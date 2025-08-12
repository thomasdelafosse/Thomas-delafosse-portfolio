import { Canvas } from "@react-three/fiber";
import { BackgroundParticles } from "./particles/BackgroundParticles";

type BackgroundParticlesCanvasProps = {
  // fixed: full-screen overlay; absolute: fill parent container only
  position?: "fixed" | "absolute";
  className?: string;
  // Reduce density for small sections like the info card
  densityScale?: number; // 1 keeps default, <1 reduces
};

export default function BackgroundParticlesCanvas({
  position = "fixed",
  className,
  densityScale = 1,
}: BackgroundParticlesCanvasProps) {
  const containerClassName = [
    position,
    "inset-0 z-0 pointer-events-none",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={containerClassName}>
      <Canvas
        orthographic
        camera={{ position: [0, 0, 10], zoom: 180 }}
        dpr={[1, 2]}
        frameloop="demand"
        className="w-full h-full"
        style={{ position: "absolute", inset: 0 }}
      >
        <color attach="background" args={[0.04, 0.04, 0.04]} />
        <BackgroundParticles countScale={densityScale} />
      </Canvas>
    </div>
  );
}
