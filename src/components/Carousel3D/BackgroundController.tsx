import { useRef, useState, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import Starfield from "./Starfield";
import InteractiveGrid from "./InteractiveGrid";
import { ModelData } from "@/types/types";

interface BackgroundControllerTypes {
  focusedPath: string | null | undefined;
  videoTexturePath: string;
  videoTexturePathChably: string;
  models: ModelData[];
}

const BackgroundController = ({
  focusedPath,
  videoTexturePath,
  videoTexturePathChably,
  models,
}: BackgroundControllerTypes) => {
  const { scene } = useThree();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoTextureRef = useRef<THREE.VideoTexture | null>(null);
  const [needsUserInteraction, setNeedsUserInteraction] = useState(false);

  const handlePlayVideo = () => {
    if (videoRef.current) {
      videoRef.current
        .play()
        .then(() => setNeedsUserInteraction(false))
        .catch(() => setNeedsUserInteraction(true));
    }
  };

  useEffect(() => {
    const is5xtFocused = focusedPath?.endsWith("/models/5xt.glb");
    const isCameraFocused = focusedPath?.endsWith("/models/camera.glb");
    const isChablyFocused = focusedPath?.endsWith("/models/3Dchably.glb");

    let targetVideoSrc: string | null = null;
    if (isChablyFocused) {
      targetVideoSrc = videoTexturePathChably;
    } else if (isCameraFocused) {
      targetVideoSrc = videoTexturePath;
    }

    if (videoRef.current?.src !== targetVideoSrc) {
      if (videoTextureRef.current) {
        videoTextureRef.current.dispose();
        videoTextureRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = "";
        videoRef.current.load();
        videoRef.current = null;
      }
      setNeedsUserInteraction(false);
    }

    if (targetVideoSrc) {
      if (!videoRef.current) {
        const video = document.createElement("video");
        video.src = targetVideoSrc;
        video.crossOrigin = "anonymous";
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        video.autoplay = true;
        videoRef.current = video;

        video
          .play()
          .then(() => setNeedsUserInteraction(false))
          .catch(() => {
            setNeedsUserInteraction(true);
          });

        const texture = new THREE.VideoTexture(videoRef.current);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.format = THREE.RGBFormat;
        videoTextureRef.current = texture;
      }

      if (videoTextureRef.current) {
        scene.background = videoTextureRef.current;
      }

      if (
        videoRef.current &&
        !videoRef.current.paused &&
        !videoRef.current.error
      ) {
        setNeedsUserInteraction(false);
      }
    } else {
      if (is5xtFocused) {
        scene.background = new THREE.Color("black");
      } else {
        scene.background = null;
      }
      setNeedsUserInteraction(false);
    }

    return () => {
      if (videoTextureRef.current) {
        videoTextureRef.current.dispose();
        videoTextureRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = "";
        videoRef.current.load();
        videoRef.current = null;
      }
      setNeedsUserInteraction(false);
    };
  }, [focusedPath, scene, videoTexturePath, videoTexturePathChably]);

  const isCameraFocused = focusedPath?.endsWith("/models/camera.glb");
  const isChablyFocused = focusedPath?.endsWith("/models/3Dchably.glb");

  return (
    <>
      {focusedPath?.endsWith("/models/5xt.glb") && <Starfield />}
      {isCameraFocused && (
        <InteractiveGrid size={20} divisions={30} models={models} />
      )}
      {needsUserInteraction && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.7)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "1.5rem",
            flexDirection: "column",
          }}
        >
          <button
            style={{
              padding: "1em 2em",
              fontSize: "1.2rem",
              borderRadius: "8px",
              border: "none",
              background: "#222",
              color: "#fff",
              cursor: "pointer",
              marginBottom: "1em",
            }}
            onClick={handlePlayVideo}
          >
            ▶️ Activer la vidéo de fond
          </button>
          <span>Appuyez pour activer la vidéo de fond</span>
        </div>
      )}
    </>
  );
};

export default BackgroundController;
