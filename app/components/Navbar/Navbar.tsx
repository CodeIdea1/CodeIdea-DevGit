"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./Navbar.module.css";

const LINKS = ["Home", "Work", "About", "Contact"];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`${styles.nav} ${scrolled ? styles.navScrolled : ""}`}>
      <a href="#" className={styles.brand} aria-label="Home">
        <Image src="/lgog.png" alt="Logo" width={80} height={80} className={styles.logo} />
      </a>

      <nav className={styles.links} aria-label="Primary">
        {LINKS.map((link) => (
          <a key={link} href="#" className={styles.link}>
            {link}
          </a>
        ))}
      </nav>

      <a href="#" className={styles.cta}>
        Let&apos;s Talk
      </a>
    </header>
  );
}
