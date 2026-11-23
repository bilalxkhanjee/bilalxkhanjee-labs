import { MENU_ICON_URL, PILL_BLUR } from "../config";
import styles from "./Header.module.css";

type Props = { revealed: boolean };

export default function Header({ revealed }: Props) {
  return (
    <header className={`${styles.header} ${revealed ? styles.revealed : ""}`}>
      <a href="#" className={styles.logo} aria-label="Nivra.Studio">
        <svg className={styles.mark} viewBox="0 0 33 33" aria-hidden="true">
          <path d="M16.5 2 31 31H2Z" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinejoin="round" />
          <path d="M16.5 13 24 28H9Z" fill="#fff" />
        </svg>
        <span className={styles.word}>
          Nivra<span className={styles.dot}>.</span>Studio
        </span>
      </a>
      <div className={styles.right}>
        <nav className={styles.pill} aria-label="Main">
          <canvas className={styles.glass} data-blur={PILL_BLUR} aria-hidden="true" />
          <a href="#about" className={`${styles.link} ${styles.active}`}>About</a>
          <a href="#expertise" className={styles.link}>Expertise</a>
          <a href="#projects" className={styles.link}>Projects</a>
        </nav>
        <div className={styles.menu}>
          <button type="button" className={styles.menuLabel}>Menu</button>
          <button type="button" className={styles.menuIcon} aria-label="Open menu">
            <img src={MENU_ICON_URL} width={12} height={12} alt="" />
          </button>
        </div>
      </div>
    </header>
  );
}
