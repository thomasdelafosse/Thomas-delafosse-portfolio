import { useState, useEffect } from "react";
import Head from "next/head";
import MainSection from "@/components/MainSection/MainSection";
import projectModelsData from "@/data/projectModels";
import IntroLoader from "@/components/IntroLoader/IntroLoader";
import InfoSection from "@/components/InfoSection/InfoSection";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import useMediaQueries from "@/hooks/useMediaQueries";
import PortraitWarning from "@/components/InfoSection/PortraitWarning";

export default function Home() {
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
    <>
      <Head>
        <title>Thomas Delafosse</title>
      </Head>
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
          <motion.button
            onClick={toggleMinimalInfo}
            className="fixed top-4 right-4 z-50 p-2 px-4 bg-black/70 rounded-[10px] shadow-lg text-white cursor-pointer"
            aria-label="Show info"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            About me
          </motion.button>
        )}
        {isLoading && modelLoadProgress < 100 && (
          <IntroLoader
            progress={modelLoadProgress}
            onLoaded={handleLoadingComplete}
          />
        )}
        <AnimatePresence>
          {infoVisible && (
            <InfoSection onDiscoverProjects={handleDiscoverProjects} />
          )}
        </AnimatePresence>
        <MainSection
          projectModels={projectModelsData}
          onModelProgress={handleModelProgressUpdate}
          style={{
            opacity: isLoading && modelLoadProgress < 100 ? 0 : 1,
            pointerEvents:
              isLoading && modelLoadProgress < 100 ? "none" : "auto",
            transition: "opacity 0.5s ease-in-out 0.3s",
          }}
        />
      </div>
    </>
  );
}
