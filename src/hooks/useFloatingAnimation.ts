import { useState, useEffect } from "react";

const useFloatingAnimation = (floatSpeed: number) => {
  const [animationTime, setAnimationTime] = useState(0);
  useEffect(() => {
    let animationFrameId: number;
    const animate = (timestamp: number) => {
      setAnimationTime(timestamp / 1000);
      animationFrameId = requestAnimationFrame(animate);
    };
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [floatSpeed]);
  return animationTime;
};

export default useFloatingAnimation;
