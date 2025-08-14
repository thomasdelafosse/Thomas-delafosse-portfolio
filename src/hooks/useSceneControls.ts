import { useControls } from "leva";

export default function useSceneControls() {
  return useControls("Scene Controls", {
    ambientLightIntensity: { value: 1.0, min: 0, max: 10, step: 0.1 },
    cameraFov: { value: 10, min: 10, max: 120, step: 0.1 },
    cameraPosition: { value: [0.0, 0.0, 10.0], step: 0.5 },
  });
}
