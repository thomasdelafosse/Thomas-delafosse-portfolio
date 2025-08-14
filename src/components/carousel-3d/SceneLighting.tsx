import { Environment } from "@react-three/drei";
import useSceneControls from "@/hooks/useSceneControls";

const SceneLighting = () => {
  const { ambientLightIntensity } = useSceneControls();

  return (
    <>
      <ambientLight intensity={ambientLightIntensity} />
      <Environment preset="sunset" />
    </>
  );
};

export default SceneLighting;
