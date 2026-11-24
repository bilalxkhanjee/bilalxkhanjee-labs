import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { loadImages } from "../lib/loadImages";
import { segment as seg } from "../lib/quad";
import { Nav } from "./Nav";
import { Preloader } from "./Preloader";
import { Portal, type PortalState } from "./Portal";
import { HeroCopy } from "./HeroCopy";
import { Ready } from "./Ready";
import { Credits } from "./Credits";
import styles from "./Page.module.css";

gsap.registerPlugin(ScrollTrigger);

const BASE = import.meta.env.BASE_URL;
const PHOTOS = [`${BASE}assets/desert.webp`, `${BASE}assets/bank-card.webp`];
const FONTS = ['300 1em "Geist"', '400 1em "Geist"', '500 1em "Geist"'];

// M1 · intro, in seconds from the moment everything has loaded
const T = { counter: 0, counterOut: 0.5, grow: 0.6, wordmarkOut: 0.7, light: 1.05, badge: 1.1, nav: 1.15, words: 1.25, buttons: 1.55, lead: 1.85, unlock: 2.3 };
const LOAD_SHARE = 0.9; // the counter follows loading up to 90%, then runs to 100 in the intro
// M3 · through the portal, as fractions of the scroll
const SCROLL_SCREENS = 1.5;
const SCRUB = 0.6;
const COPY_RISE = [0.2, 0.8] as const;
const COPY_RISE_PX = 120;
const READY_FADE = [0.79, 0.81] as const;
const DARK_AT = 0.76;
const REVEAL_AT = 0.8;
const UNREVEAL_AT = 0.74;
// reduced motion: a plain cross-fade
const CALM_FADE = [0.3, 0.6] as const;
// M4 · the bank card's float and tilt
const FLOAT_Y = 0.75;
const FLOAT_ROT = 0.75;
const TILT_Y = 8;
const TILT_X = 6;

export function Page() {
  const root = useRef<HTMLDivElement>(null);
  const main = useRef<HTMLElement>(null);
  const state = useRef<PortalState>({ scale: 0, face: 0, flash: 0, p: 0 });
  const counter = useRef({ v: 0 });
  const [photos, setPhotos] = useState<{ desert: string | null; card: string | null } | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // links to # would rewind the pinned page to the top
  useEffect(() => {
    const block = (e: MouseEvent) => {
      if ((e.target as Element | null)?.closest?.('a[href="#"]')) e.preventDefault();
    };
    document.addEventListener("click", block);
    return () => document.removeEventListener("click", block);
  }, []);

  // loading: photos (with byte progress) and fonts
  useEffect(() => {
    history.scrollRestoration = "manual";
    scrollTo(0, 0);
    document.documentElement.dataset.locked = "";
    const abort = new AbortController();
    let alive = true;
    const countEl = root.current!.querySelector<HTMLElement>('[data-preloader="count"]')!;
    const render = () => (countEl.textContent = String(Math.round(counter.current.v)).padStart(2, "0"));
    const follow = gsap.quickTo(counter.current, "v", { duration: 0.4, ease: "power1.out", onUpdate: render });
    let shown = 0;

    const images = loadImages(
      PHOTOS,
      (p) => {
        const next = p * LOAD_SHARE * 100;
        if (next > shown) follow((shown = next));
      },
      abort.signal,
    ).catch((err: unknown) => {
      if (alive) console.error("[portal] photos failed to load", err);
      return null;
    });
    const fonts = Promise.all(FONTS.map((f) => document.fonts.load(f))).catch(() => null);

    Promise.all([images, fonts]).then(([urls]) => {
      if (!alive) {
        urls?.forEach((u) => URL.revokeObjectURL(u));
        return;
      }
      gsap.killTweensOf(counter.current);
      setPhotos({ desert: urls?.[0] ?? null, card: urls?.[1] ?? null });
    });

    return () => {
      alive = false;
      abort.abort();
      gsap.killTweensOf(counter.current);
      delete document.documentElement.dataset.locked;
    };
  }, []);

  // the intro (M1), the scroll transition (M3) and the second screen's reveal (M4)
  useEffect(() => {
    if (!photos) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const s = state.current;
    const ctx = gsap.context((self) => {
      const q = <T extends Element = HTMLElement>(sel: string) => root.current!.querySelector<T>(sel)!;
      const qa = (sel: string) => Array.from(root.current!.querySelectorAll<HTMLElement>(sel));
      const nav = q('[data-intro="nav"]');
      const badge = q('[data-intro="badge"]');
      const h1 = q('[data-intro="headline"]');
      const heroWords = qa('[data-intro="headline"] [data-word]');
      const buttons = q('[data-intro="buttons"]');
      const lead = q('[data-intro="lead"]');
      const hero = q("[data-hero]");
      const layers = qa("[data-layer]");
      const countEl = q('[data-preloader="count"]');
      const counterBox = q('[data-preloader="counter"]');
      const preWordmark = q('[data-preloader="wordmark"]');
      const ready = q('[data-ready="section"]');
      const r = (name: string) => q(`[data-ready="${name}"]`);
      const firstWords = qa('[data-ready="first"] [data-word]');
      const secondWords = qa('[data-ready="second"] [data-word]');
      const cardImg = r("img");
      const unlock = () => {
        delete document.documentElement.dataset.locked;
        ScrollTrigger.refresh();
      };

      const blurIn = (tl: gsap.core.Timeline, el: Element, at: number, blur = 10) =>
        tl.fromTo(el, { opacity: 0, filter: `blur(${blur}px)` }, { opacity: 1, filter: "blur(0px)", duration: 0.6, ease: "power2.out", clearProps: "filter" }, at);
      const wordsIn = (tl: gsap.core.Timeline, words: Element[], at: number) =>
        tl.fromTo(
          words,
          { opacity: 0, filter: "blur(12px)", yPercent: 25 },
          { opacity: 1, filter: "blur(0px)", yPercent: 0, duration: 0.7, ease: "power2.out", stagger: 0.09, clearProps: "filter,transform" },
          at,
        );

      /* ------------------------------------------------------- M1 · intro */
      const intro = gsap.timeline();
      if (reduce) {
        Object.assign(s, { scale: 1, face: 1, flash: 0, p: 0 });
        gsap.set([h1, ...heroWords], { opacity: 1 });
        intro.fromTo([...layers, nav, badge, h1, buttons, lead], { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power1.out" }, 0);
        intro.call(unlock, undefined, 0.4);
      } else {
        const render = () => (countEl.textContent = String(Math.round(counter.current.v)).padStart(2, "0"));
        intro.to(counter.current, { v: 100, duration: 0.5, ease: "power1.out", onUpdate: render }, T.counter);
        intro.to(counterBox, { opacity: 0, duration: 0.15, ease: "power1.in" }, T.counterOut);
        intro.to(s, { scale: 1, duration: 0.85, ease: "power2.out" }, T.grow);
        intro.to(preWordmark, { opacity: 0, duration: 0.4, ease: "power1.out" }, T.wordmarkOut);
        intro.to(s, { keyframes: { face: [0, 0.8, 0.15, 1, 0.55, 1] }, duration: 0.45, ease: "none" }, T.light);
        intro.to(s, { keyframes: { flash: [0, 1, 0] }, duration: 0.7, ease: "power1.out" }, T.light);
        blurIn(intro, badge, T.badge);
        blurIn(intro, nav, T.nav, 8);
        intro.set(h1, { opacity: 1 }, T.words);
        wordsIn(intro, heroWords, T.words);
        blurIn(intro, buttons, T.buttons);
        blurIn(intro, lead, T.lead);
        intro.call(unlock, undefined, T.unlock);
      }

      /* ------------------------------------------- M4 · the second screen */
      const reveal = gsap.timeline({ paused: true });
      const readyEls = [r("card"), r("wordmark"), r("headline"), r("more"), r("text"), r("button"), r("scroll")];
      if (reduce) {
        gsap.set([...firstWords, ...secondWords], { opacity: 1 });
        reveal.fromTo(readyEls, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power1.out" }, 0);
      } else {
        reveal.fromTo(r("card"), { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power1.out" }, 0);
        reveal.fromTo(
          r("float"),
          { rotationY: -70, rotation: 18, scale: 0.75, filter: "blur(16px) brightness(1.6)" },
          { rotationY: 0, rotation: 0, scale: 1, filter: "blur(0px) brightness(1)", duration: 1.4, ease: "power3.out", clearProps: "filter" },
          0,
        );
        reveal.set(r("headline"), { opacity: 1 }, 0);
        wordsIn(reveal, firstWords, 0.15);
        wordsIn(reveal, secondWords, 0.3);
        reveal.fromTo(r("wordmark"), { opacity: 0 }, { opacity: 1, duration: 1, ease: "power1.out" }, 0.4);
        blurIn(reveal, r("more"), 0.55);
        blurIn(reveal, r("text"), 0.65);
        blurIn(reveal, r("button"), 0.75);
        blurIn(reveal, r("scroll"), 0.9);

        // the card floats all the time, and tilts toward the pointer
        gsap.fromTo(cardImg, { yPercent: FLOAT_Y, rotation: -FLOAT_ROT }, { yPercent: -FLOAT_Y, rotation: FLOAT_ROT, duration: 3.2, ease: "sine.inOut", yoyo: true, repeat: -1 });
        gsap.set(cardImg, { transformPerspective: 1200 });
        const tiltY = gsap.quickTo(cardImg, "rotationY", { duration: 0.8, ease: "power2.out" });
        const tiltX = gsap.quickTo(cardImg, "rotationX", { duration: 0.8, ease: "power2.out" });
        const tilt = (e: PointerEvent) => {
          tiltY((e.clientX / innerWidth - 0.5) * 2 * TILT_Y);
          tiltX(-(e.clientY / innerHeight - 0.5) * 2 * TILT_X);
        };
        addEventListener("pointermove", tilt);
        self.add(() => () => removeEventListener("pointermove", tilt));
      }

      /* --------------------------------------------- M3 · through the portal */
      ScrollTrigger.config({ ignoreMobileResize: true });
      let dark = false;
      let revealed = false;
      const setDark = (on: boolean) => {
        if (on === dark) return;
        dark = on;
        setTheme(on ? "dark" : "light");
      };
      const proxy = { p: 0 };
      gsap.to(proxy, {
        p: 1,
        ease: "none",
        scrollTrigger: {
          trigger: main.current,
          start: "top top",
          end: () => "+=" + innerHeight * SCROLL_SCREENS,
          pin: true,
          scrub: reduce ? true : SCRUB,
          invalidateOnRefresh: true,
        },
        onUpdate: () => {
          const p = proxy.p;
          if (reduce) {
            const o = seg(p, CALM_FADE[0], CALM_FADE[1]);
            ready.style.opacity = String(o);
            ready.style.visibility = o > 0 ? "visible" : "hidden";
            setDark(o >= 1);
            if (o >= 1 && !revealed) {
              revealed = true;
              reveal.timeScale(1).play();
            } else if (p < CALM_FADE[0] && revealed) {
              revealed = false;
              reveal.reverse();
            }
            return;
          }
          s.p = p;
          hero.style.transform = `translateY(calc(${(-COPY_RISE_PX * seg(p, COPY_RISE[0], COPY_RISE[1])).toFixed(3)} * var(--u)))`;
          const o = seg(p, READY_FADE[0], READY_FADE[1]);
          ready.style.opacity = String(o);
          ready.style.visibility = o > 0 ? "visible" : "hidden";
          setDark(p >= DARK_AT);
          if (p >= REVEAL_AT && !revealed) {
            revealed = true;
            reveal.timeScale(1).play();
          } else if (p < UNREVEAL_AT && revealed) {
            revealed = false;
            reveal.timeScale(2).reverse();
          }
        },
      });
    }, root);

    return () => {
      ctx.revert();
      delete document.documentElement.dataset.locked;
    };
  }, [photos]);

  return (
    <div ref={root}>
      <Nav theme={theme} />
      <div>
        <main ref={main} className={styles.main}>
          <Preloader />
          <Portal state={state} desert={photos?.desert ?? null} />
          <HeroCopy />
          <Ready card={photos?.card ?? null} />
        </main>
      </div>
      <Credits />
    </div>
  );
}
