import React, { useState, useEffect } from "react";
import Image from "next/image";

interface ImageCarouselProps {
  images: string[];
  isOpen: boolean;
  onClose: () => void;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  isOpen,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
    }
  }, [isOpen]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-center transition-opacity duration-300 ease-in-out ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={onClose}
    >
      <div
        className={`relative w-full h-full max-w-4xl max-h-4/5 transition-all duration-300 ease-in-out ${
          isOpen
            ? "transform scale-100 opacity-100"
            : "transform scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white text-4xl z-50"
          aria-label="Close"
        >
          &times;
        </button>

        <div className="w-full h-full flex justify-center items-center overflow-hidden">
          <div className="relative w-full h-full">
            {images.map((item, index) => (
              <div
                key={item}
                className="absolute top-0 left-0 w-full h-full transition-transform duration-500 ease-in-out flex justify-center items-center"
                style={{
                  transform: `translateX(${(index - currentIndex) * 100}%)`,
                }}
              >
                {item.endsWith(".mp4") ? (
                  <video
                    src={item}
                    controls
                    autoPlay={index === currentIndex}
                    loop
                    className="max-w-full max-h-full"
                  />
                ) : (
                  <Image
                    src={item}
                    alt={`Carousel image ${index + 1}`}
                    layout="fill"
                    objectFit="contain"
                    className="rounded-lg"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-4xl"
          aria-label="Previous image"
        >
          &lt;
        </button>

        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-4xl"
          aria-label="Next image"
        >
          &gt;
        </button>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-lg">
          {currentIndex + 1} / {images.length}
        </div>
      </div>
    </div>
  );
};

export default ImageCarousel;
