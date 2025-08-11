import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

const CameraUpdater = () => {
  const { camera, size } = useThree();
  useEffect(() => {
    if (size.width > 0 && size.height > 0) {
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.aspect = size.width / size.height;
        camera.updateProjectionMatrix();
      }
    }
  }, [size, camera]);
  return null;
};

export default CameraUpdater;
