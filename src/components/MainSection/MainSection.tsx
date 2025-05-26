import Carousel3D from "@/components/Carousel3D/CarouselCanvas";

interface MainSectionProps {
  projectModels: Array<any>;
  setIsAnyModelFocused: (focused: boolean) => void;
}

const MainSection = ({
  projectModels,
  setIsAnyModelFocused,
}: MainSectionProps) => (
  <main className="relative flex-grow flex flex-col items-center justify-center p-4 z-10">
    <Carousel3D
      models={projectModels}
      onModelFocusStatusChange={setIsAnyModelFocused}
    />
  </main>
);

export default MainSection;
