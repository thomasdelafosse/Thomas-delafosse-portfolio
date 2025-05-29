import { useState, useEffect } from "react";
import MainSection from "@/components/MainSection/MainSection";
import projectModelsData from "@/data/projectModels";
import IntroLoader from "@/components/IntroLoader/IntroLoader";
import InfoSection from "@/components/InfoSection/InfoSection";
import { FaInfoCircle } from "react-icons/fa";
import Image from "next/image";
import useMediaQueries from "@/hooks/useMediaQueries";
import PortraitWarning from "@/components/InfoSection/PortraitWarning";

export default function Home() {
  const [isAnyModelFocused, setIsAnyModelFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [modelLoadProgress, setModelLoadProgress] = useState(0);
  const [showInfoManually, setShowInfoManually] = useState(false);

  const { isMobilePortrait } = useMediaQueries();

  const handleModelProgressUpdate = (progress: number) => {
    setModelLoadProgress(progress);
  };

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  const toggleMinimalInfo = () => {
    setShowInfoManually((prev) => !prev);
  };

  const handleDiscoverProjects = () => {
    handleLoadingComplete();
    setShowInfoManually(false);
  };

  useEffect(() => {
    if (isLoading || showInfoManually) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isLoading, showInfoManually]);

  const infoVisible =
    (isLoading && modelLoadProgress >= 100) || showInfoManually;

  if (isMobilePortrait) {
    return <PortraitWarning />;
  }

  return (
    <div className="relative flex flex-col min-h-screen bg-gradient-to-br from-gray-300 to-gray-700">
      <div className="absolute top-5 left-5 z-50">
        <Image
          src="/images/logoBlanc.png"
          alt="Portfolio Logo"
          width={80}
          height={50}
          priority
        />
      </div>
      {!isLoading && !infoVisible && (
        <button
          onClick={toggleMinimalInfo}
          className="fixed top-4 right-4 z-50 p-2 bg-opacity-20 hover:bg-opacity-30 rounded-full text-white transition-colors"
          aria-label="Show info"
        >
          <FaInfoCircle size={24} />
        </button>
      )}
      {isLoading && modelLoadProgress < 100 && (
        <IntroLoader
          progress={modelLoadProgress}
          onLoaded={handleLoadingComplete}
        />
      )}
      <InfoSection
        isVisible={infoVisible}
        onDiscoverProjects={handleDiscoverProjects}
      />
      <MainSection
        projectModels={projectModelsData}
        setIsAnyModelFocused={setIsAnyModelFocused}
        onModelProgress={handleModelProgressUpdate}
        style={{
          opacity: isLoading && modelLoadProgress < 100 ? 0 : 1,
          pointerEvents: isLoading && modelLoadProgress < 100 ? "none" : "auto",
          transition: "opacity 0.5s ease-in-out 0.3s",
        }}
      />
    </div>
  );
}
