"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./policy.module.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* ------------------------------------------------------------------ */
/*  Placeholder content  (غيّر النصوص دي براحتك)                       */
/* ------------------------------------------------------------------ */
const TITLE = ["Privacy", "policy"];

const SUMMARY = [
  {
    key: "Collect",
    title: "We only take what we need",
    text: "Your name, email and project details, so we can reply and build what you asked for. Nothing more.",
  },
  {
    key: "Use",
    title: "We use it to make your project better",
    text: "Your information is used to answer your requests, deliver your work and improve our studio. Never sold.",
  },
  {
    key: "Protect",
    title: "We keep it safe, and you stay in control",
    text: "Your data is stored securely, and you can ask us to see, fix or delete it at any time.",
  },
];

const SECTIONS = [
  {
    id: "collect",
    title: "Information we collect",
    paragraphs: [
      "When you contact us, send a request or apply for a role, we collect the details you choose to share: your name, email address, company, and anything you write in your message.",
      "We also collect basic technical information, such as device type and pages visited, to understand how the site is used.",
    ],
  },
  {
    id: "use",
    title: "How we use your information",
    paragraphs: [
      "We use your information to reply to you, scope and deliver projects, process job applications and keep the site running smoothly.",
      "We do not sell your personal data, and we do not use it to profile you.",
    ],
  },
  {
    id: "cookies",
    title: "Cookies and analytics",
    paragraphs: [
      "We use a small number of cookies to remember your preferences and measure traffic. You can block or delete cookies in your browser settings at any time.",
    ],
  },
  {
    id: "sharing",
    title: "Sharing with others",
    paragraphs: [
      "We only share data with trusted providers who help us run the studio, such as hosting and email services. They may use it only to perform those services for us.",
    ],
  },
  {
    id: "rights",
    title: "Your rights",
    paragraphs: [
      "You can ask to access, correct, export or delete the personal data we hold about you. Send us a request and we will respond within 30 days.",
    ],
  },
  {
    id: "contact",
    title: "Contact us",
    paragraphs: [
      "Questions about this policy? Write to privacy@yourdomain.com and a real person will get back to you.",
    ],
  },
];

const NOTES = [
  { label: "your data", cls: "n1" },
  { label: "your rights", cls: "n2" },
  { label: "your choices", cls: "n3" },
  { label: "your privacy", cls: "n4" },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function PolicyPage() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(SECTIONS[0].id);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const q = <T extends Element = HTMLElement>(sel: string) =>
      gsap.utils.toArray<T>(sel, el);

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      /* 1) Hero intro: title letters rise, notes draw themselves ---- */
      const intro = gsap.timeline({ defaults: { ease: "power4.out" } });
      intro
        .from(q("[data-char]"), {
          yPercent: 115,
          rotate: 6,
          opacity: 0,
          duration: 1.2,
          stagger: 0.04,
        })
        .from(q("[data-hero-sub]"), { y: 20, opacity: 0, duration: 0.9 }, "-=0.7")
        .from(
          q("[data-hero-panel]"),
          { scale: 0.88, y: 60, opacity: 0, duration: 1.4 },
          "-=1"
        )
        .from(
          q("[data-note]"),
          { opacity: 0, y: 10, duration: 0.6, stagger: 0.15 },
          "-=0.6"
        )
        .fromTo(
          q("[data-arrow]"),
          { strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration: 0.9, stagger: 0.15, ease: "power2.inOut" },
          "<"
        );

      // glass panel floats forever
      gsap.to(q("[data-hero-panel]"), {
        y: -14,
        rotate: 1.2,
        duration: 3.2,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });

      // clouds drift at different speeds while scrolling
      q("[data-cloud]").forEach((c) => {
        const speed = parseFloat(c.dataset.cloud || "1");
        gsap.to(c, {
          yPercent: -30 * speed,
          xPercent: 8 * speed,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
          },
        });
      });

      // hero content leaves softly
      gsap.to(q("[data-hero-inner]"), {
        opacity: 0,
        y: -80,
        scale: 0.96,
        ease: "none",
        scrollTrigger: {
          trigger: q("[data-hero]")[0],
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      /* 2) PIN SCROLL: one glass window, three chapters ------------- */
      const slides = q("[data-slide]");
      gsap.set(slides.slice(1), { autoAlpha: 0, yPercent: 10 });

      const pin = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        scrollTrigger: {
          trigger: q("[data-pin]")[0],
          start: "top top",
          end: "+=300%",
          scrub: 1,
          pin: true,
          anticipatePin: 1,
        },
      });

      pin
        .to(q("[data-bar]"), { scaleX: 1, ease: "none", duration: 3 }, 0)
        .to(q("[data-orb]"), { rotateY: 360, scale: 1.12, ease: "none", duration: 3 }, 0);

      [1, 2].forEach((i) => {
        const at = i; // 1 and 2 on the timeline
        pin
          .to(slides[i - 1], { autoAlpha: 0, yPercent: -10, duration: 0.5 }, at)
          .to(slides[i], { autoAlpha: 1, yPercent: 0, duration: 0.5 }, at + 0.15)
          .to(q("[data-counter]"), { yPercent: -(100 / 3) * i, duration: 0.5 }, at);
      });

      /* 3) Document: heading reveals with synchronized TOC progress ----- */
      const sections = q<HTMLElement>("[data-section]");
      const tocFill = q<HTMLElement>("[data-toc-fill]")[0];
      const tocOrb = q<HTMLElement>("[data-toc-orb]")[0];
      const lastSection = sections[sections.length - 1];

      sections.forEach((sec) => {
        gsap.from(sec.querySelector("[data-heading]"), {
          clipPath: "inset(0 100% 0 0)",
          y: 12,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: sec, start: "top 78%", once: true },
        });
      });

      if (sections.length && tocFill && tocOrb && lastSection) {
        const tocProgress = gsap.timeline({
          scrollTrigger: {
            trigger: q("[data-doc]")[0],
            start: "top 60%",
            endTrigger: lastSection,
            end: "top 45%",
            scrub: true,
            onUpdate: () => {
              const activationLine = window.innerHeight * 0.45;
              let currentId = sections[0].id;

              for (const section of sections) {
                if (section.getBoundingClientRect().top > activationLine) break;
                currentId = section.id;
              }

              setActive(currentId);
            },
            onLeaveBack: () => setActive(sections[0].id),
          },
        });

        tocProgress
          .fromTo(tocFill, { scaleY: 0 }, { scaleY: 1, ease: "none" }, 0)
          .fromTo(tocOrb, { top: "0%" }, { top: "100%", ease: "none" }, 0);
      }

      /* 4) CTA ------------------------------------------------------- */
      gsap.from(q("[data-cta]"), {
        scale: 0.9,
        y: 80,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: { trigger: q("[data-cta]")[0], start: "top 85%" },
      });
    });

    return () => mm.revert();
  }, []);

  const goTo = (id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY - 120,
      behavior: "smooth",
    });
  };

  return (
    <main
      ref={root}
      className={styles.page}
    >
      {/* ---------- sky + clouds (استبدلهم بصورة السما بتاعتك لو عايز) ---------- */}
      <div className={styles.sky} aria-hidden>
        <span className={`${styles.cloud} ${styles.c1}`} data-cloud="1.2" />
        <span className={`${styles.cloud} ${styles.c2}`} data-cloud="0.6" />
        <span className={`${styles.cloud} ${styles.c3}`} data-cloud="1.6" />
        <span className={`${styles.cloud} ${styles.c4}`} data-cloud="0.9" />
      </div>

      {/* ------------------------------ HERO ------------------------------ */}
      <section className={styles.hero} data-hero>
        <div className={styles.cloudTrack} aria-hidden="true">
          <Image src="/cloud-slide.webp" alt="" width={2171} height={724} className={styles.cloudSlide} />
          <Image src="/cloud-slide.webp" alt="" width={2171} height={724} className={styles.cloudSlide} />
          <Image src="/cloud-slide.webp" alt="" width={2171} height={724} className={styles.cloudSlide} />
          <Image src="/cloud-slide.webp" alt="" width={2171} height={724} className={styles.cloudSlide} />
        </div>
        <div className={styles.scene} aria-hidden="true">
          <Image src="/tree1.webp" alt="" width={1211} height={1299} className={`${styles.tree} ${styles.tree1}`} loading="eager" />
          <Image src="/tree2.webp" alt="" width={1422} height={1106} className={`${styles.tree} ${styles.tree2}`} loading="eager" />
          <Image src="/tree3.webp" alt="" width={1319} height={1193} className={`${styles.tree} ${styles.tree3}`} loading="eager" />
          <Image
            src="/rock-with-girl.png"
            alt=""
            width={1821}
            height={864}
            className={styles.rockImage}
            loading="eager"
          />
        </div>
        <div className={styles.heroInner} data-hero-inner>
          <h1 className={styles.title} aria-label={TITLE.join(" ")}>
            {TITLE.map((word) => (
              <span className={styles.word} key={word} aria-hidden>
                {word.split("").map((ch, i) => (
                  <span className={styles.charMask} key={i}>
                    <span className={styles.char} data-char>
                      {ch}
                    </span>
                  </span>
                ))}
              </span>
            ))}
          </h1>

          <p className={styles.heroSub} data-hero-sub>
            What we collect, why we collect it, and how you stay in control.
            <br />
            Last updated: 21 October 2026
          </p>

          <div className={styles.stage}>
            <div className={`${styles.glass} ${styles.panel}`} data-hero-panel>
              <span className={styles.shieldWrap}>
                <svg viewBox="0 0 48 56" className={styles.shield} aria-hidden>
                  <path
                    d="M24 3 5 10v16c0 13 8 22 19 27 11-5 19-14 19-27V10L24 3Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                  <path
                    d="m16 28 6 6 11-12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className={styles.panelCopy}>
                <span className={styles.panelLabel}>PRIVACY, BY DESIGN</span>
                <span className={styles.panelCaption}>Your data stays yours.</span>
              </span>
            </div>

            {NOTES.map((n) => (
              <div key={n.label} className={`${styles.note} ${styles[n.cls]}`} data-note>
                <span>{n.label}</span>
                <svg viewBox="0 0 80 60" aria-hidden>
                  <path
                    data-arrow
                    pathLength={1}
                    strokeDasharray={1}
                    d="M4 6C38 0 70 18 72 50M61 41l11 11 8-13"
                  />
                </svg>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------ PIN SCROLL SUMMARY ---------------------- */}
      <section className={styles.pin} data-pin>
        <div className={styles.pinStage}>
          <div className={styles.pinHead}>
            <p className={styles.pinLabel}>The short version</p>
            <div className={styles.counterWin} aria-hidden>
              <div className={styles.counter} data-counter>
                {SUMMARY.map((s) => (
                  <span key={s.key}>{s.key}</span>
                ))}
              </div>
            </div>
          </div>

          <div className={`${styles.glass} ${styles.window}`}>
            <div className={styles.winDots} aria-hidden>
              <i />
              <i />
              <i />
            </div>

            <div className={styles.orbWrap} aria-hidden>
              <div className={styles.orb} data-orb />
            </div>

            <div className={styles.slides}>
              {SUMMARY.map((s) => (
                <article className={styles.slide} data-slide key={s.key}>
                  <h2>{s.title}</h2>
                  <p>{s.text}</p>
                </article>
              ))}
            </div>

            <div className={styles.barTrack} aria-hidden>
              <span className={styles.bar} data-bar />
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------- DOCUMENT --------------------------- */}
      <section className={styles.doc} data-doc>
        <header className={styles.docHeader}>
          <p className={styles.docKicker}>The details</p>
          <h2 className={styles.docTitle}>Privacy policy</h2>
          <p className={styles.docIntro}>What we collect and how we use your information.</p>
        </header>

        <aside className={styles.toc}>
          <div className={styles.tocTrack} aria-hidden>
            <span className={styles.tocFill} data-toc-fill />
            <span className={styles.tocOrb} data-toc-orb />
          </div>
          <nav aria-label="Policy sections">
            {SECTIONS.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => goTo(s.id)}
                className={`${styles.tocItem} ${active === s.id ? styles.tocActive : ""}`}
                aria-current={active === s.id ? "true" : undefined}
              >
                <span className={styles.tocNum}>0{i + 1}</span>
                <span className={styles.tocTitle}>{s.title}</span>
              </button>
            ))}
          </nav>
        </aside>

        <div className={styles.content}>
          {SECTIONS.map((s) => (
            <section key={s.id} id={s.id} className={styles.section} data-section>
              <span className={styles.line} data-line />
              <h2 className={styles.heading} data-heading>
                {s.title}
              </h2>
              {s.paragraphs.map((p, i) => (
                <p key={i} className={styles.para} data-p>
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>
      </section>

      {/* ------------------------------- CTA ------------------------------ */}
      <section className={styles.ctaWrap}>
        <div className={`${styles.glass} ${styles.cta}`} data-cta>
          <h2>Want something explained in plain words?</h2>
          <p>Send us a message and we will walk you through it.</p>
          <div className={styles.actions}>
            <Link href="/request" className={styles.btnPrimary}>
              Send a request
            </Link>
            <Link href="/about" className={styles.btnGhost}>
              About the studio
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}