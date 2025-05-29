// Shared types for Carousel3D components

export interface ModelData {
  path: string;
  description: string;
  url: string;
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
  carouselRotationY: number;
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

export interface CarouselTypes {
  models: ModelData[];
  onModelFocusStatusChange?: (isFocused: boolean) => void;
  onModelProgress?: (progress: number) => void;
}
