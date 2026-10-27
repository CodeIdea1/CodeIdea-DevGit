"use client";

import { useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { Caveat, Michroma } from "next/font/google";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./page.module.css";

gsap.registerPlugin(ScrollTrigger);

const hand = Caveat({ subsets: ["latin"], weight: ["500"] });
const tech = Michroma({ subsets: ["latin"], weight: "400" });

const STEPS = [
  { label: "your idea", title: "It starts with one sentence", text: "Tell us what you want people to feel. We turn it into a clear direction before we draw anything." },
  { label: "layout", title: "Structure before style", text: "We lay out the page on glass first: sections, rhythm and hierarchy, so every choice has a reason." },
  { label: "your image", title: "Images that carry the story", text: "Photography, 3D and motion are chosen to match your brand, then placed where they matter." },
  { label: "clean code", title: "Built to be maintained", text: "Fast, accessible, readable code your team can extend long after launch." },
];

const HERO_LINES = ["Web designers", "who work", "above the noise"];

export default function WebDesignersPage() {
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        /* ---------- Hero intro: one orchestrated entrance ---------- */
        const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
        intro
          .from("[data-line]", { yPercent: 110, duration: 1.1, stagger: 0.12 })
          .from("[data-hero-sub]", { autoAlpha: 0, y: 16, duration: 0.8 }, "-=0.5")
          .from("[data-float]", { autoAlpha: 0, y: 60, scale: 0.9, duration: 1.2, stagger: 0.15 }, "-=1")
          .from("[data-hero-arrow]", { strokeDashoffset: 1, duration: 1, stagger: 0.2 }, "-=0.6")
          .from("[data-hero-note]", { autoAlpha: 0, duration: 0.6, stagger: 0.2 }, "<");

        /* ---------- Parallax: clouds and glass drift at different speeds ---------- */
        gsap.utils.toArray<HTMLElement>("[data-speed]").forEach((el) => {
          gsap.to(el, {
            yPercent: parseFloat(el.dataset.speed || "0") * 100,
            ease: "none",
            scrollTrigger: { trigger: `.${styles.hero}`, start: "top top", end: "bottom top", scrub: true },
          });
        });

        /* ---------- Signature: pinned scroll builds the page layer by layer ---------- */
        const texts = gsap.utils.toArray<HTMLElement>("[data-step-text]");
        const layers = gsap.utils.toArray<HTMLElement>("[data-layer]");
        const notes = gsap.utils.toArray<HTMLElement>("[data-note]");
        const arrows = gsap.utils.toArray<SVGPathElement>("[data-arrow]");

        gsap.set(texts, { autoAlpha: 0, y: 30 });
        gsap.set(notes, { autoAlpha: 0 });
        gsap.set(layers, { autoAlpha: 0, y: 40, scale: 0.94 });
        gsap.set(arrows, { strokeDashoffset: 1 });

        const tl = gsap.timeline({
          defaults: { ease: "power2.inOut" },
          scrollTrigger: {
            trigger: `.${styles.pin}`,
            start: "top top",
            end: () => `+=${STEPS.length * 90}%`,
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
            snap: { snapTo: "labels", duration: { min: 0.2, max: 0.5 }, ease: "power1.inOut" },
          },
        });

        STEPS.forEach((_, i) => {
          tl.addLabel(`s${i}`);
          if (i > 0) {
            tl.to(texts[i - 1], { autoAlpha: 0, y: -30, duration: 0.4 }, `s${i}`)
              .to(notes[i - 1], { autoAlpha: 0, duration: 0.3 }, `s${i}`);
          }
          tl.to(texts[i], { autoAlpha: 1, y: 0, duration: 0.5 }, `s${i}+=${i ? 0.2 : 0}`)
            .to(layers[i], { autoAlpha: 1, y: 0, scale: 1, duration: 0.6 }, `s${i}`)
            .to(notes[i], { autoAlpha: 1, duration: 0.3 }, `s${i}+=0.2`)
            .to(arrows[i], { strokeDashoffset: 0, duration: 0.5 }, `s${i}+=0.2`)
            .to(`.${styles.progress}`, { scaleX: (i + 1) / STEPS.length, duration: 0.6 }, `s${i}`)
            .to({}, { duration: 0.6 }); // dwell so each step can be read
        });
        tl.addLabel("end");

        /* ---------- CTA: glass panel rises into place ---------- */
        gsap.from(`.${styles.ctaPanel}`, {
          y: 80, autoAlpha: 0, duration: 1, ease: "power3.out",
          scrollTrigger: { trigger: `.${styles.cta}`, start: "top 75%" },
        });
      });

      /* Reduced motion: show everything statically */
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set("[data-layer], [data-note]", { autoAlpha: 1 });
        gsap.set("[data-arrow], [data-hero-arrow]", { strokeDashoffset: 0 });
        gsap.set("[data-step-text]:not(:last-child)", { autoAlpha: 0 });
        gsap.set("[data-step-text]:last-child", { autoAlpha: 1 });
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={root} className={styles.page}>
      {/* ================= HERO ================= */}
      <section className={styles.hero}>
        <div className={styles.cloudBack} data-speed="0.12" aria-hidden />
        <div className={`${styles.glass} ${styles.floatA}`} data-float data-speed="-0.1" aria-hidden />
        <div className={`${styles.glass} ${styles.floatB}`} data-float data-speed="-0.2" aria-hidden />

        <h1 className={styles.title}>
          {HERO_LINES.map((l) => (
            <span key={l} className={styles.lineMask}>
              <span data-line className={styles.line}>{l}</span>
            </span>
          ))}
        </h1>
        <p data-hero-sub className={styles.sub}>
          A small team of designers building premium websites for brands that want to be remembered.
        </p>

        <span data-hero-note className={`${styles.note} ${styles.noteHero1} ${hand.className}`}>your brand</span>
        <svg className={styles.arrowHero1} viewBox="0 0 70 60" aria-hidden>
          <path data-hero-arrow pathLength={1} d="M4 6 C40 0, 62 18, 60 52 M60 52 l-8 -9 M60 52 l8 -8" />
        </svg>

        <div className={styles.cloudFront} data-speed="-0.06" aria-hidden />
        <Link href="/request" className={`${styles.pill} ${tech.className}`}>Start a project</Link>
      </section>

      {/* ================= PINNED PROCESS ================= */}
      <section className={styles.pin}>
        <div className={styles.pinInner}>
          <div className={styles.copy}>
            {STEPS.map((s) => (
              <div key={s.title} data-step-text className={styles.step}>
                <h2>{s.title}</h2>
                <p>{s.text}</p>
              </div>
            ))}
            <div className={styles.track} aria-hidden>
              <div className={styles.progress} />
            </div>
          </div>

          <div className={styles.stage}>
            <div className={`${styles.glass} ${styles.window}`}>
              <div className={styles.dots} aria-hidden><i /><i /><i /></div>
              <div data-layer className={`${styles.layer} ${styles.lWire}`} />
              <div data-layer className={`${styles.layer} ${styles.lGrid}`}><b /><b /><b /></div>
              <div data-layer className={`${styles.layer} ${styles.lImage}`} />
              <div data-layer className={`${styles.layer} ${styles.lCode} ${tech.className}`}>
                <span>&lt;Hero /&gt;</span><span>&lt;Projects /&gt;</span><span>&lt;Contact /&gt;</span>
              </div>
            </div>

            {STEPS.map((s) => (
              <div key={s.label} data-note className={styles.noteWrap}>
                <span className={`${styles.note} ${hand.className}`}>{s.label}</span>
                <svg viewBox="0 0 70 60" aria-hidden>
                  <path data-arrow pathLength={1} d="M4 6 C40 0, 62 18, 60 52 M60 52 l-8 -9 M60 52 l8 -8" />
                </svg>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className={styles.cta}>
        <div className={`${styles.glass} ${styles.ctaPanel}`}>
          <h2>Ready when you are.</h2>
          <p>Send us the idea. We will reply within two working days.</p>
          <Link href="/request" className={`${styles.pillDark} ${tech.className}`}>Request a project</Link>
        </div>
      </section>
    </div>
  );
}