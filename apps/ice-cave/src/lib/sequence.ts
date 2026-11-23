import { depthUrl, frameUrl } from "../config";

export type Frame = { color: HTMLImageElement; depth: HTMLImageElement };

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${url}`));
    img.src = url;
  });
}

/** Loads the frame sequence (colour + depth) in priority order and keeps every loaded frame. */
export class Sequence {
  count: number;
  frames: (Frame | null)[];
  private state: ("idle" | "loading" | "done" | "failed")[];
  private alive = true;
  private timer = 0;

  constructor(count: number) {
    this.count = count;
    this.frames = new Array(count).fill(null);
    this.state = new Array(count).fill("idle");
  }

  /** Loads one frame; resolves true when it's in, false if it failed. */
  load(i: number): Promise<boolean> {
    if (i < 0 || i >= this.count || this.state[i] !== "idle") {
      return Promise.resolve(this.state[i] === "done");
    }
    this.state[i] = "loading";
    return Promise.all([loadImage(frameUrl(i)), loadImage(depthUrl(i))]).then(
      ([color, depth]) => {
        if (!this.alive) return false;
        this.frames[i] = { color, depth };
        this.state[i] = "done";
        return true;
      },
      (err: unknown) => {
        if (this.alive) console.warn(`[sequence] frame ${i} failed`, err);
        this.state[i] = "failed";
        return false;
      },
    );
  }

  /** Frame 0 first; then 1–8 together; then batches of four, 20 ms apart. Resolves with frame 0's result. */
  start(): Promise<boolean> {
    const first = this.load(0);
    first.then(() => {
      if (!this.alive) return;
      const firstBatch = [];
      for (let i = 1; i <= 8 && i < this.count; i++) firstBatch.push(this.load(i));
      Promise.allSettled(firstBatch).then(() => this.next(9));
    });
    return first;
  }

  private next(from: number) {
    if (!this.alive || from >= this.count) return;
    const batch = [];
    for (let i = from; i < from + 4 && i < this.count; i++) batch.push(this.load(i));
    Promise.allSettled(batch).then(() => {
      if (!this.alive) return;
      this.timer = window.setTimeout(() => this.next(from + 4), 20);
    });
  }

  /** The frame asked for jumps the queue; returns the nearest loaded frame (index, index−1, index+1, …). */
  nearest(index: number): { index: number; frame: Frame } | null {
    if (this.state[index] === "idle") void this.load(index);
    for (let d = 0; d < this.count; d++) {
      const lo = index - d;
      if (lo >= 0 && this.frames[lo]) return { index: lo, frame: this.frames[lo]! };
      const hi = index + d;
      if (d > 0 && hi < this.count && this.frames[hi]) return { index: hi, frame: this.frames[hi]! };
    }
    return null;
  }

  dispose() {
    this.alive = false;
    window.clearTimeout(this.timer);
  }
}
