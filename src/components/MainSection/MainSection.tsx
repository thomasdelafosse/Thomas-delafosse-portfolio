import Carousel3D from "@/components/carousel-3d/CarouselCanvas";
import { ModelData } from "@/types/types";

interface MainSectionTypes {
  projectModels: ModelData[];
  onModelProgress?: (progress: number) => void;
  style?: React.CSSProperties;
}

const MainSection = ({
  projectModels,
  onModelProgress,
  style,
}: MainSectionTypes) => (
  <main
    className="relative flex-grow flex flex-col items-center justify-center p-4 z-10"
    style={style}
  >
    <Carousel3D models={projectModels} onModelProgress={onModelProgress} />
  </main>
);

export default MainSection;
