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
    "/textures/CANON_AT1_COL_1k.webp"
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

  useEffect(() => {
    const textures = [
      colorMap,
      normalMap,
      metallicMap,
      roughnessMap,
      aoMap,
      maskMap,
    ];
    textures.forEach((texture) => {
      if (texture && texture.isTexture) {
        texture.flipY = false;
        if (texture === colorMap) {
          (texture as THREE.Texture).colorSpace = THREE.SRGBColorSpace;
        }
        texture.needsUpdate = true;
      }
    });
  }, [colorMap, normalMap, metallicMap, roughnessMap, aoMap, maskMap]);

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

  useEffect(() => {
    if (modelPath.endsWith("/models/logo-sweet-spot.glb") && scene) {
      const black = new THREE.Color("#000000");
      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.material instanceof THREE.MeshStandardMaterial) {
            mesh.material.map = null;
            mesh.material.normalMap = null;
            mesh.material.metalnessMap = null;
            mesh.material.roughnessMap = null;
            mesh.material.aoMap = null;
            mesh.material.color.copy(black);
            mesh.material.metalness = 0.2;
            mesh.material.roughness = 0.55;
            mesh.material.needsUpdate = true;
          } else {
            const newMaterial = new THREE.MeshStandardMaterial({
              color: black,
              metalness: 0.2,
              roughness: 0.55,
            });
            mesh.material = newMaterial;
          }
        }
      });
    }
  }, [scene, modelPath]);
};
