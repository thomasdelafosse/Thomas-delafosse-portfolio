import { Canvas } from "@react-three/fiber";
import type { ReactNode, HTMLAttributes } from "react";

type OrthoCanvasProps = {
  position?: "fixed" | "absolute";
  className?: string;
  backgroundColor?: [number, number, number] | null;
  glAlpha?: boolean;
  cameraZoom?: number;
  cameraPosition?: [number, number, number];
  dpr?: [number, number];
  frameloop?: "always" | "demand" | "never";
  children: ReactNode;
} & HTMLAttributes<HTMLDivElement>;

export default function OrthoCanvas({
  position = "fixed",
  className,
  backgroundColor = [0.04, 0.04, 0.04],
  glAlpha = false,
  cameraZoom = 180,
  cameraPosition = [0, 0, 10],
  dpr = [1, 2],
  frameloop,
  children,
  ...containerProps
}: OrthoCanvasProps) {
  const containerClassName = [position, "inset-0", className ?? ""]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={containerClassName} {...containerProps}>
      <Canvas
        orthographic
        gl={glAlpha ? { alpha: true } : undefined}
        camera={{ position: cameraPosition, zoom: cameraZoom }}
        dpr={dpr}
        frameloop={frameloop}
        className="w-full h-full"
        style={{ position: "absolute", inset: 0 }}
      >
        {backgroundColor ? (
          <color attach="background" args={backgroundColor} />
        ) : null}
        {children}
      </Canvas>
    </div>
  );
}
