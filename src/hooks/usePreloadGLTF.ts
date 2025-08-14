import { useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import type { ModelData } from "@/types/types";

export function usePreloadGLTF(models?: ModelData[]) {
  useEffect(() => {
    models?.forEach((m) => {
      if (m?.path) {
        try {
          useGLTF.preload(m.path);
        } catch {}
      }
    });
  }, [models]);
}
