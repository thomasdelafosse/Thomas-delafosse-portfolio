export function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

export function closestAngleDelta(from: number, to: number): number {
  const twoPi = Math.PI * 2;
  let delta = ((to - from + Math.PI) % twoPi) - Math.PI;
  if (delta < -Math.PI) delta += twoPi;
  return delta;
}

export function getWrappedIndex(
  currentIndex: number,
  delta: number,
  length: number
): number {
  if (length <= 0) return -1;
  return (currentIndex + delta + length) % length;
}
