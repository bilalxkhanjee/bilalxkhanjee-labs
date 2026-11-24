import styles from "./Credits.module.css";

const BASE = import.meta.env.BASE_URL;

// Zynter Soft branding and contacts, after the pinned screen (where "Scroll down for more" leads).
export function Credits() {
  return (
    <footer className={styles.credits}>
      <img className={styles.wordmark} src={`${BASE}assets/wordmark.svg`} alt="" width={1400} height={192} />
      <div className={styles.cols}>
        <div className={styles.col}>
          <img className={styles.zynter} src={`${BASE}assets/zynter-logo.png`} width={180} height={32} alt="Zynter Soft" />
          <a href="mailto:zyntersoft@gmail.com">zyntersoft@gmail.com</a>
          <a href="https://www.linkedin.com/company/zyntersoft" target="_blank" rel="noopener">
            Zynter Soft on LinkedIn ↗
          </a>
        </div>
        <div className={styles.col}>
          <p className={styles.name}>Muhammad Bilal</p>
          <a href="mailto:bilalxkhanjee@gmail.com">bilalxkhanjee@gmail.com</a>
          <a href="https://www.linkedin.com/in/bilalxkhanjee" target="_blank" rel="noopener">
            Muhammad Bilal on LinkedIn ↗
          </a>
        </div>
        <div className={styles.col}>
          <a href="/">All live builds ↗</a>
        </div>
      </div>
      <div className={styles.last}>
        <p>© 2026 Halvia (fictional) · A Zynter Soft demo</p>
        <p>Inspired by a MotionSites design. Redesigned by Muhammad Bilal.</p>
      </div>
    </footer>
  );
}
