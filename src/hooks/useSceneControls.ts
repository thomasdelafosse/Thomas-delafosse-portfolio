import { useControls } from "leva";

export default function useSceneControls() {
  return useControls("Scene Controls", {
    ambientLightIntensity: { value: 2.0, min: 0, max: 2, step: 0.1 },
    pointLightIntensity: { value: 5.0, min: 0, max: 5, step: 0.1 },
    pointLightPosition: { value: [10, 10, 10], step: 1 },
    cameraFov: { value: 10, min: 10, max: 120, step: 1 },
    // Place the camera at the same vertical level as the carousel (side view)
    cameraPosition: { value: [0.0, 0.0, 10.0], step: 0.5 },
  });
}
