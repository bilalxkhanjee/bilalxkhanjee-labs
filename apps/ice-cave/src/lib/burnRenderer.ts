import { FULLSCREEN_VERT, createProgram, createQuad, fitCanvas } from "./gl";

const FRAG = `
precision highp float;
varying vec2 vUv;
uniform vec2 uResolution;
uniform float uProgress;
uniform float uTime;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0)), f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.03 + vec2(13.7, 8.4); a *= 0.5; }
  return v;
}
void main() {
  vec2 uv = vUv;
  vec2 p = uv - 0.5;
  p.x *= uResolution.x / uResolution.y;
  float n = fbm(uv * 3.1 + vec2(uTime * 0.035, -uTime * 0.025));
  float detail = fbm(uv * 8.4 - vec2(uTime * 0.02));
  float field = length(p) + (n - 0.5) * 0.24 + (detail - 0.5) * 0.065;
  float reach = max(1.02, 1.02 * length(vec2(0.5 * uResolution.x / uResolution.y, 0.5)) / 0.9434) + 0.06;
  float threshold = mix(-0.22, reach, uProgress);
  float edge = 0.045;
  float alpha = smoothstep(threshold - edge, threshold + edge, field);
  float rim = 1.0 - smoothstep(0.006, 0.052, abs(field - threshold));
  float coverage = max(alpha, rim * 0.18);
  vec3 blue = vec3(96.0, 154.0, 202.0) / 255.0;
  vec3 color = mix(blue, vec3(1.0), rim * 0.68);
  gl_FragColor = vec4(color * coverage, coverage);
}`;

/** The preloader's frost-blue screen and its melt. */
export class BurnRenderer {
  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  buffer: WebGLBuffer;
  uResolution: WebGLUniformLocation | null;
  uProgress: WebGLUniformLocation | null;
  uTime: WebGLUniformLocation | null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const gl = canvas.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: true });
    if (!gl) throw new Error("WebGL is not available");
    this.gl = gl;
    this.program = createProgram(gl, FULLSCREEN_VERT, FRAG);
    gl.useProgram(this.program);
    this.buffer = createQuad(gl, this.program);
    this.uResolution = gl.getUniformLocation(this.program, "uResolution");
    this.uProgress = gl.getUniformLocation(this.program, "uProgress");
    this.uTime = gl.getUniformLocation(this.program, "uTime");
  }

  draw(progress: number) {
    if (!fitCanvas(this.canvas)) return;
    const gl = this.gl;
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(this.uResolution, this.canvas.width, this.canvas.height);
    gl.uniform1f(this.uProgress, progress);
    gl.uniform1f(this.uTime, performance.now() / 1000);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  dispose() {
    const gl = this.gl;
    gl.deleteBuffer(this.buffer);
    gl.deleteProgram(this.program);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  }
}
