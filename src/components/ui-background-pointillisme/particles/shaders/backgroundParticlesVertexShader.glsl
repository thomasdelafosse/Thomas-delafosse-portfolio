attribute float aSize;

uniform float uBaseSize;
uniform float uDevicePixelRatio;
uniform float uHalfH;
uniform vec2 uBulge1;
uniform vec2 uBulge2;
uniform float uBulgeFalloff;
uniform float uBulgeStrength;
uniform vec2 uWaveFreq;
uniform float uWaveAmplitude;
uniform float uMinScale;
uniform float uMaxScale;

varying float vStrength;

float gaussianFalloff(float d, float k){
  return exp(-d * k);
}

void main() {
  vec3 pos = position;

  float d1 = length(pos.xy - uBulge1);
  float d2 = length(pos.xy - uBulge2);
  float bulge = uBulgeStrength * (gaussianFalloff(d1, uBulgeFalloff) + gaussianFalloff(d2, uBulgeFalloff));

  float waves = uWaveAmplitude * (sin(pos.x * uWaveFreq.x) * cos(pos.y * uWaveFreq.y));

  float t = clamp((pos.y + uHalfH) / (2.0 * uHalfH), 0.0, 1.0);
  float vertical = mix(1.0, 0.4, t);

  float scale = clamp(vertical + bulge + waves, uMinScale, uMaxScale);

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  float size = uBaseSize * aSize * scale * uDevicePixelRatio;
  gl_PointSize = size;
  vStrength = aSize;
}

