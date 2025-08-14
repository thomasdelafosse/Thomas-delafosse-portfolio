import { useEffect } from "react";
import { useProgress } from "@react-three/drei";

export function useOnModelProgress(
  onModelProgress?: (progress: number) => void
) {
  const { progress } = useProgress();

  useEffect(() => {
    if (onModelProgress) {
      onModelProgress(progress);
    }
  }, [progress, onModelProgress]);
}
