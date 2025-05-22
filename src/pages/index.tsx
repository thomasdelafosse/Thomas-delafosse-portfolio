import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import Carousel3D from "@/components/Carousel3D";
import Footer from "@/components/Footer";
import { useState } from "react";
import Image from "next/image";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Define Meddon font
const meddon = localFont({
  src: "../../public/fonts/Meddon-Regular.ttf",
  variable: "--font-meddon",
});

// Updated data structure for models
const projectModels = [
  {
    path: "/5xt.glb",
    description:
      "Sweet Spot Paris, FEB 2025 – MAR 2025\n  https://sweetspot.paris or click on the 3D model\n\n• Creation of a ticket office website with Next.js and TypeScript\n• Transactional email management with Resend\n• 3D replica of a Dolby Atmos studio with Three.js",
    url: "https://sweetspot.paris",
  },
  {
    path: "/3Dzebre.glb",
    description:
      "Mathieu Le Gal, MAR 2025 - APR 2025\n https://mathieulegal.com or click on the 3D model\n\n• Creation of a portfolio website for Mathieu Le Gal\n • Design made by Mathieu Le Gal\n• Tools used : TypeScript, Next.js, Three.js, Tailwind",
    url: "https://mathieulegal.com",
  },
  {
    path: "/3Dchably.glb",
    description:
      "Maison Mine, JAN 2025 – FEB 2025\n https://maisonmine.com or click on the 3D model\n\n• Website for the Maison Mine company\n• Tools used : TypeScript, Next.js, Three.js, Tailwind, Sanity CMS, 3daistudio, Photoshop",
    url: "https://maisonmine.com",
  },
];

export default function Home() {
  const [isAnyModelFocused, setIsAnyModelFocused] = useState(false);
  const [isFooterVisible, setIsFooterVisible] = useState(false);

  return (
    <div
      // Always use the original background gradient
      className={`relative flex flex-col min-h-screen bg-gradient-to-br from-gray-300 to-gray-700 ${geistSans.variable} ${geistMono.variable} ${meddon.variable}`}
    >
      {/* Darkening overlay */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 ease-in-out pointer-events-none z-0 ${
          isAnyModelFocused ? "opacity-10" : "opacity-0"
        }`}
      />
      {/* Ensure other content is relatively positioned or has a higher z-index if needed */}
      <nav className="relative w-full py-4 z-30">
        {" "}
        {/* Added relative and z-10 */}
        <div className="relative pl-6 pt-2">
          <Image
            src="/images/logoBlanc.png"
            alt="Thomas Delafosse Logo"
            width={80}
            height={50}
            priority
          />
        </div>
      </nav>
      <main className="relative flex-grow flex flex-col items-center justify-center p-4 z-10">
        {" "}
        {/* Added relative and z-10 */}
        <Carousel3D
          models={projectModels}
          onModelFocusStatusChange={setIsAnyModelFocused}
        />
      </main>
      <Footer isVisible={isFooterVisible} setIsVisible={setIsFooterVisible} />
    </div>
  );
}
