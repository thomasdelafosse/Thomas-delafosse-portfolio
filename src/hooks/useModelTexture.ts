import { useEffect } from "react";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";

interface ModelTextureTypes {
  modelPath: string;
  scene: THREE.Group | null;
}

function applyStandardMaterial(
  mesh: THREE.Mesh,
  maps: {
    colorMap: THREE.Texture;
    normalMap: THREE.Texture;
    metallicMap: THREE.Texture;
    roughnessMap: THREE.Texture;
    aoMap: THREE.Texture;
  }
) {
  if (mesh.material instanceof THREE.MeshStandardMaterial) {
    mesh.material.map = maps.colorMap;
    mesh.material.color.set(0xffffff);
    mesh.material.normalMap = maps.normalMap;
    mesh.material.metalnessMap = maps.metallicMap;
    mesh.material.roughnessMap = maps.roughnessMap;
    mesh.material.aoMap = maps.aoMap;
    mesh.material.metalness = 1.0;
    mesh.material.roughness = 1.0;
    mesh.material.needsUpdate = true;
  } else {
    const newMaterial = new THREE.MeshStandardMaterial({
      map: maps.colorMap,
      color: new THREE.Color(0xffffff),
      normalMap: maps.normalMap,
      metalnessMap: maps.metallicMap,
      roughnessMap: maps.roughnessMap,
      aoMap: maps.aoMap,
      metalness: 1.0,
      roughness: 1.0,
    });
    mesh.material = newMaterial;
  }
}

function applySolidMaterial(
  mesh: THREE.Mesh,
  color: THREE.ColorRepresentation,
  metalness: number,
  roughness: number
) {
  if (mesh.material instanceof THREE.MeshStandardMaterial) {
    mesh.material.map = null;
    mesh.material.normalMap = null;
    mesh.material.metalnessMap = null;
    mesh.material.roughnessMap = null;
    mesh.material.aoMap = null;
    mesh.material.color.set(color);
    mesh.material.metalness = metalness;
    mesh.material.roughness = roughness;
    mesh.material.needsUpdate = true;
  } else {
    const newMaterial = new THREE.MeshStandardMaterial({
      color,
      metalness,
      roughness,
    });
    mesh.material = newMaterial;
  }
}

type MaterialPolicy = (scene: THREE.Group) => void;

export const MATERIAL_POLICIES: Record<string, MaterialPolicy> = {} as const;

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
    if (!scene) return;
    const applyPolicyForCamera = () => {
      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          applyStandardMaterial(child as THREE.Mesh, {
            colorMap,
            normalMap,
            metallicMap,
            roughnessMap,
            aoMap,
          });
        }
      });
    };

    const applyPolicyForLogo = () => {
      const black = new THREE.Color("#000000");
      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          applySolidMaterial(child as THREE.Mesh, black, 0.2, 0.55);
        }
      });
    };

    const policies: Array<{
      test: (path: string) => boolean;
      run: () => void;
    }> = [
      {
        test: (p) => p.endsWith("/models/camera.glb"),
        run: applyPolicyForCamera,
      },
      {
        test: (p) => p.endsWith("/models/logo-sweet-spot.glb"),
        run: applyPolicyForLogo,
      },
    ];

    for (const policy of policies) {
      if (policy.test(modelPath)) {
        policy.run();
        break;
      }
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
};
