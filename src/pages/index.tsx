import { useState, useEffect } from "react";
import Footer from "@/components/Footer/Footer";
import NavBar from "@/components/NavBar/NavBar";
import Overlay from "@/components/Overlay/Overlay";
import MainSection from "@/components/MainSection/MainSection";
import projectModelsData from "@/data/projectModels";
import IntroLoader from "@/components/IntroLoader/IntroLoader";

export default function Home() {
  const [isAnyModelFocused, setIsAnyModelFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [modelLoadProgress, setModelLoadProgress] = useState(0);
  const isFooterVisible = !isAnyModelFocused && !isLoading;

  const handleModelProgressUpdate = (progress: number) => {
    setModelLoadProgress(progress);
    if (progress >= 100) {
    }
  };

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isLoading]);

  return (
    <div className="relative flex flex-col min-h-screen bg-gradient-to-br from-gray-300 to-gray-700">
      {isLoading && (
        <IntroLoader
          progress={modelLoadProgress}
          onLoaded={handleLoadingComplete}
        />
      )}
      <Overlay isVisible={isAnyModelFocused && !isLoading} />{" "}
      <NavBar
        style={{ opacity: isLoading ? 0 : 1, transition: "opacity 0.5s" }}
      />
      <MainSection
        projectModels={projectModelsData}
        setIsAnyModelFocused={setIsAnyModelFocused}
        onModelProgress={handleModelProgressUpdate}
        style={{
          opacity: isLoading ? 0 : 1,
          pointerEvents: isLoading ? "none" : "auto",
          transition: "opacity 0.5s ease-in-out 0.3s",
        }}
      />
      <Footer
        isVisible={isFooterVisible}
        style={{ opacity: isLoading ? 0 : 1, transition: "opacity 0.5s" }}
      />
    </div>
  );
}
