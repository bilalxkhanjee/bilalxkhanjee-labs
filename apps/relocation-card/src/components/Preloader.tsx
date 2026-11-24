import styles from "./Preloader.module.css";

const BASE = import.meta.env.BASE_URL;

export function Preloader() {
  return (
    <div className={styles.preloader}>
      <div className={styles.wordmark} data-preloader="wordmark">
        <img src={`${BASE}assets/wordmark.svg`} alt="" width={1400} height={192} />
      </div>
      <p className={`trim ${styles.counter}`} data-preloader="counter">
        <span data-preloader="count">00</span>%
      </p>
    </div>
  );
}
