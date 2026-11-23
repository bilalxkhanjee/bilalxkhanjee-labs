/** Redraws every glass canvas in the stage as a blurred copy of the cave behind its parent. */
export function drawGlass(stage: HTMLElement, cave: HTMLCanvasElement) {
  const src = cave.getBoundingClientRect();
  if (!src.width) return;
  const scale = cave.width / src.width; // device px per CSS px
  for (const canvas of stage.querySelectorAll<HTMLCanvasElement>("canvas[data-blur]")) {
    const host = canvas.parentElement!;
    const r = host.getBoundingClientRect();
    if (!r.width || !r.height || getComputedStyle(host).visibility === "hidden") continue;
    const blur = Number(canvas.dataset.blur);
    const pad = blur * 2; // reach past the element so its edges blur in what's around it
    const cssW = r.width + pad * 2;
    const cssH = r.height + pad * 2;
    const w = Math.max(1, Math.round(cssW * scale));
    const h = Math.max(1, Math.round(cssH * scale));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    Object.assign(canvas.style, { left: `${-pad}px`, top: `${-pad}px`, width: `${cssW}px`, height: `${cssH}px` });
    const ctx = canvas.getContext("2d")!;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.filter = `blur(${blur * scale}px)`;
    ctx.drawImage(cave, -(r.left - src.left - pad) * scale, -(r.top - src.top - pad) * scale);
    ctx.filter = "none";
  }
}
