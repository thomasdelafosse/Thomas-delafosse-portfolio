attribute vec3 aTarget;
attribute float aSize;
uniform float uMorph;
uniform float uBaseSize;
uniform float uDevicePixelRatio;
uniform vec3 uTargetOffset;
uniform float uTextScale;
varying float vStrength;
varying float vMorph;
void main() {
  vec3 pos = mix(position, aTarget * uTextScale + uTargetOffset, smoothstep(0.0, 1.0, uMorph));
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  float size = uBaseSize * aSize * (0.8 + 0.6 * uMorph) * uDevicePixelRatio * uTextScale;
  gl_PointSize = size;
  vStrength = aSize;
  vMorph = uMorph;
}

