import * as THREE from "three";

export function generateTextPositions(
  text: string,
  canvasWidth: number,
  canvasHeight: number,
  halfWidthWorld: number,
  halfHeightWorld: number
): number[] {
  const off = document.createElement("canvas");
  off.width = canvasWidth;
  off.height = canvasHeight;
  const ctx = off.getContext("2d");
  if (!ctx) return [];

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.fillStyle = "white";

  const fontSize = Math.floor(canvasHeight * 0.6);
  ctx.font = `${fontSize}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvasWidth / 2, canvasHeight / 2);

  const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
  const data = imageData.data;

  const positions: number[] = [];
  const step = 2;
  for (let y = 0; y < canvasHeight; y += step) {
    for (let x = 0; x < canvasWidth; x += step) {
      const i = (y * canvasWidth + x) * 4;
      const alpha = data[i + 3];
      if (alpha > 100) {
        const nx = (x / canvasWidth) * 2 - 1;
        const ny = 1 - (y / canvasHeight) * 2;
        positions.push(nx * halfWidthWorld, ny * halfHeightWorld, 0);
      }
    }
  }
  return positions;
}

export function createParticleAttributes(
  desiredCount: number,
  halfWidthWorld: number,
  halfHeightWorld: number,
  textPositions: number[]
) {
  const startPositions = new Float32Array(desiredCount * 3);
  for (let i = 0; i < desiredCount; i += 1) {
    const x = THREE.MathUtils.lerp(
      -halfWidthWorld,
      halfWidthWorld,
      Math.random()
    );
    const y = THREE.MathUtils.lerp(
      -halfHeightWorld,
      halfHeightWorld,
      Math.random()
    );
    const z = 0;
    startPositions[i * 3] = x;
    startPositions[i * 3 + 1] = y;
    startPositions[i * 3 + 2] = z;
  }

  const targetPositions = new Float32Array(desiredCount * 3);
  const texCount = Math.max(1, Math.floor(textPositions.length / 3));
  for (let i = 0; i < desiredCount; i += 1) {
    const t = textPositions[(i % texCount) * 3 + 0] ?? 0;
    const u = textPositions[(i % texCount) * 3 + 1] ?? 0;
    const v = textPositions[(i % texCount) * 3 + 2] ?? 0;
    targetPositions[i * 3] = t;
    targetPositions[i * 3 + 1] = u;
    targetPositions[i * 3 + 2] = v;
  }

  const sizes = new Float32Array(desiredCount);
  for (let i = 0; i < desiredCount; i += 1) {
    sizes[i] = 0.7 + Math.random() * 1.3;
  }

  return { startPositions, targetPositions, sizes };
}

export function getClampedDevicePixelRatio(max = 2): number {
  return Math.min(
    (typeof window !== "undefined" ? window.devicePixelRatio : 1) || 1,
    max
  );
}
