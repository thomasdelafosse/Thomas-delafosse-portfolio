import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { FaGithub, FaEnvelope, FaDiscord } from "react-icons/fa";
import localFont from "next/font/local";

// Define Meddon font
const meddon = localFont({
  src: "../../public/fonts/Meddon-Regular.ttf", // Adjusted path for Footer.tsx
  variable: "--font-meddon",
});

interface FooterProps {
  isVisible: boolean;
  setIsVisible: (isVisible: boolean) => void;
}

const Footer: React.FC<FooterProps> = ({ isVisible, setIsVisible }) => {
  const lastScrollY = useRef(0);
  const [isMobilePortrait, setIsMobilePortrait] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(max-width: 767px) and (orientation: portrait)"
    );
    const handleChange = (e: MediaQueryListEvent | { matches: boolean }) => {
      setIsMobilePortrait(e.matches);
    };

    handleChange(mediaQuery); // Initial check

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
    } else if (mediaQuery.addListener) {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleChange);
      } else if (mediaQuery.removeListener) {
        // Fallback for older browsers
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  useEffect(() => {
    const initialScrollY = window.scrollY;
    lastScrollY.current = initialScrollY;

    const isInitiallyAtBottom =
      Math.ceil(window.innerHeight + initialScrollY) >=
      document.documentElement.scrollHeight;
    setIsVisible(isInitiallyAtBottom);

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isAtBottom =
        Math.ceil(window.innerHeight + currentScrollY) >=
        document.documentElement.scrollHeight;

      if (currentScrollY < lastScrollY.current && currentScrollY > 0) {
        setIsVisible(false);
      } else {
        setIsVisible(isAtBottom);
      }

      lastScrollY.current = currentScrollY <= 0 ? 0 : currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [setIsVisible]);

  if (isMobilePortrait) {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-gray-900 to-black flex flex-col items-center justify-center text-white text-xl z-[9999] p-8 text-center">
        <div className="mb-8">
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

  return (
    <footer
      id="page-footer"
      className={`w-full h-28 bg-black text-white py-4 transition-transform duration-500 ease-in-out ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        {/* About Me Section */}
        <div className="mb-6 md:mb-0 md:w-1/2 text-center md:text-left">
          <h3 className={`text-xl font-medium mb-2 ${meddon.className}`}>
            Thomas Delafosse
          </h3>
          <p className="text-sm text-white ">
            Développeur Full-Stack. React, Next.js, TypeScript, Node.js.
            Actuellement en cours de création d\'un site portfolio sous forme de
            jeu vidéo avec Three.js. N\'hésitez pas à me contacter pour toute
            question ou opportunité de collaboration.
          </p>
        </div>

        {/* Contact Me Section */}
        <div className="md:w-1/2 text-center md:text-right">
          <div className="flex justify-center md:justify-end space-x-8 mt-12">
            <a
              href="https://x.com/ThomasDelafosse" // Replace # with your Discord invite link
              target="_blank"
              rel="noopener noreferrer"
              aria-label="x"
              className="text-white hover:text-white transition-colors flex items-center"
            >
              X
            </a>
            <a
              href="https://github.com/thomasdelafosse"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="text-white hover:text-white transition-colors flex items-center"
            >
              github <FaGithub size={24} className="ml-1" />
            </a>
            <a
              href="https://discord.gg/EPkpq95t" // Replace # with your Discord invite link
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Discord"
              className="text-white hover:text-white transition-colors flex items-center"
            >
              discord <FaDiscord size={24} className="ml-1" />
            </a>

            <a
              href="mailto:bonjour@thomasdelafosse.com"
              aria-label="Email"
              className="text-white hover:text-white transition-colors flex items-center"
            >
              email <FaEnvelope size={24} className="ml-1" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
