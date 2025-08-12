import { useEffect } from "react";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";

interface ModelTextureTypes {
  modelPath: string;
  scene: THREE.Group | null;
}

export const useModelTexture = ({ modelPath, scene }: ModelTextureTypes) => {
  const colorMap = useLoader(
    THREE.TextureLoader,
    "/textures/camera/CANON_AT1_COL_1k.webp"
  );
  const normalMap = useLoader(
    THREE.TextureLoader,
    "/textures/camera/CANON_AT1_NRML_GL_1k.webp"
  );
  const metallicMap = useLoader(
    THREE.TextureLoader,
    "/textures/camera/CANON_AT1_METL_1k.webp"
  );
  const roughnessMap = useLoader(
    THREE.TextureLoader,
    "/textures/camera/CANON_AT1_ROUGH_1k.webp"
  );
  const aoMap = useLoader(
    THREE.TextureLoader,
    "/textures/camera/CANON_AT1_AO_1k.webp"
  );
  const maskMap = useLoader(
    THREE.TextureLoader,
    "/textures/camera/CANON_AT1_MASK_1k.webp"
  );

  // Baked texture for the Syva speaker model
  const bakedSpeakerMap = useLoader(
    THREE.TextureLoader,
    "/textures/speaker/baked-speaker.webp"
  );

  useEffect(() => {
    const textures = [
      colorMap,
      normalMap,
      metallicMap,
      roughnessMap,
      aoMap,
      maskMap,
      bakedSpeakerMap,
    ];
    textures.forEach((texture) => {
      if (texture && texture.isTexture) {
        texture.flipY = false;
        // Ensure correct color space only for albedo/baked maps
        if (texture === colorMap || texture === bakedSpeakerMap) {
          (texture as THREE.Texture).colorSpace = THREE.SRGBColorSpace;
        }
        texture.needsUpdate = true;
      }
    });
  }, [
    colorMap,
    normalMap,
    metallicMap,
    roughnessMap,
    aoMap,
    maskMap,
    bakedSpeakerMap,
  ]);

  useEffect(() => {
    if (modelPath.endsWith("/models/camera.glb") && scene) {
      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.material instanceof THREE.MeshStandardMaterial) {
            mesh.material.map = colorMap;
            mesh.material.color.set(0xffffff);
            mesh.material.normalMap = normalMap;
            mesh.material.metalnessMap = metallicMap;
            mesh.material.roughnessMap = roughnessMap;
            mesh.material.aoMap = aoMap;
            mesh.material.metalness = 1.0;
            mesh.material.roughness = 1.0;
            mesh.material.needsUpdate = true;
          } else {
            const newMaterial = new THREE.MeshStandardMaterial({
              map: colorMap,
              color: new THREE.Color(0xffffff),
              normalMap: normalMap,
              metalnessMap: metallicMap,
              roughnessMap: roughnessMap,
              aoMap: aoMap,
              metalness: 1.0,
              roughness: 1.0,
            });
            mesh.material = newMaterial;
          }
        }
      });
    }
  }, [
    scene,
    modelPath,
    colorMap,
    normalMap,
    metallicMap,
    roughnessMap,
    aoMap,
    maskMap,
  ]);

  // Apply baked texture to Syva speaker model
  useEffect(() => {
    if (modelPath.endsWith("/models/syva.glb") && scene) {
      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          const newMaterial = new THREE.MeshBasicMaterial({
            map: bakedSpeakerMap,
            toneMapped: false,
          });
          mesh.material = newMaterial;
          if (mesh.material) {
            (mesh.material as THREE.Material).needsUpdate = true;
          }
        }
      });
    }
  }, [scene, modelPath, bakedSpeakerMap]);
};
