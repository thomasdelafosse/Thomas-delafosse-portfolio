// Shared types for Carousel3D components
import type { MutableRefObject } from "react";

export interface ModelData {
  path: string;
  description: string;
  url: string;
  title?: string;
}

// Added FocusData back for use in useFocusedModelInfo state
export interface FocusData {
  description: string | null;
  path: string | null; // Path can be null initially or if no models
}

export interface InteractiveGridTypes {
  size: number;
  divisions: number;
  models: ModelData[];
}

export interface ModelTypes extends ModelData {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale: number;
  hoverScaleMultiplier: number;
  modelIndex: number;
  numModels: number;
  carouselRotationRef: MutableRefObject<number>;
  onFocusChange: (
    focusData: {
      description: string | null;
      path: string;
    },
    modelIndex: number
  ) => void;
}

export interface CarouselSceneTypes {
  models: ModelData[];
  onFocusChange: (
    focusData: {
      description: string | null;
      path: string;
    },
    modelIndex: number
  ) => void;
}

// Imperative API exposed by the 3D carousel scene so parent can rotate programmatically
export interface CarouselSceneApi {
  rotateToIndex: (index: number) => void;
}

export interface CarouselTypes {
  models: ModelData[];
  onModelFocusStatusChange?: (isFocused: boolean) => void;
  onModelProgress?: (progress: number) => void;
  // Notify parent when the focused model changes so it can render details elsewhere
  onFocusedModelInfoChange?: (info: FocusData | null) => void;
  // Optional: allow child to request scrolling to the details section
  onScrollToInfo?: () => void;
}

// Imperative API exposed by the canvas wrapper to navigate between models
export interface CarouselCanvasApi {
  next: () => void;
  prev: () => void;
}
