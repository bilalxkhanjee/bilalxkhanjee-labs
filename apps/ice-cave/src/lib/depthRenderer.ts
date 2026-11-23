import { DEPTH_STRENGTH, FRAME_ASPECT } from "../config";
import { FULLSCREEN_VERT, createProgram, createQuad, fitCanvas } from "./gl";
import type { Frame } from "./sequence";

const FRAG = `
precision highp float;
uniform sampler2D uColor;
uniform sampler2D uDepth;
uniform vec2 uPointer;
uniform vec2 uStrength;
uniform vec2 uCoverScale;
varying vec2 vUv;
void main() {
  vec2 uv = (vUv - 0.5) * uCoverScale + 0.5;
  float depth = texture2D(uDepth, uv).r;
  vec2 displaced = uv + uPointer * uStrength * (depth - 0.5) * 2.0;
  displaced = clamp(displaced, vec2(0.008), vec2(0.992));
  gl_FragColor = texture2D(uColor, displaced);
}`;

/** Draws one cave frame with depth parallax. */
export class DepthRenderer {
  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  buffer: WebGLBuffer;
  colorTex: WebGLTexture;
  depthTex: WebGLTexture;
  uPointer: WebGLUniformLocation | null;
  uCoverScale: WebGLUniformLocation | null;
  current: Frame | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const gl = canvas.getContext("webgl", { alpha: false, antialias: false, preserveDrawingBuffer: true });
    if (!gl) throw new Error("WebGL is not available");
    this.gl = gl;
    this.program = createProgram(gl, FULLSCREEN_VERT, FRAG);
    gl.useProgram(this.program);
    this.buffer = createQuad(gl, this.program);
    this.colorTex = this.makeTexture(0);
    this.depthTex = this.makeTexture(1);
    gl.uniform1i(gl.getUniformLocation(this.program, "uColor"), 0);
    gl.uniform1i(gl.getUniformLocation(this.program, "uDepth"), 1);
    gl.uniform2f(gl.getUniformLocation(this.program, "uStrength"), DEPTH_STRENGTH.x, DEPTH_STRENGTH.y);
    this.uPointer = gl.getUniformLocation(this.program, "uPointer");
    this.uCoverScale = gl.getUniformLocation(this.program, "uCoverScale");
  }

  private makeTexture(unit: number) {
    const gl = this.gl;
    const tex = gl.createTexture()!;
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    return tex;
  }

  /** Returns true if something was drawn. */
  draw(frame: Frame | null, px: number, py: number) {
    if (!frame || !fitCanvas(this.canvas)) return false;
    const gl = this.gl;
    if (frame !== this.current) {
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.colorTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, frame.color);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.depthTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, frame.depth);
      this.current = frame;
    }
    const view = this.canvas.width / this.canvas.height;
    const cover = view > FRAME_ASPECT ? [1, FRAME_ASPECT / view] : [view / FRAME_ASPECT, 1];
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.uniform2f(this.uCoverScale, cover[0], cover[1]);
    gl.uniform2f(this.uPointer, px, py);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    return true;
  }

  dispose() {
    const gl = this.gl;
    gl.deleteTexture(this.colorTex);
    gl.deleteTexture(this.depthTex);
    gl.deleteBuffer(this.buffer);
    gl.deleteProgram(this.program);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  }
}
