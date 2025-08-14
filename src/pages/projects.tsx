import Image from "next/image";
import MainSection from "@/components/main-section/MainSection";
import PointillismBackground from "@/components/ui-background-pointillisme/PointillismBackground";
import projectModelsData from "@/data/ProjectsInformation";
import { useRouter } from "next/router";

export default function ProjectsPage() {
  const router = useRouter();
  return (
    <>
      <div className="relative flex flex-col min-h-screen">
        {/* Global background particles covering entire page including scroll */}
        <PointillismBackground
          position="fixed"
          showBackground
          densityScale={1}
        />
        <button
          onClick={() => router.push("/")}
          className="fixed top-4 right-4 z-50 p-2 px-4 bg-black/80 hover:bg-black/40 text-white backdrop-blur border border-white/20 cursor-pointer"
          aria-label="Show info"
        >
          ABOUT ME
        </button>
        <div className="fixed top-5 left-5 z-50">
          <Image
            src="/images/logoBlanc.png"
            alt="Portfolio Logo"
            width={80}
            height={50}
            priority
          />
        </div>
        <MainSection projectModels={projectModelsData} />
      </div>
    </>
  );
}
