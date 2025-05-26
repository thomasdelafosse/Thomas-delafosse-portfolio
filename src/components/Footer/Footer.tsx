import { useEffect, useState, useRef } from "react";
import localFont from "next/font/local";
import PortraitWarning from "./PortraitWarning";
import AboutMeButton from "./AboutMeButton";
import CloseButton from "./CloseButton";
import AboutMeSection from "./AboutMeSection";
import ContactSection from "./ContactSection";
import useMediaQueries from "../../hooks/useMediaQueries";

const Birthstone = localFont({
  src: "../../../public/fonts/Birthstone-Regular.ttf",
  variable: "--font-Birthstone",
});

interface FooterProps {
  isVisible: boolean;
}

const ANIMATION_DURATION = 500; // ms

const Footer: React.FC<FooterProps> = ({ isVisible }) => {
  const { isMobilePortrait, isLandscape, isMobileOrTablet } = useMediaQueries();
  const [footerHidden, setFooterHidden] = useState(false);

  // Animation states for buttons
  const [showAboutMe, setShowAboutMe] = useState(false);
  const [aboutMeVisible, setAboutMeVisible] = useState(false);
  const [aboutMeLeaving, setAboutMeLeaving] = useState(false);

  const [showClose, setShowClose] = useState(true);
  const [closeLeaving, setCloseLeaving] = useState(false);

  const aboutMeTimeout = useRef<NodeJS.Timeout | null>(null);
  const closeTimeout = useRef<NodeJS.Timeout | null>(null);

  // Handle About me button animation
  useEffect(() => {
    if (footerHidden && isLandscape && isMobileOrTablet) {
      setShowAboutMe(true);
      setTimeout(() => setAboutMeVisible(true), 10); // allow render before animating in
    } else {
      setAboutMeLeaving(true);
      aboutMeTimeout.current = setTimeout(() => {
        setAboutMeVisible(false);
        setShowAboutMe(false);
        setAboutMeLeaving(false);
      }, ANIMATION_DURATION);
    }
    return () => {
      if (aboutMeTimeout.current) clearTimeout(aboutMeTimeout.current);
    };
  }, [footerHidden, isLandscape, isMobileOrTablet]);

  // Handle Close button animation
  useEffect(() => {
    if (!footerHidden && isLandscape && isMobileOrTablet) {
      if (!showClose) setShowClose(true);
      if (closeTimeout.current) clearTimeout(closeTimeout.current);
      setTimeout(() => setCloseLeaving(false), 10);
    } else if (showClose) {
      setCloseLeaving(true);
      if (closeTimeout.current) clearTimeout(closeTimeout.current);
      closeTimeout.current = setTimeout(() => {
        setShowClose(false);
        setCloseLeaving(false);
      }, ANIMATION_DURATION);
    }
    return () => {
      if (closeTimeout.current) clearTimeout(closeTimeout.current);
    };
  }, [footerHidden, isLandscape, isMobileOrTablet]);

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
