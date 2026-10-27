"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./Navbar.module.css";

const LINKS = [
  { label: "Home", href: "/" },
  { label: "Work", href: "#" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "#" },
  { label: "Our Designers", href: "/WebDesigners" },
  { label: "Terms", href: "/terms" },
  { label: "Privacy Policy", href: "/policy" },
];

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
      <Link href="/" className={styles.brand} aria-label="Home">
        <Image src="/lgog.png" alt="Logo" width={80} height={80} className={styles.logo} />
      </Link>

      <nav className={styles.links} aria-label="Primary">
        {LINKS.map(({ label, href }) => (
          <Link key={label} href={href} className={styles.link}>
            {label}
          </Link>
        ))}
      </nav>

      <a href="#" className={styles.cta}>
        Let&apos;s Talk
      </a>
    </header>
  );
}
