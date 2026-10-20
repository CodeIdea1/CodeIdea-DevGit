"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./Section4.module.css";

export default function Section4() {
  const sectionRef = useRef<HTMLElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const section = sectionRef.current;
      if (!section) return;

      gsap.fromTo(
        [scrimRef.current, contentRef.current],
        { opacity: 0 },
        {
          opacity: 1,
          ease: "none",
          scrollTrigger: { trigger: section, start: "top 85%", end: "top 35%", scrub: 1 },
        }
      );

      gsap.fromTo(
        contentRef.current,
        { y: 50 },
        {
          y: 0,
          ease: "power2.out",
          scrollTrigger: { trigger: section, start: "top 85%", end: "top 35%", scrub: 1 },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="section4" ref={sectionRef} className={styles.section} aria-labelledby="section4-title">
      <div ref={scrimRef} className={styles.scrim} />
      <div ref={contentRef} className={styles.content}>
        <h2 id="section4-title" className={styles.title}>
          READY WHEN YOU ARE
        </h2>
        <p className={styles.subtitle}>let&apos;s make it happen</p>
        <a href="#" className={styles.btn}>Start Now</a>
      </div>
    </section>
  );
}
