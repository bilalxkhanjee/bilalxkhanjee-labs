import { Words } from "./Words";
import styles from "./HeroCopy.module.css";

export function HeroCopy() {
  return (
    <div className={styles.hero} data-hero>
      <div className={styles.column}>
        <div className={styles.badge} data-intro="badge">
          <span className={styles.square} />
          <span className={`trim ${styles.small}`}>World Banking system awards winner</span>
        </div>
        <h1 className={`trim ${styles.headline}`} aria-label="Enter New Places Without Starting Over" data-intro="headline">
          <span className={styles.line} aria-hidden="true">
            <Words text="Enter New Places" className={styles.word} />
          </span>
          <span className={styles.line} aria-hidden="true">
            <Words text="Without Starting Over" className={styles.word} />
          </span>
        </h1>
      </div>

      <div className={styles.buttons} data-intro="buttons">
        <a href="#" className={`${styles.button} ${styles.light}`}>
          <span className={`trim ${styles.small} ${styles.buttonText}`}>See Benefits</span>
        </a>
        <a href="#" className={`${styles.button} ${styles.outline}`}>
          <span className={`trim ${styles.strong} ${styles.buttonText}`}>Watch Demo</span>
        </a>
      </div>

      <p className={`trim ${styles.lead}`} data-intro="lead">
        Halvia is a relocation card designed for people starting life abroad. Open remotely, spend instantly, exchange currencies
        fairly, and arrive already connected.
      </p>
    </div>
  );
}
