import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface IntroLoaderTypes {
  progress: number;
  onLoaded: () => void;
}

const IntroLoader = ({ progress, onLoaded }: IntroLoaderTypes) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hue1, setHue1] = useState(220);
  const [hue2, setHue2] = useState(230);
  const gradientAnimationId = useRef<number | null>(null);

  const [assetsLoaded, setAssetsLoaded] = useState(false);

  useEffect(() => {
    if (progress >= 100) {
      if (!assetsLoaded) {
        setAssetsLoaded(true);
        onLoaded();
      }
    } else {
      if (assetsLoaded) {
        setAssetsLoaded(false);
      }
    }
  }, [progress, assetsLoaded, onLoaded]);

  useEffect(() => {
    const animateGradient = () => {
      setHue1((prevHue) => (prevHue + 0.2) % 360);
      setHue2((prevHue) => (prevHue + 0.3) % 360);
      gradientAnimationId.current = requestAnimationFrame(animateGradient);
    };
    gradientAnimationId.current = requestAnimationFrame(animateGradient);
    return () => {
      if (gradientAnimationId.current)
        cancelAnimationFrame(gradientAnimationId.current);
    };
  }, []);

  const gradientBackground = `linear-gradient(45deg, hsl(${hue1}, 15%, 25%), hsl(${hue2}, 10%, 45%))`;

  const loadingMessage = `Loading Assets... ${Math.round(progress)}%`;

  return (
    <div
      ref={mountRef}
      style={{ background: gradientBackground }}
      className="fixed top-0 left-0 w-screen h-screen flex justify-center items-center flex-col text-white text-2xl font-sans select-none z-[9999]"
    >
      <div className="absolute top-5 left-5 z-[10000]">
        <Image
          src="/images/logoBlanc.png"
          alt="Portfolio Logo"
          width={80}
          height={50}
          priority
        />
      </div>

      {/* Central content area */}
      <div className="flex flex-col items-center text-center">
        <div className="mb-[30px] text-bold text-2xl text-white/90 opacity-100 min-h-[1.2em] leading-[1.2em]">
          {loadingMessage}
        </div>
        {/* Loading Bar */}
        <div className="w-[250px] h-2 bg-white/20 rounded overflow-hidden mt-5">
          <div
            style={{ width: `${progress}%` }} // Dynamic width kept as inline style
            className="h-full bg-white/90 rounded transition-width duration-300 ease-out"
          />
        </div>
      </div>
    </div>
  );
};

export default IntroLoader;
