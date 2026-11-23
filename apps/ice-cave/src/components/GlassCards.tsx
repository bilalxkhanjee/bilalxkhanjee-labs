import type { Ref } from "react";
import { CARD_BLUR } from "../config";
import styles from "./GlassCards.module.css";

const CARDS = [
  { title: "Intelligence", text: "AI systems built around real workflows, decisions and measurable outcomes.", side: "left" },
  {
    title: "Infrastructure",
    text: "Scalable foundations that connect products, data and teams without adding complexity.",
    side: "right",
  },
] as const;

export default function GlassCards({ ref }: { ref?: Ref<HTMLDivElement> }) {
  return (
    <div ref={ref} className={styles.cards}>
      {CARDS.map((c) => (
        <article key={c.title} className={`${styles.card} ${styles[c.side]}`}>
          <canvas className={styles.glass} data-blur={CARD_BLUR} aria-hidden="true" />
          <div className={styles.body}>
            <h3 className={styles.title}>{c.title}</h3>
            <p className={styles.text}>{c.text}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
