import Carousel3D from "@/components/carousel-3d/CarouselCanvas";
import { CarouselCanvasApi } from "@/types/types";
import { FocusData, ModelData } from "@/types/types";
import { createRef, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import ImageCarousel from "@/components/image-carousel/ImageCarousel";
import MorphingTextOverlay from "@/components/ui-background-pointillisme/MorphingTextOverlay";
import { CSSTransition, SwitchTransition } from "react-transition-group";

interface MainSectionTypes {
  projectModels: ModelData[];
  onModelProgress?: (progress: number) => void;
  style?: React.CSSProperties;
}
const MainSection = ({
  projectModels,
  onModelProgress,
  style,
}: MainSectionTypes) => {
  const [focusedInfo, setFocusedInfo] = useState<FocusData | null>(null);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<
    "next" | "prev"
  >("next");
  const infoRef = useRef<HTMLDivElement | null>(null);
  const carouselRef = useRef<CarouselCanvasApi | null>(null);
  const pendingScrollRef = useRef<null | "info">(null);

  useEffect(() => {
    if (!focusedInfo && projectModels.length > 0) {
      setFocusedInfo({
        description: projectModels[0].description,
        path: projectModels[0].path,
      });
    }
  }, [focusedInfo, projectModels]);

  const handleScrollToInfo = () => {
    infoRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const onScroll = () => {
      if (typeof window === "undefined") return;
      setHasScrolled(window.scrollY > 10);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // const handleChevronClick = () => {
  //   if (hasScrolled) {
  //     window.scrollTo({ top: 0, behavior: "smooth" });
  //   } else {
  //     pendingScrollRef.current = "info";
  //   }
  // };

  const parsedDescription = useMemo(() => {
    if (!focusedInfo?.description) return null;

    const text = focusedInfo.description;

    const escapeRegExp = (value: string) =>
      value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const HIGHLIGHT_KEYWORDS = [
      "Next.js App Router",
      "Next.js Page router",
      "React Native (+ Expo)",
      "React Native (+expo)",
      "TypeScript",
      "Supabase",
      "Three.js",
      "Frontend",
      "Backend",
      "Internationalisation",
      "App",
      "Blender",
      "Resend",
      "Tailwind",
      "Sanity CMS",
      "3daistudio",
      "Next.js",
      "next-intl",
      "2D unwrapping and baking",
    ].sort((a, b) => b.length - a.length);

    const HIGHLIGHT_REGEX = new RegExp(
      `(${HIGHLIGHT_KEYWORDS.map(escapeRegExp).join("|")})`,
      "gi"
    );

    const HIGHLIGHT_EXACT_REGEX = new RegExp(
      `^(${HIGHLIGHT_KEYWORDS.map(escapeRegExp).join("|")})$`,
      "i"
    );

    const highlightKeywords = (input: string) => {
      if (!input) return null;
      const parts = input.split(HIGHLIGHT_REGEX);
      return parts.map((part, index) => {
        if (!part) return null;
        if (HIGHLIGHT_EXACT_REGEX.test(part)) {
          return <strong key={`kw-${index}`}>{part}</strong>;
        }
        return <span key={`tx-${index}`}>{part}</span>;
      });
    };

    const trigger = "Click here to discover the previous version";
    const linkRegex =
      /([\s\S]*?)<Link href='([^']*)' target='_blank' rel='noopener noreferrer'>([^<]*)<\/Link>([\s\S]*)/;

    const renderPart = (part: string) => {
      const match = part.match(linkRegex);
      if (match) {
        const [, textBefore, href, linkText, textAfter] = match;
        return (
          <>
            {highlightKeywords(textBefore)}
            <Link
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-400"
            >
              {linkText}
            </Link>
            {highlightKeywords(textAfter)}
          </>
        );
      }
      return highlightKeywords(part);
    };

    const parts = text.split(trigger);
    if (
      parts.length > 1 &&
      focusedInfo?.path?.endsWith("/models/logo-sweet-spot.glb")
    ) {
      return (
        <>
          {renderPart(parts[0])}
          <button
            onClick={() => setShowCarousel(true)}
            className="text-white hover:text-slate-400 hover:underline cursor-pointer"
          >
            {trigger}
          </button>
          {renderPart(parts[1])}
        </>
      );
    }

    return renderPart(text);
  }, [focusedInfo]);

  const [showCarousel, setShowCarousel] = useState(false);
  const sweetSpotImages = [
    "/images/sweetSpot/homepagePreviousVersionSP.png",
    "/images/sweetSpot/listeningPartiesSP.png",
    "/images/sweetSpot/listeningPartiesSP1.png",
    "/images/sweetSpot/SweetSpot-old-version pres.mp4",
  ];

  return (
    <main
      className="relative flex-grow flex flex-col items-center justify-start z-10"
      style={style}
    >
      <div className="relative w-full h-screen">
        {/** Morphing title over the carousel */}
        <MorphingTextOverlay
          title={
            projectModels.find((m) => m.path === focusedInfo?.path)?.title ??
            null
          }
          position="absolute"
          yOffset={0.5}
          textScale={1.0}
          className="z-10"
          onMorphComplete={() => {
            if (pendingScrollRef.current === "info") {
              pendingScrollRef.current = null;
              handleScrollToInfo();
            }
          }}
        />
        <Carousel3D
          ref={carouselRef}
          models={projectModels}
          onModelProgress={onModelProgress}
          onFocusedModelInfoChange={(info) => {
            setFocusedInfo(info);
          }}
          onScrollToInfo={handleScrollToInfo}
        />
        <button
          aria-label={
            hasScrolled ? "Scroll to top" : "Scroll for project details"
          }
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 text-white/90 hover:text-white transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-8 w-8 transition-transform duration-300 ${
              hasScrolled ? "rotate-180" : "animate-bounce"
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>
      <div
        ref={infoRef}
        className="relative w-full flex justify-center px-4 py-8"
      >
        {(() => {
          const descNodeRef = useMemo(
            () => createRef<HTMLDivElement>(),
            [focusedInfo?.path]
          );
          return (
            <SwitchTransition mode="out-in">
              <CSSTransition
                key={focusedInfo?.path ?? "__none__"}
                classNames={
                  transitionDirection === "next" ? "desc-left" : "desc-right"
                }
                timeout={300}
                nodeRef={descNodeRef}
              >
                <div
                  ref={descNodeRef}
                  className="relative max-w-3xl w-full text-center bg-black/80 text-white whitespace-pre-line overflow-hidden p-6 md:p-8 pb-16 text-base md:text-lg"
                >
                  {parsedDescription}
                </div>
              </CSSTransition>
            </SwitchTransition>
          );
        })()}

        <button
          onClick={() => {
            setTransitionDirection("prev");
            carouselRef.current?.prev();
          }}
          className="fixed bottom-4 left-4 z-50 px-4 py-2 bg-black/80 hover:bg-black/40 text-white backdrop-blur border border-white/20 cursor-pointer"
          aria-label="Previous project"
        >
          PREVIOUS
        </button>
        <button
          onClick={() => {
            setTransitionDirection("next");
            carouselRef.current?.next();
          }}
          className="fixed bottom-4 right-4 z-50 px-4 py-2 bg-black/80 hover:bg-black/40 text-white backdrop-blur border border-white/20 cursor-pointer"
          aria-label="Next project"
        >
          NEXT
        </button>
      </div>
      <ImageCarousel
        images={sweetSpotImages}
        isOpen={showCarousel}
        onClose={() => setShowCarousel(false)}
      />
    </main>
  );
};

export default MainSection;
