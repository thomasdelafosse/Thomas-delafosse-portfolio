import AboutMeSection from "./AboutMeSection";
import ContactSection from "./ContactSection";
import BackgroundParticles from "../ui-background-pointillisme/backgroundParticles2d";
import PointillismBackground from "@/components/ui-background-pointillisme/PointillismBackground";

interface InfoSectionTypes {
  onDiscoverProjects: () => void;
}

type InfoSectionProps = InfoSectionTypes & {
  showPointillismBackground?: boolean;
  showEnterMorph?: boolean;
};

const InfoSection = ({
  onDiscoverProjects,
  showPointillismBackground = true,
  showEnterMorph = true,
}: InfoSectionProps) => {
  const pointillistBackgroundStyle = {
    backgroundColor: "#0a0a0a",
  } as const;

  return (
    <div
      style={pointillistBackgroundStyle}
      className="fixed inset-0 z-40 flex flex-col items-center justify-center p-6 md:p-8 text-white cursor-pointer"
    >
      {showPointillismBackground && <BackgroundParticles />}
      {showEnterMorph && (
        <PointillismBackground
          position="absolute"
          showBackground={false}
          showEnterMorph
          onEnter={onDiscoverProjects}
        />
      )}

      <div className="p-6 bg-black/70 absolute z-30 bottom-14">
        <div className="flex flex-col md:flex-row gap-14">
          <AboutMeSection />
          <ContactSection />
        </div>
      </div>
    </div>
  );
};

export default InfoSection;
