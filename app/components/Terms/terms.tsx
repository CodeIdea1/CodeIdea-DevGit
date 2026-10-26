"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./terms.module.css";

/* ═══════════════════════════════════════════
   المحتوى: كله مؤقت، غيّره براحتك
   ═══════════════════════════════════════════ */
const BRAND = "Cideidea";
const UPDATED = "October 26, 2026";
const VERSION = "1.0";

interface Clause {
  id: string;
  title: string;
  body: string[];
}

const CLAUSES: Clause[] = [
  {
    id: "acceptance",
    title: "Acceptance of terms",
    body: [
      `By accessing ${BRAND}'s website or ordering any of our services, you agree to these terms. If you do not agree with any part of them, please do not use our services.`,
      "These terms apply to every visitor, client and partner. Where a signed project agreement exists, it takes priority over anything written here.",
    ],
  },
  {
    id: "services",
    title: "Our services",
    body: [
      `${BRAND} designs and builds websites, digital experiences and related assets. The exact scope, deliverables and timeline of each project are described in the brief and quote we agree on together.`,
      "We may improve, change or retire parts of our offering from time to time. Work already agreed in writing will not be affected.",
    ],
  },
  {
    id: "responsibilities",
    title: "Your responsibilities",
    body: [
      "You agree to provide accurate information, timely feedback and the content or materials needed to complete the project. Delays on your side can move the delivery date.",
      "You confirm that you own, or have permission to use, everything you hand to us, including text, images, logos and brand assets.",
    ],
  },
  {
    id: "payments",
    title: "Payments and refunds",
    body: [
      "Projects are billed in stages as described in your quote. Work begins once the first payment is received, and final files are released once the last payment is settled.",
      "Refunds depend on the stage the project has reached. Work already delivered or in progress is not refundable, and any unused prepaid portion will be handled as described in your agreement.",
    ],
  },
  {
    id: "ownership",
    title: "Intellectual property",
    body: [
      "Once the final payment is made, you own the final deliverables created specifically for you. We keep ownership of our tools, code libraries, templates and methods.",
      `${BRAND} may showcase finished work in its portfolio unless you ask us in writing not to.`,
    ],
  },
  {
    id: "confidentiality",
    title: "Confidentiality",
    body: [
      "We treat your business information, unreleased products and private materials as confidential and use them only to deliver your project.",
      "This does not cover information that is already public, or that we are legally required to disclose.",
    ],
  },
  {
    id: "liability",
    title: "Limitation of liability",
    body: [
      `To the fullest extent permitted by law, ${BRAND} is not liable for indirect or consequential losses, such as lost profit or lost data, arising from the use of our services or websites.`,
      "Our total liability for any claim is limited to the amount you paid us for the specific project involved.",
    ],
  },
  {
    id: "changes",
    title: "Changes to these terms",
    body: [
      "We may update these terms from time to time. The date at the top of this page always shows the latest version, and continued use means you accept the changes.",
    ],
  },
];

/* ═══════════════════════════════════════════
   عناصر صغيرة
   ═══════════════════════════════════════════ */
function Cloud({ s, style, still, curtain }: {
  s: number; style?: CSSProperties; still?: boolean; curtain?: -1 | 1;
}) {
  return (
    <div
      data-cloud={still ? undefined : ""}
      data-curtain={curtain}
      className={styles.cloud}
      style={{ "--s": `${s}px`, ...style } as CSSProperties}
      aria-hidden="true"
    />
  );
}

function Word({ text }: { text: string }) {
  return (
    <span className={styles.word}>
      {text.split("").map((c, i) => (
        <span key={i} data-char className={styles.char}>{c}</span>
      ))}
    </span>
  );
}

function ArrowSvg({ dir }: { dir: "dr" | "dl" }) {
  const d = dir === "dr"
    ? "M4 6 C 30 0, 50 14, 52 34 M43 26 L52 37 L58 24"
    : "M58 6 C 32 0, 12 14, 10 34 M4 24 L10 37 L19 25";
  return (
    <svg viewBox="0 0 62 42" className={`${styles.arrow} ${dir === "dr" ? styles.arrowR : styles.arrowL}`} aria-hidden="true">
      <path data-arrow pathLength={1} d={d} />
    </svg>
  );
}

/* ═══════════════════════════════════════════
   الصفحة
   ═══════════════════════════════════════════ */
export default function TermsPage() {
  const rootRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const articlesRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(CLAUSES[0].id);

  const goTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    const ctx = gsap.context(() => {
      const root = rootRef.current;
      const hero = heroRef.current;
      const articlesWrap = articlesRef.current;
      if (!root || !hero || !articlesWrap) return;

      const q = <T extends Element = HTMLElement>(sel: string) =>
        Array.from(root.querySelectorAll<T>(sel));
      const one = <T extends Element = HTMLElement>(sel: string) =>
        root.querySelector<T>(sel);

      /* ── السحاب بيتحرك ببطء دايمًا ── */
      q("[data-cloud]").forEach((el) => {
        gsap.to(el, {
          x: gsap.utils.random(-34, 34),
          duration: gsap.utils.random(7, 13),
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      });

      /* ── دخول العنوان: حرف حرف ── */
      gsap.timeline({ delay: 0.2 })
        .fromTo(q("[data-char]"), { yPercent: 115, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 1, stagger: 0.035, ease: "power4.out" })
        .fromTo(q("[data-hero-fade]"), { y: 24, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out" }, "-=0.6");

      /* ── الهيرو: pin + scrub ── */
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const sheet = one("[data-sheet]");
        const stamp = one("[data-stamp]");
        const titleWrap = one("[data-title]");
        if (!sheet || !stamp || !titleWrap) return;

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: "+=140%",
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
          },
        });

        /* الورقة الزجاجية بتطلع من السحاب */
        tl.fromTo(sheet,
            { yPercent: 118, rotationX: 62, opacity: 0.2 },
            { yPercent: 6, rotationX: 5, opacity: 1, duration: 1.1, ease: "power2.out" }, 0)
          /* العنوان بيصغر ويطلع فوق */
          .to(titleWrap, { scale: 0.78, yPercent: -14, duration: 1.1, ease: "power2.inOut" }, 0)
          /* السحاب بيتفتح زي الستارة */
          .to(q("[data-curtain]"), {
            x: (_i, el: HTMLElement) => `${Number(el.dataset.curtain) * 46}vw`,
            duration: 1.3,
          }, 0)
          /* باراالاكس السحاب */
          .to(q("[data-par]"), {
            x: (_i, el: HTMLElement) => Number(el.dataset.par),
            duration: 1.5,
          }, 0)
          .fromTo(q("[data-note]"), { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.25, stagger: 0.12, ease: "power2.out" }, 0.75)
          .fromTo(q("[data-arrow]"), { strokeDashoffset: 1 },
            { strokeDashoffset: 0, duration: 0.3, stagger: 0.12 }, 0.85)
          /* الختم بينزل على الورقة */
          .fromTo(stamp, { scale: 2.4, rotation: -34, opacity: 0 },
            { scale: 1, rotation: -12, opacity: 1, duration: 0.3, ease: "back.out(2.2)" }, 1.1)
          .to({}, { duration: 0.15 });

        return () => { tl.scrollTrigger?.kill(); };
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(q("[data-note]"), { opacity: 1 });
        gsap.set(q("[data-arrow]"), { strokeDashoffset: 0 });
        gsap.set(one("[data-stamp]"), { opacity: 1, rotation: -12 });
      });

      /* ── القراءة: كل بند بيدخل لما توصله ── */
      const articleElements = q<HTMLElement>("[data-article]");
      articleElements.forEach((el) => {
        const rule = el.querySelector("[data-rule]");
        const fades = el.querySelectorAll("[data-fade]");
        const ghost = el.querySelector("[data-ghost]");

        gsap.from(el.querySelector("[data-term-heading]"), {
          clipPath: "inset(0 100% 0 0)",
          y: 12,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 78%", once: true },
        });

        gsap.timeline({ scrollTrigger: { trigger: el, start: "top 80%", once: true } })
          .fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: 1, ease: "power3.inOut" }, 0)
          .fromTo(fades, { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out" }, 0.25)
          .fromTo(ghost, { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 1, ease: "power3.out" }, 0);

        gsap.fromTo(ghost, { yPercent: 28 }, {
          yPercent: -28,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
        });
      });

      /* ── الفهرس: الخط بيتملي والكرة بتنزل مع تقدمك ── */
      const railFill = one<HTMLElement>("[data-rail-fill]");
      const orb = one<HTMLElement>("[data-orb]");
      const lastArticle = articleElements[articleElements.length - 1];
      if (articleElements.length && railFill && orb && lastArticle) {
        const progress = gsap.timeline({
          scrollTrigger: {
            trigger: articlesWrap,
            start: "top 60%",
            endTrigger: lastArticle,
            end: "top 60%",
            scrub: true,
            onUpdate: () => {
              const activationLine = window.innerHeight * 0.6;
              let currentId = articleElements[0].id;

              for (const article of articleElements) {
                if (article.getBoundingClientRect().top > activationLine) break;
                currentId = article.id;
              }

              setActive(currentId);
            },
            onLeaveBack: () => setActive(articleElements[0].id),
          },
        });

        progress
          .fromTo(railFill, { scaleY: 0 }, { scaleY: 1, ease: "none" }, 0)
          .fromTo(orb, { top: "0%" }, { top: "100%", ease: "none" }, 0);
      }

    }, rootRef);

    return () => {
      mm.revert();
      ctx.revert();
    };
  }, []);

  return (
    <main ref={rootRef} className={styles.page}>
      {/* ═══════════ الهيرو (pin) ═══════════ */}
      <header ref={heroRef} className={styles.hero}>
        <div className={styles.sky} aria-hidden="true">
          <div data-par="-80" className={styles.layer}>
            <Cloud s={9} style={{ left: "6%", top: "12%", opacity: 0.55 }} />
            <Cloud s={8} style={{ left: "52%", top: "8%", opacity: 0.5 }} />
            <Cloud s={10} style={{ right: "3%", top: "20%", opacity: 0.55 }} />
          </div>
          <div data-par="-200" className={styles.layer}>
            <Cloud s={14} style={{ left: "-4%", top: "50%", opacity: 0.85 }} />
            <Cloud s={12} style={{ right: "10%", top: "58%", opacity: 0.8 }} />
          </div>
        </div>

        <div className={styles.heroInner}>
          <p data-hero-fade className={styles.kicker}>Legal · 01</p>

          <div data-title className={styles.titleWrap}>
            <h1 className={styles.title} aria-label="Terms of Service">
              <span className={styles.mask} aria-hidden="true"><Word text="TERMS" /></span>
              <span className={styles.mask} aria-hidden="true">
                <Word text="OF" /> <Word text="SERVICE" />
              </span>
            </h1>
            <p data-hero-fade className={styles.subtitle}>the fine print, made clear</p>
            <ul data-hero-fade className={styles.meta}>
              <li>Updated {UPDATED}</li>
              <li>6 min read</li>
              <li>Version {VERSION}</li>
            </ul>
          </div>
        </div>

        {/* الورقة الزجاجية اللي بتطلع من السحاب */}
        <div className={styles.sheetStage}>
          <div data-sheet className={styles.sheet}>
            <div className={styles.bar}>
              <span className={styles.dotR} />
              <span className={styles.dotY} />
              <span className={styles.dotC} />
              <span className={styles.url}>{BRAND.toLowerCase()}.com/terms</span>
            </div>
            <div className={styles.sheetBody}>
              <span className={styles.sheetHead} />
              {[100, 92, 96, 70, 100, 88, 94, 54].map((w, i) => (
                <span key={i} className={styles.sheetLine} style={{ width: `${w}%` }} />
              ))}
              <div className={styles.sheetRow}>
                <span className={styles.sheetPill} />
                <span className={styles.sheetPill} />
              </div>
            </div>
            <div data-stamp className={styles.stamp} aria-hidden="true">
              <span className={styles.stampCheck}>✓</span>
              <span className={styles.stampText}>FAIR · CLEAR</span>
            </div>
          </div>

          <div data-note className={`${styles.note} ${styles.noteA}`} aria-hidden="true">
            <span className={styles.noteText}>plain language</span>
            <ArrowSvg dir="dr" />
          </div>
          <div data-note className={`${styles.note} ${styles.noteB}`} aria-hidden="true">
            <span className={styles.noteText}>no hidden tricks</span>
            <ArrowSvg dir="dl" />
          </div>
        </div>

        {/* ستارة السحاب اللي بتتفتح */}
        <div className={styles.curtains} aria-hidden="true">
          <Cloud s={34} curtain={-1} style={{ left: "-6%", bottom: "-130px" }} still />
          <Cloud s={34} curtain={1} style={{ right: "-6%", bottom: "-130px" }} still />
        </div>

        <div className={styles.heroFade} aria-hidden="true" />
        <p className={styles.scrollHint} aria-hidden="true">
          <span>Scroll</span>
          <i />
        </p>
      </header>

      {/* ═══════════ القراءة ═══════════ */}
      <section className={styles.reading} aria-label="Terms of service">
        <header className={styles.readingHeader}>
          <p className={styles.readingKicker}>The details</p>
          <h2 className={styles.readingTitle}>Terms of service</h2>
          <p className={styles.readingIntro}>
            Clear, straightforward terms for working together.
          </p>
        </header>

        <div className={styles.layout}>
          <aside className={styles.toc} aria-label="Contents">
            <p className={styles.tocKicker}>Contents</p>
            <div className={styles.tocBody}>
              <div className={styles.rail} aria-hidden="true">
                <span data-rail-fill className={styles.railFill} />
                <span data-orb className={styles.orb} />
              </div>
              <ol className={styles.tocList}>
                {CLAUSES.map((c, i) => (
                  <li key={c.id}>
                    <a
                      href={`#${c.id}`}
                      className={`${styles.tocItem} ${active === c.id ? styles.tocOn : ""}`}
                      aria-current={active === c.id ? "true" : undefined}
                      onClick={(e) => { e.preventDefault(); goTo(c.id); }}
                    >
                      <span className={styles.tocNum}>0{i + 1}</span>
                      <span className={styles.tocTitle}>{c.title}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </aside>

          <div ref={articlesRef} className={styles.articles}>
            {CLAUSES.map((c, i) => (
              <article key={c.id} id={c.id} data-article className={styles.article}>
                <span data-ghost className={styles.ghost} aria-hidden="true">0{i + 1}</span>
                <h2 className={styles.aTitle}>
                  <span className={styles.mask}>
                    <span data-term-heading className={styles.maskInner}>{c.title}</span>
                  </span>
                </h2>
                <i data-rule className={styles.rule} />
                <div className={styles.prose}>
                  {c.body.map((p, k) => (
                    <p key={k} data-fade>{p}</p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>

      </section>
    </main>
  );
}