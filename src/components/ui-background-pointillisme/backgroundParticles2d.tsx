import { useEffect, useMemo } from "react";
import { Canvas, useThree, invalidate } from "@react-three/fiber";
import * as THREE from "three";

const vertexShader = /* glsl */ `
uniform vec2 uResolution;
uniform sampler2D uPictureTexture;
varying vec3 vColor;


void main() {
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;
  gl_Position = projectedPosition;

  // Sample the red channel of the picture texture at the plane UVs
  float pictureIntensity = texture(uPictureTexture, uv).r;

  // Scale point size using the intensity and resolution, and keep perspective sizing
  gl_PointSize = 0.15 * pictureIntensity * uResolution.y;
  gl_PointSize *= (1.0 / -viewPosition.z);
  
      vColor = vec3(pow(pictureIntensity, 2.0));

}
`;

const fragmentShader = /* glsl */ `
varying vec3 vColor;

void main() {

    vec2 uv = gl_PointCoord;
    float distanceToCenter = length(uv - vec2(0.5));

       if(distanceToCenter > 0.5)
        discard;
    

    gl_FragColor = vec4(vColor, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

function Particles() {
  const { size, gl, camera } = useThree();

  const uniforms = useMemo(() => {
    return {
      uResolution: new THREE.Uniform(new THREE.Vector2(0, 0)),
      uPictureTexture: new THREE.Uniform(
        new THREE.TextureLoader().load("/images/moi.jpeg")
      ),
    } as Record<string, THREE.IUniform>;
  }, []);

  // Keep resolution uniform in sync with size and DPR
  useEffect(() => {
    const dpr = gl.getPixelRatio();
    (uniforms.uResolution.value as THREE.Vector2).set(
      size.width * dpr,
      size.height * dpr
    );
    invalidate();
  }, [size.width, size.height, gl, uniforms]);

  const [planeW, planeH] = useMemo(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const distance = Math.abs(cam.position.z);
    // Full-viewport plane size for a perspective camera
    const height =
      2 * Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2) * distance;
    const aspect = size.width / Math.max(1, size.height);
    const width = height * aspect;
    return [width, height];
  }, [camera, size.width, size.height]);

  return (
    <points>
      <planeGeometry args={[planeW, planeH, 256, 256]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms as unknown as Record<string, THREE.IUniform>}
      />
    </points>
  );
}

export default function BackgroundParticles() {
  return (
    <div
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}
    >
      <Canvas
        gl={{ antialias: true }}
        camera={{ fov: 35, position: [0, 0, 18] }}
        dpr={[1, 2]}
        style={{ position: "absolute", inset: 0 }}
      >
        <color attach="background" args={[0.094, 0.094, 0.094]} />
        <Particles />
      </Canvas>
    </div>
  );
}
