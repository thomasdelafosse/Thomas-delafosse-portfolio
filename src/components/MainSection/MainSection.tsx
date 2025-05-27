import Carousel3D from "@/components/Carousel3D/CarouselCanvas";
import { ModelData } from "@/types/types";

interface MainSectionTypes {
  projectModels: ModelData[];
  setIsAnyModelFocused: (focused: boolean) => void;
  onModelProgress?: (progress: number) => void;
  style?: React.CSSProperties;
}

const MainSection = ({
  projectModels,
  setIsAnyModelFocused,
  onModelProgress,
  style,
}: MainSectionTypes) => (
  <main
    className="relative flex-grow flex flex-col items-center justify-center p-4 z-10"
    style={style}
  >
    <Carousel3D
      models={projectModels}
      onModelFocusStatusChange={setIsAnyModelFocused}
      onModelProgress={onModelProgress}
    />
  </main>
);

export default MainSection;
