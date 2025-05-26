import { useEffect, useState, useRef } from "react";
import localFont from "next/font/local";
import PortraitWarning from "./PortraitWarning";
import AboutMeButton from "./AboutMeButton";
import CloseButton from "./CloseButton";
import AboutMeSection from "./AboutMeSection";
import ContactSection from "./ContactSection";

const RougeScript = localFont({
  src: "../../../public/fonts/Birthstone-Regular.ttf",
  variable: "--font-Birthstone",
});

interface FooterProps {
  isVisible: boolean;
}

const ANIMATION_DURATION = 500; // ms

const Footer: React.FC<FooterProps> = ({ isVisible }) => {
  const [isMobilePortrait, setIsMobilePortrait] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const [footerHidden, setFooterHidden] = useState(false);
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);

  // Animation states for buttons
  const [showAboutMe, setShowAboutMe] = useState(false);
  const [aboutMeVisible, setAboutMeVisible] = useState(false);
  const [aboutMeLeaving, setAboutMeLeaving] = useState(false);

  const [showClose, setShowClose] = useState(true);
  const [closeLeaving, setCloseLeaving] = useState(false);

  const aboutMeTimeout = useRef<NodeJS.Timeout | null>(null);
  const closeTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const mediaQueryPortrait = window.matchMedia(
      "(max-width: 767px) and (orientation: portrait)"
    );
    const mediaQueryLandscape = window.matchMedia("(orientation: landscape)");

    const handlePortraitChange = (
      e: MediaQueryListEvent | { matches: boolean }
    ) => {
      setIsMobilePortrait(e.matches);
    };
    const handleLandscapeChange = (
      e: MediaQueryListEvent | { matches: boolean }
    ) => {
      setIsLandscape(e.matches);
    };
    const handleResize = () => {
      setIsMobileOrTablet(window.innerWidth < 1024);
    };

    handlePortraitChange(mediaQueryPortrait); // Initial check
    handleLandscapeChange(mediaQueryLandscape);
    handleResize();

    if (mediaQueryPortrait.addEventListener) {
      mediaQueryPortrait.addEventListener("change", handlePortraitChange);
      mediaQueryLandscape.addEventListener("change", handleLandscapeChange);
    } else if (mediaQueryPortrait.addListener) {
      mediaQueryPortrait.addListener(handlePortraitChange);
      mediaQueryLandscape.addListener(handleLandscapeChange);
    }
    window.addEventListener("resize", handleResize);

    return () => {
      if (mediaQueryPortrait.removeEventListener) {
        mediaQueryPortrait.removeEventListener("change", handlePortraitChange);
        mediaQueryLandscape.removeEventListener(
          "change",
          handleLandscapeChange
        );
      } else if (mediaQueryPortrait.removeListener) {
        mediaQueryPortrait.removeListener(handlePortraitChange);
        mediaQueryLandscape.removeListener(handleLandscapeChange);
      }
      window.removeEventListener("resize", handleResize);
      if (aboutMeTimeout.current) clearTimeout(aboutMeTimeout.current);
      if (closeTimeout.current) clearTimeout(closeTimeout.current);
    };
  }, []);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [footerHidden, isLandscape, isMobileOrTablet]);

  if (isMobilePortrait) {
    return <PortraitWarning />;
  }

  // Animated About me button (only on mobile/tablet landscape)
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
        {/* Animated Close button only in landscape and mobile/tablet */}
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
          {/* About Me Section */}
          <AboutMeSection headingClassName={RougeScript.className} />

          {/* Contact Me Section */}
          <ContactSection />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
