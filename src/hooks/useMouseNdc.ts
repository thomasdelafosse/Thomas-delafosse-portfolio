import { useRef, useState, useCallback } from "react";
import * as THREE from "three";

export function useMouseNdc() {
  const mouseNdcRef = useRef(new THREE.Vector2(0, 0));
  const [hovered, setHovered] = useState(false);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    mouseNdcRef.current.set(x, y);
  }, []);

  return { mouseNdcRef, hovered, setHovered, onMouseMove } as const;
}
