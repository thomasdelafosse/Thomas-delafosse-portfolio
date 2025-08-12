import { motion } from "framer-motion";

import AboutMeSection from "./AboutMeSection";
import ContactSection from "./ContactSection";
import PointillismBackgroundMorphing from "@/components/ui-background-pointillisme/PointillismBackgroundMorphing";
import BackgroundParticlesCanvas from "@/components/ui-background-pointillisme/BackgroundParticlesCanvas";

interface InfoSectionTypes {
  onDiscoverProjects: () => void;
}

const InfoSection = ({ onDiscoverProjects }: InfoSectionTypes) => {
  const pointillistBackgroundStyle = {
    backgroundColor: "#0a0a0a",
  } as const;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      style={pointillistBackgroundStyle}
      className="fixed inset-0 z-40 flex flex-col items-center justify-center p-6 md:p-8 text-white cursor-pointer"
    >
      {/* Interactive pointillism shader background */}
      {/* Background particles only, but keep enter effect separate */}
      <BackgroundParticlesCanvas />
      {/* Optional enter overlay */}
      <PointillismBackgroundMorphing onEnter={onDiscoverProjects} />
      {/* Foreground info card */}
      <div className="p-6 bg-black/70 relative z-10">
        <div className="flex flex-col md:flex-row gap-14">
          <AboutMeSection />
          <ContactSection />
        </div>
      </div>
    </motion.div>
  );
};

export default InfoSection;
