import { useEffect, useRef } from "react";
import { CURSOR_SMOOTHING } from "../config";
import { damp, lerp } from "../lib/motion";
import styles from "./Cursor.module.css";

export default function Cursor({ active }: { active: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current!;
    const label = labelRef.current!;
    let alive = true;
    let raf = 0;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let tx = x;
    let ty = y;
    let last = performance.now();

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      root.classList.add(styles.visible);
    };
    const onLeave = () => root.classList.remove(styles.visible);
    const onOver = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest?.("a, button, [data-cursor-label]") as HTMLElement | null;
      root.classList.toggle(styles.hover, !!el);
      const text = el?.dataset.cursorLabel;
      if (text) label.textContent = text; // keeps its last text while it fades out
      root.classList.toggle(styles.labelled, !!text);
    };
    const tick = (now: number) => {
      if (!alive) return;
      const k = damp(CURSOR_SMOOTHING, Math.max(0, now - last));
      last = now;
      x = lerp(x, tx, k);
      y = lerp(y, ty, k);
      root.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove);
    document.documentElement.addEventListener("mouseleave", onLeave);
    document.addEventListener("pointerover", onOver);
    raf = requestAnimationFrame(tick);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("pointerover", onOver);
    };
  }, []);

  return (
    <div ref={rootRef} className={styles.cursor} data-active={active ? "true" : "false"} aria-hidden="true">
      <span className={styles.ring} />
      <span className={styles.dot} />
      <span ref={labelRef} className={styles.label} />
    </div>
  );
}
