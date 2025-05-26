import React, { useMemo } from "react";

interface FloatingPlanetsProps {
  show: boolean;
  isLandscapeMobile: boolean;
  animationTime: number;
}

const PLANET_IMAGE_PATHS = [
  "/images/sweetSpot/planets2.webp",
  "/images/sweetSpot/planets3.webp",
  "/images/sweetSpot/planets.webp",
  "/images/sweetSpot/planets4.webp",
];

const FloatingPlanets: React.FC<FloatingPlanetsProps> = ({
  show,
  isLandscapeMobile,
  animationTime,
}) => {
  const floatAmplitude = 5;
  const floatSpeed = 1.2;
  const cornerImageBaseStyle = useMemo(
    () => ({
      position: "absolute" as const,
      width: isLandscapeMobile ? "150px" : "200px",
      height: isLandscapeMobile ? "150px" : "200px",
      objectFit: "contain" as const,
      zIndex: 5,
      transition: "opacity 0.5s ease-in-out",
      opacity: show ? 1 : 0,
      pointerEvents: (isLandscapeMobile
        ? "auto"
        : show
        ? "auto"
        : "none") as React.CSSProperties["pointerEvents"],
    }),
    [isLandscapeMobile, show]
  );
  const planetImageStyles = useMemo(
    () => [
      {
        ...cornerImageBaseStyle,
        top: "20px",
        left: "20px",
        transform: `translateY(${
          Math.sin(animationTime * floatSpeed) * floatAmplitude
        }px)`,
      },
      {
        ...cornerImageBaseStyle,
        top: "20px",
        right: "20px",
        transform: `translateY(${
          Math.sin(animationTime * floatSpeed + Math.PI / 2) * floatAmplitude
        }px)`,
      },
      {
        ...cornerImageBaseStyle,
        bottom: "20px",
        left: "20px",
        transform: `translateY(${
          Math.sin(animationTime * floatSpeed + Math.PI) * floatAmplitude
        }px)`,
      },
      {
        ...cornerImageBaseStyle,
        bottom: "20px",
        right: "20px",
        transform: `translateY(${
          Math.sin(animationTime * floatSpeed + (3 * Math.PI) / 2) *
          floatAmplitude
        }px)`,
      },
    ],
    [cornerImageBaseStyle, animationTime, floatSpeed, floatAmplitude]
  );
  return (
    <>
      {PLANET_IMAGE_PATHS.map((path, index) => (
        <img
          key={`planet-${index}`}
          src={path}
          alt={`Planet ${index + 1}`}
          style={planetImageStyles[index]}
        />
      ))}
    </>
  );
};

export default FloatingPlanets;
