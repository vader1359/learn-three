varying vec2 vUv;
uniform sampler2D tDiffuse1;
uniform sampler2D tDiffuse2;
uniform sampler2D tDiffuse3;

void main() {
  vec4 del0 = texture2D(tDiffuse1, vUv);
  vec4 del1 = texture2D(tDiffuse2, vUv);
  vec4 del2 = texture2D(tDiffuse3, vUv);
  float alpha = min(min(del0.a, del1.a), del2.a);
  gl_FragColor = vec4(del0.r, del1.g, del2.b, alpha);
}
