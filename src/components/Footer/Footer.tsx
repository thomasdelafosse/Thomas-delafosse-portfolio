import { useState } from "react";
import localFont from "next/font/local";
import PortraitWarning from "./PortraitWarning";
import AboutMeButton from "./AboutMeButton";
import CloseButton from "./CloseButton";
import AboutMeSection from "./AboutMeSection";
import ContactSection from "./ContactSection";
import useMediaQueries from "../../hooks/useMediaQueries";
import useAnimatedVisibility from "../../hooks/useAnimatedVisibility";

const Birthstone = localFont({
  src: "../../../public/fonts/Birthstone-Regular.ttf",
  variable: "--font-Birthstone",
});

interface FooterProps {
  isVisible: boolean;
}

const ANIMATION_DURATION = 500; // ms

const Footer = ({ isVisible }: FooterProps) => {
  const { isMobilePortrait, isLandscape, isMobileOrTablet } = useMediaQueries();
  const [footerHidden, setFooterHidden] = useState(false);

  // AboutMe button animation logic
  const aboutMeActive = footerHidden && isLandscape && isMobileOrTablet;
  const {
    show: showAboutMe,
    visible: aboutMeVisible,
    leaving: aboutMeLeaving,
    setLeaving: setAboutMeLeaving,
    setShow: setShowAboutMe,
    setVisible: setAboutMeVisible,
  } = useAnimatedVisibility(aboutMeActive, ANIMATION_DURATION);

  // Close button animation logic
  const closeActive = !footerHidden && isLandscape && isMobileOrTablet;
  const {
    show: showClose,
    leaving: closeLeaving,
    setLeaving: setCloseLeaving,
  } = useAnimatedVisibility(closeActive, ANIMATION_DURATION);

  if (isMobilePortrait) {
    return <PortraitWarning />;
  }

  if (showAboutMe && isLandscape && isMobileOrTablet) {
    return (
      <AboutMeButton
        visible={aboutMeVisible}
        leaving={aboutMeLeaving}
        onClick={() => {
          setAboutMeLeaving(true);
          setAboutMeVisible(false);
          setTimeout(() => {
            setShowAboutMe(false);
            setFooterHidden(false);
            setAboutMeLeaving(false);
          }, ANIMATION_DURATION);
        }}
      />
    );
  }

  return (
    <footer
      id="page-footer"
      className={`fixed bottom-0 left-0 w-full bg-transparent transition-transform duration-500 ease-in-out z-50 ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="bg-[#2d2d2d] rounded-2xl shadow-lg p-4 text-white w-full mx-auto text-left relative">
        {showClose && isLandscape && isMobileOrTablet && !footerHidden && (
          <CloseButton
            leaving={closeLeaving}
            onClick={() => {
              setCloseLeaving(true);
              setTimeout(() => {
                setFooterHidden(true);
                setCloseLeaving(false);
              }, ANIMATION_DURATION);
            }}
          />
        )}
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-8">
          <AboutMeSection headingClassName={Birthstone.className} />

          <ContactSection />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
