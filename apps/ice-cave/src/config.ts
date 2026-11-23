const ASSET_BASE = "https://assets.uberdesigner.ai/alpha-project";

export const FRAME_COUNT = 120;
const pad = (n: number) => String(n).padStart(3, "0");
export const frameUrl = (n: number) => `${ASSET_BASE}/cave-${pad(n)}.jpg`;
export const depthUrl = (n: number) => `${ASSET_BASE}/depth-${pad(n)}.webp`;
export const MENU_ICON_URL = `${ASSET_BASE}/menu.svg`;
export const FRAME_ASPECT = 1920 / 1080;

export const SCROLL_SMOOTHING = 0.09; // per 60 fps frame
export const DEPTH_STRENGTH = { x: 0.0144, y: 0.0108 };
export const POINTER_SMOOTHING = 0.055; // per 60 fps frame
export const CURSOR_SMOOTHING = 0.2; // per 60 fps frame

export type Timing = { enter?: [number, number]; exit?: [number, number] };
export const TIMING: Record<"hero" | "mid" | "cards" | "final", Timing> = {
  // in scroll progress 0…1
  hero: { exit: [0.16, 0.28] },
  mid: { enter: [0.38, 0.46], exit: [0.58, 0.68] },
  cards: { enter: [0.76, 0.84] },
  final: { enter: [0.82, 0.9] },
};
export const ENTER_RISE = 24;
export const EXIT_LIFT = -16; // design px
export const MIN_LOADER_MS = 1500;
export const LOADER_TIMEOUT_MS = 8000;
export const BURN_MS = 1150;
export const INTRO_AT_MS = 760;
export const PILL_BLUR = 16;
export const CARD_BLUR = 24; // CSS px
