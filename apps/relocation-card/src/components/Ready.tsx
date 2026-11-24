import { Words } from "./Words";
import styles from "./Ready.module.css";

const BASE = import.meta.env.BASE_URL;

// The second screen, revealed once the portal has opened.
export function Ready({ card }: { card: string | null }) {
  return (
    <section className={styles.ready} data-ready="section">
      <div className={styles.wordmark} data-ready="wordmark">
        <img src={`${BASE}assets/wordmark.svg`} alt="" width={1400} height={192} />
      </div>

      <div className={styles.card} data-ready="card">
        <div className={styles.float} data-ready="float">
          {card ? <img src={card} alt="A pale-blue Halvia bank card" data-ready="img" /> : <img alt="" data-ready="img" />}
        </div>
      </div>

      <h2 className={styles.headlines} aria-label="Everything Ready Before You Land" data-ready="headline">
        <span className={`trim ${styles.display} ${styles.first}`} aria-hidden="true" data-ready="first">
          <Words text="Everything Ready" className={styles.word} />
        </span>
        <span className={`trim ${styles.display} ${styles.second}`} aria-hidden="true" data-ready="second">
          <Words text="Before You Land" className={styles.word} />
        </span>
      </h2>

      <a href="#" className={styles.more} data-ready="more">
        <img src={`${BASE}assets/icon-plus.svg`} alt="" className={styles.icon} />
        <span className={`trim ${styles.ui}`}>More</span>
      </a>

      <p className={`trim ${styles.text}`} data-ready="text">
        Open your account remotely, receive your digital card instantly, and arrive with payments, currency exchange, and banking
        already set up.
      </p>

      <a href="#" className={styles.button} data-ready="button">
        <span className={`trim ${styles.small}`}>Open account for free</span>
      </a>

      <p className={`trim ${styles.scroll}`} data-ready="scroll">
        Scroll down for more ↓
      </p>
    </section>
  );
}
