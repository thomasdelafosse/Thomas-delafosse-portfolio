import { useEffect, useState } from "react";

const useMediaQueries = () => {
  const [isMobilePortrait, setIsMobilePortrait] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);

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
    };
  }, []);

  return { isMobilePortrait, isLandscape, isMobileOrTablet };
};

export default useMediaQueries;
