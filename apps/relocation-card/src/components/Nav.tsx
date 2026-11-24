import type { CSSProperties } from "react";
import styles from "./Nav.module.css";

const BASE = import.meta.env.BASE_URL;
const LINKS = ["Product", "Benefits", "Countries", "Pricing", "Support"];

// Fixed header: white over the photo, ink on the second screen ("Benefits" active there).
export function Nav({ theme }: { theme: "light" | "dark" }) {
  const active = theme === "dark" ? "Benefits" : "Product";
  return (
    <nav className={styles.nav} data-theme={theme} data-intro="nav">
      <a href="#" className={styles.logo} aria-label="Halvia home" style={{ "--logo": `url(${BASE}assets/logo.svg)` } as CSSProperties} />
      <div className={styles.pill}>
        {LINKS.map((l) => (
          <a key={l} href="#" className={`${styles.link} ${l === active ? styles.active : ""}`}>
            <span className={`trim ${styles.linkText}`}>{l}</span>
          </a>
        ))}
      </div>
      <div className={styles.right}>
        <a href="#" className={styles.account}>
          <img src={`${BASE}assets/icon-account.svg`} alt="" className={styles.icon} />
          <span className={`trim ${styles.ui}`}>Account</span>
        </a>
        <a href="#" className={styles.cta}>
          <span className={`trim ${styles.ui}`}>Watch Demo</span>
        </a>
      </div>
    </nav>
  );
}
