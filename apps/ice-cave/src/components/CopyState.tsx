import type { CSSProperties, Ref } from "react";
import styles from "./CopyState.module.css";

type Props = {
  ref?: Ref<HTMLElement>;
  heading: "h1" | "h2";
  line1: string;
  line2: string;
  text: string;
  button?: string;
  hidden?: boolean;
  last?: boolean;
  intro?: boolean;
};

function Words({ text, start }: { text: string; start: number }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((w, k) => (
        <span key={k}>
          <span data-word className={styles.word} style={{ "--i": start + k } as CSSProperties}>
            {w}
          </span>
          {k < words.length - 1 ? " " : null}
        </span>
      ))}
    </>
  );
}

export default function CopyState({ ref, heading: Heading, line1, line2, text, button, hidden, last, intro }: Props) {
  const n1 = line1.split(" ").length;
  const cls = [styles.state, hidden ? styles.hidden : "", last ? styles.last : "", intro ? styles.intro : ""].join(" ");
  return (
    <section ref={ref} className={cls}>
      <Heading className={styles.headline}>
        <span className={`trim sans ${styles.l1}`}>
          <Words text={line1} start={0} />
        </span>
        <span className={`trim serif ${styles.l2}`}>
          <Words text={line2} start={n1} />
        </span>
      </Heading>
      <div data-detail className={styles.detail}>
        <p className={styles.text}>{text}</p>
        {button ? (
          <a href="#projects" className={styles.button} data-cursor-label="Enter">
            {button}
          </a>
        ) : null}
      </div>
    </section>
  );
}
