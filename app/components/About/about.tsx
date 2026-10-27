"use client";

import { useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { Caveat, Cormorant_Garamond, Michroma } from "next/font/google";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./about.module.css";

gsap.registerPlugin(ScrollTrigger);

const hand = Caveat({ subsets: ["latin"], weight: ["500"] });
const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500"] });
const tech = Michroma({ subsets: ["latin"], weight: "400" });

const SECTIONS = [
  { index: "Our Vision", title: "Premium web, made lighter", text: "We believe a website should feel calm to enter and impossible to forget. Everything we make starts from that feeling." },
  { index: "Our Process", title: "Slow thinking, fast building", text: "A short discovery, a clear direction, then focused design and development sprints with you in the room." },
  { index: "Why Us", title: "Small team, full attention", text: "You work directly with the people designing and building your site. No hand-offs, no layers." },
  { index: "Our Team", title: "Designers and engineers", text: "A tight group of designers, motion specialists and developers who like the details nobody asks about." },
];

export default function AboutPage() {
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const texts = gsap.utils.toArray<HTMLElement>("[data-text]");
        const items = gsap.utils.toArray<HTMLElement>("[data-item]");

        /* Initial state */
        gsap.set(texts, { autoAlpha: 0, y: 30 });
        gsap.set(texts[0], { autoAlpha: 1, y: 0 });
        gsap.set(items, { opacity: 0.35, x: 0 });
        gsap.set(items[0], { opacity: 1, x: -14 });
        gsap.set("[data-tree]", { scale: 0, transformOrigin: "50% 100%" });
        gsap.set("[data-light]", { autoAlpha: 0, scale: 0, transformOrigin: "50% 50%" });
        gsap.set("[data-island]", { yPercent: 28, scale: 0.72 });

        /* Entrance: the island floats up out of the clouds */
        gsap.from(`.${styles.heading} span`, { yPercent: 110, duration: 1.1, stagger: 0.12, ease: "power3.out" });
        gsap.from("[data-island]", { autoAlpha: 0, yPercent: 60, duration: 1.6, ease: "power3.out" });

        /* Signature: pinned camera rise, clouds part, island comes alive */
        const tl = gsap.timeline({
          defaults: { ease: "power2.inOut" },
          scrollTrigger: {
            trigger: `.${styles.pin}`,
            start: "top top",
            end: () => `+=${SECTIONS.length * 90}%`,
            pin: true,
            scrub: 0.9,
            anticipatePin: 1,
            snap: { snapTo: "labels", duration: { min: 0.2, max: 0.5 } },
          },
        });

        /* Continuous motion across the whole timeline */
        tl.to("[data-island]", { yPercent: -4, scale: 1.12, rotate: -2, duration: SECTIONS.length * 1.2 }, 0)
          .to("[data-cloud-l]", { xPercent: -35, duration: SECTIONS.length * 1.2 }, 0)
          .to("[data-cloud-r]", { xPercent: 35, duration: SECTIONS.length * 1.2 }, 0)
          .to("[data-cloud-front]", { yPercent: 30, duration: SECTIONS.length * 1.2 }, 0);

        SECTIONS.forEach((_, i) => {
          const at = i * 1.2;
          tl.addLabel(`s${i}`, at);
          if (i > 0) {
            tl.to(texts[i - 1], { autoAlpha: 0, y: -30, duration: 0.35 }, at)
              .to(items[i - 1], { opacity: 0.35, x: 0, duration: 0.35 }, at)
              .to(texts[i], { autoAlpha: 1, y: 0, duration: 0.45 }, at + 0.25)
              .to(items[i], { opacity: 1, x: -14, duration: 0.35 }, at);
          }
        });

        /* Island reacts to each chapter */
        tl.to("[data-tree]", { scale: 1, duration: 0.6, stagger: 0.08, ease: "back.out(1.6)" }, 1.2)
          .to("[data-pane]", { xPercent: 70, duration: 0.8 }, 2.4)
          .to("[data-light]", { autoAlpha: 1, scale: 1, duration: 0.4, stagger: 0.12 }, 3.6)
          .to(`.${styles.line}`, { scaleY: 1, duration: SECTIONS.length * 1.2, ease: "none" }, 0);

        /* Closing statement: words light up while scrolling */
        gsap.from("[data-word]", {
          opacity: 0.18,
          stagger: 0.1,
          ease: "none",
          scrollTrigger: { trigger: `.${styles.statement}`, start: "top 70%", end: "bottom 55%", scrub: true },
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set("[data-text]:not(:first-child)", { autoAlpha: 0 });
      });
    }, root);

    return () => ctx.revert();
  }, []);

  const statement = "We build calm, confident websites for ambitious brands, one careful detail at a time.".split(" ");

  return (
    <div ref={root} className={`${styles.page} ${serif.className}`}>
      <section className={styles.pin}>
        <div className={styles.cloudSide} data-cloud-l style={{ left: "-12%" }} aria-hidden />
        <div className={styles.cloudSide} data-cloud-r style={{ right: "-12%" }} aria-hidden />

        <h1 className={styles.heading}>
          <span>About</span>
          <span>us</span>
        </h1>

        <div className={styles.copy}>
          {SECTIONS.map((s) => (
            <div key={s.title} data-text className={styles.block}>
              <h2 className={styles.blockTitle}>{s.title}</h2>
              <p>{s.text}</p>
            </div>
          ))}
          <Link href="/request" className={`${styles.story} ${hand.className}`}>Our story</Link>
        </div>

        {/* Floating island (replace with your 3D render when ready) */}
        <div className={styles.island} data-island aria-hidden>
          <svg viewBox="0 0 600 560">
            <defs>
              <linearGradient id="stone" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#f2efe9" />
                <stop offset="1" stopColor="#c9c4ba" />
              </linearGradient>
              <linearGradient id="glassFill" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#ffffff" stopOpacity="0.75" />
                <stop offset="1" stopColor="#cfe0ea" stopOpacity="0.35" />
              </linearGradient>
            </defs>
            <path d="M40 350 L560 350 L520 392 Q430 430 370 480 L330 545 L270 545 L230 480 Q160 430 80 392 Z" fill="url(#stone)" />
            <path d="M40 350 L560 350 L548 364 L52 364 Z" fill="#fff" opacity="0.8" />
            <rect x="380" y="240" width="60" height="110" fill="#ece8e0" />
            <rect x="170" y="215" width="200" height="135" fill="#d9d4ca" />
            <rect x="160" y="205" width="230" height="14" fill="#fff" />
            <circle data-light cx="230" cy="320" r="7" fill="#ffd98a" />
            <circle data-light cx="270" cy="322" r="7" fill="#ffd98a" />
            <circle data-light cx="310" cy="320" r="7" fill="#ffd98a" />
            <rect data-pane x="250" y="219" width="120" height="131" fill="url(#glassFill)" stroke="#fff" strokeWidth="1.5" />
            <g fill="#4f6b3f">
              <circle data-tree cx="415" cy="205" r="42" />
              <circle data-tree cx="110" cy="318" r="22" fill="#6b8456" />
              <circle data-tree cx="500" cy="322" r="20" fill="#6b8456" />
              <circle data-tree cx="205" cy="190" r="14" fill="#6b8456" />
            </g>
          </svg>
        </div>

        <ol className={`${styles.index} ${tech.className}`}>
          {SECTIONS.map((s, i) => (
            <li key={s.index} data-item>
              <span>{String(i + 1).padStart(2, "0")}</span>{s.index}
            </li>
          ))}
        </ol>
        <div className={styles.line} aria-hidden />

        <div className={styles.cloudFront} data-cloud-front aria-hidden />
      </section>

      <section className={styles.statement}>
        <p>
          {statement.map((w, i) => (
            <span key={i} data-word>{w} </span>
          ))}
        </p>
        <Link href="/careers" className={`${styles.pill} ${tech.className}`}>Join the team</Link>
      </section>
    </div>
  );
}