import type { Ref } from "react";
import { Button } from "./Button";
import styles from "./Hero.module.css";

export function Hero({ ref, cueRef }: { ref?: Ref<HTMLElement>; cueRef?: Ref<HTMLSpanElement> }) {
  return (
    <header ref={ref} className={styles.hero}>
      <h1 className={styles.title}>
        The keyboard for <br />
        <em>vibecoders.</em>
      </h1>
      <p className={styles.lede}>
        A low-profile mechanical keyboard for Mac, with a vibe row: four keys to prompt, talk, reject and accept, right where
        your thumbs already are.
      </p>
      <div className={styles.cta}>
        <Button>Pre-order · $149</Button>
        <span ref={cueRef} className={styles.cue}>
          Scroll to look inside <span className={styles.arrow}>↓</span>
        </span>
      </div>
    </header>
  );
}
