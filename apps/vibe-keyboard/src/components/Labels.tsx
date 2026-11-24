import type { Ref } from "react";
import styles from "./Labels.module.css";

const LAYERS: [string, string, string][] = [
  ["caps", "Keycaps", "Double-shot PBT · four ember vibe keys"],
  ["switch", "Mechanical switches", "Low-profile linear · hot-swap"],
  ["plate", "Plate", "Aluminium · holds every switch"],
  ["foam", "Dampening foam", "Latex and IXPE · a deeper, quieter sound"],
  ["pcb", "Logic board", "Hot-swap · per-key light · agent bridge"],
  ["battery", "Battery", "2,980 mAh · three months a charge"],
  ["base", "Unibody case", "CNC-machined recycled aluminium"],
];

const PARTS: [string, string, string][] = [
  ["cap", "Accept key", "Ember PBT · etched ✓"],
  ["switch", "Linear switch", "Pre-lubed · 3.2 mm travel"],
  ["spring", "Spring", "A lighter 45 g press"],
  ["pad", "Key light", "Glows when a diff is waiting"],
];

// Callouts the 3D loop pins to the model (src/lib/labels.ts positions them).
export function Labels({ ref }: { ref?: Ref<HTMLDivElement> }) {
  return (
    <div ref={ref} className={styles.labels}>
      {LAYERS.map(([id, title, note]) => (
        <div key={id} className={`${styles.label} ${styles.left}`} data-layer={id}>
          <div className={styles.box}>
            <b>{title}</b>
            <span>{note}</span>
          </div>
        </div>
      ))}
      {PARTS.map(([id, title, note]) => (
        <div key={id} className={`${styles.label} ${styles.right}`} data-part={id}>
          <div className={styles.box}>
            <b>{title}</b>
            <span>{note}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
