import { useEffect, useRef } from "react";
import styles from "./Cursor.module.css";

const FOLLOW = 0.3; // share of the remaining distance covered per 60 fps frame

// A glass disc that eases toward the pointer (mouse devices only).
export function Cursor() {
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const disc = el.current!;
    let x = innerWidth / 2;
    let y = innerHeight / 2;
    let tx = x;
    let ty = y;
    let seen = false;
    let last = performance.now();
    let raf = 0;
    const move = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!seen) {
        x = tx;
        y = ty;
        seen = true;
      }
      disc.style.opacity = "1";
    };
    const out = (e: MouseEvent) => {
      if (!e.relatedTarget) disc.style.opacity = "0";
    };
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const k = 1 - Math.pow(1 - FOLLOW, Math.max(0, now - last) / 16.67);
      last = now;
      x += (tx - x) * k;
      y += (ty - y) * k;
      disc.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    };
    addEventListener("pointermove", move);
    document.addEventListener("mouseout", out);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", move);
      document.removeEventListener("mouseout", out);
    };
  }, []);

  return <div ref={el} className={styles.cursor} aria-hidden="true" />;
}
