import type { MouseEvent, Ref } from "react";
import type { SectionName } from "../lib/ui";
import { Button } from "./Button";
import styles from "./Nav.module.css";

// listed as designed ("Inside" comes first on the timeline)
const LINKS: [SectionName, string][] = [
  ["overview", "Overview"],
  ["vibe-row", "The vibe row"],
  ["inside", "Inside"],
  ["specs", "Specs"],
];

export function Nav({ ref, active, onGo }: { ref?: Ref<HTMLElement>; active: SectionName | null; onGo: (name: SectionName) => void }) {
  const go = (name: SectionName) => (e: MouseEvent) => {
    e.preventDefault();
    onGo(name);
  };
  return (
    <nav ref={ref} className={styles.nav}>
      <a href="#overview" className={styles.logo} onClick={go("overview")}>
        <span className={styles.vibe}>vibe</span>strike
      </a>
      <div className={styles.links}>
        {LINKS.map(([name, label]) => (
          <a
            key={name}
            href={`#${name}`}
            className={`${styles.link} ${active === name ? styles.active : ""}`}
            aria-current={active === name ? "true" : undefined}
            onClick={go(name)}
          >
            {label}
          </a>
        ))}
      </div>
      <Button small>Pre-order</Button>
    </nav>
  );
}
