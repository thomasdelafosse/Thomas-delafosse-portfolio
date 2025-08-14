import { useControls } from "leva";

export interface CarouselSettings {
  carouselRadius: number;
  modelScale: number;
  modelYOffset: number;
  hoverScaleMultiplier: number;
  carouselZOffset: number;
  cameraYExtraOffset: number;
  cameraYawOffsetDeg: number;
  syvaYExtraOffset: number;
  syvaYawOffsetDeg: number;
  syvaXExtraOffset: number;
  syvaZExtraOffset: number;
}

export function useCarouselSettings(): CarouselSettings {
  const settings = useControls("Carousel Settings", {
    carouselRadius: { value: 1, min: 1, max: 20, step: 0.5 },
    modelScale: { value: 0.7, min: 0.1, max: 5, step: 0.1 },
    modelYOffset: { value: -0.3, min: -5, max: 5, step: 0.1 },
    hoverScaleMultiplier: {
      value: 1,
      min: 1,
      max: 5,
      step: 0.1,
      label: "Hover Scale Multiplier",
    },
    carouselZOffset: {
      value: -0.15,
      min: -10,
      max: 10,
      step: 0.05,
      label: "Carousel Z Offset",
    },
    cameraYExtraOffset: {
      value: -0.2,
      min: -2,
      max: 2,
      step: 0.01,
      label: "camera.glb Y Offset",
    },
    cameraYawOffsetDeg: {
      value: 90,
      min: -180,
      max: 180,
      step: 1,
      label: "camera.glb Yaw Offset (deg)",
    },
    syvaYExtraOffset: {
      value: -0.14,
      min: -2,
      max: 2,
      step: 0.01,
      label: "syva.glb Y Offset",
    },
    syvaXExtraOffset: {
      value: -0.01,
      min: -10,
      max: 10,
      step: 0.01,
      label: "syva.glb X Offset",
    },
    syvaZExtraOffset: {
      value: -0.02,
      min: -10,
      max: 10,
      step: 0.01,
      label: "syva.glb Z Offset",
    },
    syvaYawOffsetDeg: {
      value: -88,
      min: -180,
      max: 180,
      step: 1,
      label: "syva.glb Yaw Offset (deg)",
    },
  });

  return settings as CarouselSettings;
}
