// Shared types for Carousel3D components

export interface ModelData {
  path: string;
  description: string;
  url: string;
}

export interface InteractiveGridProps {
  size: number;
  divisions: number;
  models: ModelData[];
}

export interface ModelProps extends ModelData {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale: number;
  hoverScaleMultiplier: number;
  modelIndex: number;
  numModels: number;
  carouselRotationY: number;
  onFocusChange: (focusData: {
    description: string | null;
    path: string | null;
  }) => void;
}

export interface CarouselSceneProps {
  models: ModelData[];
  onFocusChange: (focusData: {
    description: string | null;
    path: string | null;
  }) => void;
}

export interface CarouselProps {
  models: ModelData[];
  onModelFocusStatusChange?: (isFocused: boolean) => void;
}
