import type { ReactNode } from "react";
import styles from "./Button.module.css";

// A pill link: solid ink by default, `small` for the nav, `ghost` for the secondary CTA.
export function Button({ href = "#", small, ghost, children }: { href?: string; small?: boolean; ghost?: boolean; children: ReactNode }) {
  const cls = [styles.button, small ? styles.small : "", ghost ? styles.ghost : ""].filter(Boolean).join(" ");
  return (
    <a href={href} className={cls}>
      {children}
    </a>
  );
}
