import { useEffect, useRef, useState } from "react";
import styles from "./App.module.css";
import CopyState from "./components/CopyState";
import Cursor from "./components/Cursor";
import GlassCards from "./components/GlassCards";
import Header from "./components/Header";
import Preloader, { type Phase } from "./components/Preloader";
import {
  BURN_MS,
  FRAME_COUNT,
  INTRO_AT_MS,
  LOADER_TIMEOUT_MS,
  MIN_LOADER_MS,
  POINTER_SMOOTHING,
  SCROLL_SMOOTHING,
  TIMING,
  type Timing,
} from "./config";
import { BurnRenderer } from "./lib/burnRenderer";
import { DepthRenderer } from "./lib/depthRenderer";
import { drawGlass } from "./lib/glassBlur";
import { clamp, damp, easeInOutCubic, invLerp, lerp, stateStyle } from "./lib/motion";
import { Sequence } from "./lib/sequence";

const BASE = import.meta.env.BASE_URL;

type Block = { el: HTMLElement | null; timing: Timing; words: boolean };

export default function App() {
  const [phase, setPhase] = useState<Phase>("loading");

  const mainRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const caveHostRef = useRef<HTMLDivElement>(null);
  const probeRef = useRef<HTMLDivElement>(null);
  const burnHostRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const midRef = useRef<HTMLElement>(null);
  const finalRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const stage = stageRef.current!;
    const main = mainRef.current!;

    // canvases are made here, not in JSX, so StrictMode's second mount gets fresh contexts
    const caveCanvas = document.createElement("canvas");
    caveCanvas.className = styles.caveCanvas;
    caveCanvas.setAttribute("role", "img");
    caveCanvas.setAttribute("aria-label", "Journey through an ice cave");
    caveHostRef.current!.appendChild(caveCanvas);
    const burnCanvas = document.createElement("canvas");
    burnHostRef.current!.appendChild(burnCanvas);

    let cave: DepthRenderer | null = null;
    let burn: BurnRenderer | null = null;
    try {
      cave = new DepthRenderer(caveCanvas);
    } catch (e) {
      console.error(e);
    }
    try {
      burn = new BurnRenderer(burnCanvas);
      burn.draw(0);
    } catch (e) {
      console.error(e);
    }

    // ---- loading (M1)
    const seq = new Sequence(FRAME_COUNT);
    let ready = false;
    const frame0 = seq.start().then((ok) => {
      if (!ok) console.warn("[loader] frame 0 failed; opening on the empty canvas");
    });
    const fonts = Promise.all([
      document.fonts.load('400 1em "Instrument Sans"'),
      document.fonts.load('italic 400 1em "Instrument Serif"'),
    ]).catch((e: unknown) => console.warn("[loader] font failed", e));
    Promise.allSettled([frame0, fonts]).then(() => {
      if (alive) ready = true;
    });
    const timeout = window.setTimeout(() => {
      ready = true;
    }, LOADER_TIMEOUT_MS);

    // ---- phase sequence, driven from this closure
    let localPhase: Phase = "loading";
    const go = (p: Phase) => {
      if (!alive || localPhase === p) return;
      localPhase = p;
      setPhase(p);
    };
    const loadStart = performance.now();
    let burnStart = -1;
    const timers: number[] = [];

    // ---- scroll, pointer, unit
    let unit = 1;
    let target = 0;
    let progress = 0;
    let ptx = 0, pty = 0, px = 0, py = 0;
    const measure = () => {
      unit = probeRef.current!.getBoundingClientRect().width / 100 || 1;
      const rect = main.getBoundingClientRect();
      target = clamp(-rect.top / Math.max(1, main.offsetHeight - window.innerHeight));
      if (localPhase === "loading") burn?.draw(0);
    };
    const onScroll = () => {
      const rect = main.getBoundingClientRect();
      target = clamp(-rect.top / Math.max(1, main.offsetHeight - window.innerHeight));
    };
    const onPointer = (e: PointerEvent) => {
      if (reduce) return;
      ptx = (e.clientX / window.innerWidth - 0.5) * 2;
      pty = (0.5 - e.clientY / window.innerHeight) * 2;
    };
    const onLeave = () => {
      ptx = 0;
      pty = 0;
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    window.addEventListener("pointermove", onPointer);
    document.documentElement.addEventListener("mouseleave", onLeave);

    const blocks: Block[] = [
      { el: heroRef.current, timing: TIMING.hero, words: false },
      { el: midRef.current, timing: TIMING.mid, words: true },
      { el: cardsRef.current, timing: TIMING.cards, words: false },
      { el: finalRef.current, timing: TIMING.final, words: true },
    ];
    const blockWords = blocks.map((b) => (b.words && b.el ? [...b.el.querySelectorAll<HTMLElement>("[data-word]")] : []));
    const blockDetail = blocks.map((b) => (b.words && b.el ? b.el.querySelector<HTMLElement>("[data-detail]") : null));

    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      if (!alive) return;
      const dt = Math.max(0, now - last);
      last = now;

      // M1 counter
      if (localPhase === "loading") {
        const elapsed = now - loadStart; // unclamped on purpose: the first frames may show −1
        const value = Math.floor(Math.min(elapsed / MIN_LOADER_MS, 1, ready ? 1 : 0.99) * 100);
        if (countRef.current) countRef.current.textContent = String(value);
        if (barRef.current) barRef.current.style.transform = `scaleX(${value / 100})`;
        if (Math.max(0, elapsed) >= MIN_LOADER_MS && ready) {
          if (countRef.current) countRef.current.textContent = "100";
          if (barRef.current) barRef.current.style.transform = "scaleX(1)";
          if (reduce) {
            go("ready");
            timers.push(window.setTimeout(() => go("done"), 200));
          } else {
            burnStart = now;
            go("burning");
          }
        }
      }

      // M2 burn
      if (burnStart >= 0) {
        const since = Math.max(0, now - burnStart);
        const t = Math.min(since / BURN_MS, 1);
        burn?.draw(easeInOutCubic(t));
        if (since >= INTRO_AT_MS && localPhase === "burning") go("ready");
        if (t >= 1) {
          go("done");
          burnStart = -1;
        }
      }

      // M4 scroll story
      progress = lerp(progress, target, damp(SCROLL_SMOOTHING, dt));
      const kp = damp(POINTER_SMOOTHING, dt);
      px = lerp(px, ptx, kp);
      py = lerp(py, pty, kp);
      const index = Math.round(progress * (FRAME_COUNT - 1));
      const found = seq.nearest(index);
      if (cave && found && cave.draw(found.frame, px, py)) drawGlass(stage, caveCanvas);

      blocks.forEach((b, bi) => {
        if (!b.el) return;
        const s = stateStyle(progress, b.timing);
        b.el.style.opacity = String(s.opacity);
        b.el.style.transform = `translate3d(0, ${s.y * unit}px, 0)`;
        b.el.style.visibility = s.visible ? "visible" : "hidden";
        if (b.words && b.timing.enter) {
          const local = invLerp(b.timing.enter[0], b.timing.enter[1], progress);
          const words = blockWords[bi];
          const n = words.length;
          words.forEach((w, i) => w.style.setProperty("--reveal", clamp((local - (i / n) * 0.58) / 0.34).toFixed(4)));
          blockDetail[bi]?.style.setProperty("--detail", clamp((local - 0.62) / 0.38).toFixed(4));
        }
      });

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.clearTimeout(timeout);
      timers.forEach((t) => window.clearTimeout(t));
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      window.removeEventListener("pointermove", onPointer);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      seq.dispose();
      cave?.dispose();
      burn?.dispose();
      caveCanvas.remove();
      burnCanvas.remove();
    };
  }, []);

  const introStarted = phase === "ready" || phase === "done";

  return (
    <>
      <main ref={mainRef} className={styles.scene}>
        <div ref={stageRef} className={styles.stage}>
          <div ref={caveHostRef} className={styles.caveHost} />
          <div className={styles.shade} />
          <div ref={probeRef} className={styles.probe} aria-hidden="true" />
          <div className={styles.content}>
            <GlassCards ref={cardsRef} />
            <CopyState
              ref={heroRef}
              heading="h1"
              line1="See through complexity."
              line2="Find what matters."
              text="We design intelligent systems that turn complex data, workflows and infrastructure into clear, scalable products."
              button="Explore Nivra"
              intro={introStarted}
            />
            <CopyState
              ref={midRef}
              heading="h2"
              line1="Complex systems."
              line2="Clear direction."
              text="From fragmented tools to connected infrastructure, Nivra brings every layer into focus."
              hidden
            />
            <CopyState
              ref={finalRef}
              heading="h2"
              line1="Built around"
              line2="what matters."
              text="One connected system. Designed from the core outward."
              hidden
              last
            />
          </div>
          <Header revealed={introStarted} />
          <Preloader phase={phase} hostRef={burnHostRef} countRef={countRef} barRef={barRef} />
        </div>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footTop}>
          <p className={styles.footHead}>
            Nivra<span className={styles.footDot}>.</span>Studio
          </p>
          <p className={styles.footLead}>Let’s design the system behind your next product.</p>
        </div>
        <div className={styles.footCols}>
          <div className={styles.footCol}>
            <img className={styles.zynter} src={`${BASE}zynter-logo.png`} width={180} height={32} alt="Zynter Soft" />
            <a href="mailto:zyntersoft@gmail.com?subject=Project%20enquiry">zyntersoft@gmail.com</a>
            <a href="https://www.linkedin.com/company/zyntersoft" target="_blank" rel="noopener">Zynter Soft on LinkedIn ↗</a>
          </div>
          <div className={styles.footCol}>
            <p className={styles.footName}>Muhammad Bilal</p>
            <a href="mailto:bilalxkhanjee@gmail.com">bilalxkhanjee@gmail.com</a>
            <a href="https://www.linkedin.com/in/bilalxkhanjee" target="_blank" rel="noopener">Muhammad Bilal on LinkedIn ↗</a>
          </div>
          <div className={styles.footCol}>
            <a href="/">All live builds ↗</a>
            <a href="#">Back to top ↑</a>
          </div>
        </div>
        <div className={styles.footLast}>
          <p>© 2026 Nivra.Studio (fictional) · A Zynter Soft demo</p>
          <p>Inspired by a MotionSites design. Redesigned by Muhammad Bilal.</p>
        </div>
      </footer>

      <Cursor active={introStarted} />
    </>
  );
}
