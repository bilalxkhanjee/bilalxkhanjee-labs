import type { Ref } from "react";
import styles from "./Preloader.module.css";

export type Phase = "loading" | "burning" | "ready" | "done";

type Props = {
  phase: Phase;
  hostRef: Ref<HTMLDivElement>;
  countRef: Ref<HTMLSpanElement>;
  barRef: Ref<HTMLDivElement>;
};

export default function Preloader({ phase, hostRef, countRef, barRef }: Props) {
  return (
    <div className={`${styles.preloader} ${styles[phase] ?? ""}`}>
      <div ref={hostRef} className={styles.burn} />
      <div className={styles.ui}>
        <p className={`trim serif ${styles.counter}`} role="status" aria-label="Loading">
          <span ref={countRef}>0</span>%
        </p>
        <div className={styles.track}>
          <div ref={barRef} className={styles.bar} />
        </div>
      </div>
    </div>
  );
}
