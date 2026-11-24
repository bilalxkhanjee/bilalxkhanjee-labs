import type { Ref } from "react";
import { Button } from "./Button";
import styles from "./Final.module.css";

const BASE = import.meta.env.BASE_URL;

export function Final({ ref }: { ref?: Ref<HTMLElement> }) {
  return (
    <section ref={ref} className={styles.final}>
      <h2 className={styles.title}>
        Type, only when <br />
        it matters.
      </h2>
      <p className={styles.closer}>Vibestrike for Mac. In Graphite and Ember.</p>
      <div className={styles.buttons}>
        <Button>Pre-order · $149</Button>
        <Button ghost>Compare models</Button>
      </div>

      {/* Zynter Soft branding and contacts */}
      <div className={styles.credits}>
        <div className={styles.contacts}>
          <a className={styles.zynter} href="https://www.linkedin.com/company/zyntersoft" target="_blank" rel="noopener">
            <img src={`${BASE}zynter-logo.png`} width={180} height={32} alt="Zynter Soft" />
          </a>
          <a href="mailto:zyntersoft@gmail.com">zyntersoft@gmail.com</a>
          <a href="https://www.linkedin.com/company/zyntersoft" target="_blank" rel="noopener">Zynter Soft on LinkedIn</a>
          <span className={styles.sep} aria-hidden="true" />
          <a href="mailto:bilalxkhanjee@gmail.com">bilalxkhanjee@gmail.com</a>
          <a href="https://www.linkedin.com/in/bilalxkhanjee" target="_blank" rel="noopener">Muhammad Bilal on LinkedIn</a>
        </div>
        <p className={styles.credit}>Inspired by a MotionSites design. Redesigned by Muhammad Bilal.</p>
      </div>

      <small className={styles.footnote}>© 2026 Vibestrike</small>
    </section>
  );
}
