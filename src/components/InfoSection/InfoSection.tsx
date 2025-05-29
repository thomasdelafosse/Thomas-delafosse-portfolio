import { useState, useEffect, useRef } from "react";
import AboutMeSection from "./AboutMeSection";
import ContactSection from "./ContactSection";

interface InfoSectionTypes {
  isVisible: boolean;
  onDiscoverProjects: () => void;
}

const InfoSection = ({ isVisible, onDiscoverProjects }: InfoSectionTypes) => {
  const [hue1, setHue1] = useState(220);
  const [hue2, setHue2] = useState(230);
  const gradientAnimationId = useRef<number | null>(null);

  useEffect(() => {
    const animateGradient = () => {
      setHue1((prevHue) => (prevHue + 0.2) % 360);
      setHue2((prevHue) => (prevHue + 0.3) % 360);
      gradientAnimationId.current = requestAnimationFrame(animateGradient);
    };
    if (isVisible) {
      gradientAnimationId.current = requestAnimationFrame(animateGradient);
    }
    return () => {
      if (gradientAnimationId.current) {
        cancelAnimationFrame(gradientAnimationId.current);
      }
    };
  }, [isVisible]);

  if (!isVisible) {
    return null;
  }

  const gradientBackground = `linear-gradient(45deg, hsl(${hue1}, 15%, 25%), hsl(${hue2}, 10%, 45%))`;

  return (
    <div
      style={{ background: gradientBackground }}
      className="fixed inset-0 z-40 flex flex-col items-center justify-center p-6 md:p-8 text-white transition-opacity duration-300 ease-in-out"
    >
      <div className="w-full max-w-10xl flex flex-col items-center gap-8 p-10 md:p-12  rounded-xl shadow-2xl ">
        <div className="flex flex-col md:flex-row gap-10 md:gap-16 w-full justify-between">
          <AboutMeSection headingClassName="text-3xl font-semibold " />
          <ContactSection />
        </div>
      </div>
      <button
        onClick={onDiscoverProjects}
        style={{
          background: gradientBackground,
        }}
        className="mt-8 px-6 py-3.5 text-white hover:text-white/80 cursor-pointer font-medium text-lg rounded-lg shadow-2xl transform hover:scale-105 transition-all duration-200 ease-in-out  "
      >
        Discover my projects
      </button>
    </div>
  );
};

export default InfoSection;
