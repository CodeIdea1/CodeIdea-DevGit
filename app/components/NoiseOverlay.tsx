"use client";

import styles from "./NoiseOverlay.module.css";

/** طبقة الـ noise نفسها المستخدمة في HeroSection */
export default function NoiseOverlay() {
  return <div className={styles.overlay} aria-hidden="true" />;
}
