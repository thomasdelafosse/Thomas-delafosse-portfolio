precision mediump float;
uniform vec3 uColor;
uniform float uAlpha;
uniform float uTime;
varying float vStrength;
varying float vMorph;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
  vec2 uv = gl_PointCoord.xy - 0.5;
  float d = length(uv);
  float mask = smoothstep(0.5, 0.48, d);
  if (mask <= 0.01) discard;
  float n = hash(floor(gl_FragCoord.xy) + vec2(vStrength * 10.0));
  float alpha = uAlpha * mask * (0.8 + 0.2 * n);
  vec3 color = uColor * (0.85 + 0.35 * n);
  gl_FragColor = vec4(color, alpha);
}

