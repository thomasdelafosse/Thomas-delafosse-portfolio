import BackgroundParticles from "@/components/ui-background-pointillisme/BackgroundParticles2d";
import PointillismBackground from "@/components/ui-background-pointillisme/PointillismBackground";
import AboutMeSection from "./AboutMeSection";
import ContactSection from "./ContactSection";
import Button from "@/components/ui/Button";

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
      className="fixed inset-0 z-40 flex flex-col items-center justify-center p-6 md:p-8 text-white md:cursor-pointer"
    >
      {showPointillismBackground && <BackgroundParticles />}
      {showEnterMorph && (
        <PointillismBackground
          className="hidden md:block"
          position="absolute"
          showBackground={false}
          showEnterMorph
          onEnter={onDiscoverProjects}
        />
      )}

      <div className="p-6 bg-black/60 absolute z-30 left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-[90vw] max-w-md md:max-w-none md:w-auto md:bottom-14 md:top-auto md:translate-y-0 md:left-auto md:translate-x-0">
        <div className="flex flex-col md:flex-row gap-14">
          <AboutMeSection />
          <ContactSection />
        </div>
      </div>

      <div className="md:hidden flex justify-center items-center absolute z-30 bottom-10  ">
        <Button onClick={onDiscoverProjects} variant="solid" aria-label="Enter">
          ENTER
        </Button>
      </div>
    </div>
  );
};

export default InfoSection;
