import { useState } from "react";
import Footer from "@/components/Footer/Footer";
import NavBar from "@/components/NavBar/NavBar";
import Overlay from "@/components/Overlay/Overlay";
import MainSection from "@/components/MainSection/MainSection";
import projectModels from "@/data/projectModels";

export default function Home() {
  const [isAnyModelFocused, setIsAnyModelFocused] = useState(false);
  const isFooterVisible = !isAnyModelFocused;

  return (
    <div className="relative flex flex-col min-h-screen bg-gradient-to-br from-gray-300 to-gray-700">
      <Overlay isVisible={isAnyModelFocused} />
      <NavBar />
      <MainSection
        projectModels={projectModels}
        setIsAnyModelFocused={setIsAnyModelFocused}
      />
      <Footer isVisible={isFooterVisible} />
    </div>
  );
}
