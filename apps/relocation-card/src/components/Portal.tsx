import { useEffect, useRef, type MutableRefObject } from "react";
import { lerpQuad, quadToMatrix3d, rectQuad, scaleQuad, segment as seg, type Quad } from "../lib/quad";
import styles from "./Portal.module.css";

const BASE = import.meta.env.BASE_URL;

// Written by Page (GSAP and ScrollTrigger), read here every frame. All 0 → 1.
export type PortalState = { scale: number; face: number; flash: number; p: number };

// the glass card in the 4096 × 2640 photo, in image pixels (top left, top right, bottom right, bottom left)
const IMG_W = 4096;
const IMG_H = 2640;
const CARD_CORNERS: [number, number][] = [[1738, 944], [2359, 994], [2359, 1984], [1738, 2052]];
const PLANE_W = 652;
const PLANE_H = 1024;
const DOLLY = 0.18; // camera move: how much the photo grows around the card
const TURN_END = 0.45;
const DOLLY_END = 0.7;
const GROW = [0.5, 0.82] as const;
const LIGHT_OFF = [0.15, 0.4] as const;
const RIM_ON = [0.1, 0.4] as const;
const FILL_ON = [0.35, 0.62] as const;
const TURN_HEIGHT = 1.06;
const OVERHANG = 1.2;

const inOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

export function Portal({ state, desert }: { state: MutableRefObject<PortalState>; desert: string | null }) {
  const media = useRef<HTMLDivElement>(null);
  const over = useRef<HTMLDivElement>(null);
  const photo = useRef<HTMLDivElement>(null);
  const light = useRef<HTMLDivElement>(null);
  const portal = useRef<HTMLDivElement>(null);
  const rim = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    let dirty = true;
    let last = "";
    const ro = new ResizeObserver(() => (dirty = true));
    ro.observe(media.current!);
    ro.observe(photo.current!);

    const frame = () => {
      raf = requestAnimationFrame(frame);
      const s = state.current;
      const key = `${s.scale}|${s.face}|${s.flash}|${s.p}`;
      if (!dirty && key === last) return;
      dirty = false;
      last = key;

      const m = media.current!;
      const box = photo.current!;
      const W = m.offsetWidth;
      const H = m.offsetHeight;
      const bx = box.offsetLeft;
      const by = box.offsetTop;
      const bw = box.offsetWidth;
      const bh = box.offsetHeight;
      const p = s.p;

      // 1. the intro's grow
      m.style.transform = over.current!.style.transform = `scale(${s.scale})`;

      // 2. the card in the photo
      const base = CARD_CORNERS.map(([x, y]) => ({ x: bx + (x / IMG_W) * bw, y: by + (y / IMG_H) * bh })) as Quad;
      const c = { x: base.reduce((a, q) => a + q.x, 0) / 4, y: base.reduce((a, q) => a + q.y, 0) / 4 };

      // 3. camera move around the card
      const d = 1 + DOLLY * inOut(seg(p, 0, DOLLY_END));
      box.style.transformOrigin = `${c.x - bx}px ${c.y - by}px`;
      box.style.transform = `scale(${d})`;
      const inPhoto = scaleQuad(base, c, d);

      // 4. the card turns to face the camera
      const h = ((inPhoto[3].y - inPhoto[0].y + inPhoto[2].y - inPhoto[1].y) / 2) * TURN_HEIGHT;
      const turned = lerpQuad(inPhoto, rectQuad(c.x, c.y, (h * PLANE_W) / PLANE_H, h), inOut(seg(p, 0, TURN_END)));

      // 5. and grows past the edges of the screen
      const coverH = Math.max(H, (W * PLANE_H) / PLANE_W) * OVERHANG;
      const cover = rectQuad(W / 2, H / 2, (coverH * PLANE_W) / PLANE_H, coverH);
      const quad = lerpQuad(turned, cover, seg(p, GROW[0], GROW[1]) ** 3);

      // 6. both planes on the same corners
      light.current!.style.transform = portal.current!.style.transform = quadToMatrix3d(PLANE_W, PLANE_H, quad);

      // 7. opacities
      light.current!.style.opacity = String(s.face * (1 - seg(p, LIGHT_OFF[0], LIGHT_OFF[1])));
      rim.current!.style.opacity = String(Math.max(s.flash, seg(p, RIM_ON[0], RIM_ON[1])));
      fill.current!.style.opacity = String(seg(p, FILL_ON[0], FILL_ON[1]));
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [state]);

  return (
    <>
      <div ref={media} className={styles.media} data-layer="media">
        <div ref={photo} className={styles.photo}>
          {desert ? <img src={desert} alt="A glass card standing in a desert at sunset" /> : null}
        </div>
        <div ref={light} className={styles.plane + " " + styles.light} aria-hidden="true">
          <div className={styles.face}>
            <img className={styles.cardLogo} src={`${BASE}assets/card-logo.svg`} alt="" />
            <img className={styles.chip} src={`${BASE}assets/card-chip.svg`} alt="" />
            <span className={`trim ${styles.cardText} ${styles.name}`}>SEAN GALT</span>
            <span className={`trim ${styles.cardText} ${styles.number}`}>9276 9400 2812 0000</span>
          </div>
        </div>
      </div>
      <div ref={over} className={styles.over} data-layer="over">
        <div ref={portal} className={styles.plane} aria-hidden="true">
          <div ref={fill} className={styles.fill} />
          <div ref={rim} className={styles.rim} />
        </div>
      </div>
    </>
  );
}
