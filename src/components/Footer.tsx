import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { FaGithub, FaEnvelope, FaDiscord } from "react-icons/fa";
import localFont from "next/font/local";

// Define Meddon font
const RougeScript = localFont({
  src: "../../public/fonts/Birthstone-Regular.ttf",
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
      setShowClose(true);
      setTimeout(() => setCloseLeaving(false), 10);
    } else {
      setCloseLeaving(true);
      closeTimeout.current = setTimeout(() => {
        setShowClose(false);
        setCloseLeaving(false);
      }, ANIMATION_DURATION);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [footerHidden, isLandscape, isMobileOrTablet]);

  if (isMobilePortrait) {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-gray-900 to-black flex flex-col items-center justify-center text-white text-xl z-[9999] p-8 text-center">
        <div className="mb-6">
          <Image
            src="/images/logoBlanc.png"
            alt="Logo"
            width={100}
            height={60}
            priority
          />
        </div>
        <p>For a better experience, please rotate your phone.</p>
        <p className="text-base mt-2 text-gray-400">(Or view on a desktop)</p>
      </div>
    );
  }

  // Animated About me button (only on mobile/tablet landscape)
  if (showAboutMe && isLandscape && isMobileOrTablet) {
    return (
      <div
        style={{
          position: "fixed",
          bottom: "1rem",
          right: "1rem",
          zIndex: 10000,
          opacity: aboutMeVisible && !aboutMeLeaving ? 1 : 0,
          transform:
            aboutMeVisible && !aboutMeLeaving
              ? "translateY(0)"
              : "translateY(20px)",
          transition: `opacity 0.5s ease-in-out, transform 0.5s ease-in-out`,
          pointerEvents: aboutMeVisible && !aboutMeLeaving ? "auto" : "none",
        }}
      >
        <button
          className="bg-[#2d2d2d] text-white px-4 py-2 rounded-lg shadow-lg font-mono text-sm hover:bg-[#444] transition-colors"
          onClick={() => {
            setAboutMeLeaving(true);
            setAboutMeVisible(false);
            setTimeout(() => {
              setShowAboutMe(false);
              setFooterHidden(false);
              setAboutMeLeaving(false);
            }, ANIMATION_DURATION);
          }}
        >
          About me
        </button>
      </div>
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
          <div
            style={{
              position: "absolute",
              top: 8,
              right: 16,
              opacity: !closeLeaving ? 1 : 0,
              transform: !closeLeaving ? "translateY(0)" : "translateY(20px)",
              transition: `opacity 0.5s ease-in-out, transform 0.5s ease-in-out`,
              zIndex: 10,
              pointerEvents: !closeLeaving ? "auto" : "none",
            }}
          >
            <button
              className="bg-[#444] text-white px-2 py-1 rounded font-mono text-xs hover:bg-[#666] transition-colors"
              onClick={() => {
                setCloseLeaving(true);
                setTimeout(() => {
                  setFooterHidden(true);
                  setCloseLeaving(false);
                }, ANIMATION_DURATION);
              }}
            >
              Close
            </button>
          </div>
        )}
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-8">
          {/* About Me Section */}
          <div className="md:w-1/2">
            <h3 className={`text-3xl font-bold mb-2 ${RougeScript.className}`}>
              Thomas Delafosse
            </h3>
            <div className="flex flex-col gap-0.5 text-base">
              <span>
                Développeur Full-Stack Freelance. React, Next.js, TypeScript,
                Node.js. Feel free to contact me for any question or
                collaboration opportunity.
              </span>
              <span>
                I&apos;m currently working on a portfolio site in the form of a
                video game with Three.js.
              </span>
            </div>
          </div>

          {/* Contact Me Section */}

          <div className="flex flex-col gap-1 items-end mr-2 mt-10 lg:mt-0">
            <a
              href="https://x.com/ThomasDelafosse"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="x"
              className="text-white hover:text-gray-300 transition-colors flex items-center"
            >
              X
            </a>
            <a
              href="https://github.com/thomasdelafosse"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="text-white hover:text-gray-300 transition-colors flex items-center"
            >
              github <FaGithub size={20} className="ml-1" />
            </a>
            <a
              href="https://discord.gg/EPkpq95t"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Discord"
              className="text-white hover:text-gray-300 transition-colors flex items-center"
            >
              discord <FaDiscord size={20} className="ml-1" />
            </a>
            <a
              href="mailto:bonjour@thomasdelafosse.com"
              aria-label="Email"
              className="text-white hover:text-gray-300 transition-colors flex items-center"
            >
              bonjour@thomasdelafosse.com{" "}
              <FaEnvelope size={20} className="ml-1" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
