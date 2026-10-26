"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./Section5.module.css";

/* ═══════════════════════════════════════════
   البيانات: غيّر النصوص والألوان براحتك
   ═══════════════════════════════════════════ */
type CatId = "interior" | "estate" | "watch";

interface Category {
  id: CatId;
  name: string;
  accent: string;
  tagline: string;
  cta: string;
  placeholder: string;
  styles: { label: string; tint: string }[];
  features: string[];
}

const CATEGORIES: Category[] = [
  {
    id: "interior",
    name: "Interior",
    accent: "#e08e5c",
    tagline: "Rooms that feel lived in",
    cta: "Book a consultation",
    placeholder: "e.g. Nordic Nest Studio",
    styles: [
      { label: "Minimal", tint: "#e9e4da" },
      { label: "Warm classic", tint: "#d9a273" },
      { label: "Modern dark", tint: "#7f93a1" },
    ],
    features: ["3D room viewer", "Product configurator", "Lookbook gallery", "Online store", "Book a consultation", "AR preview"],
  },
  {
    id: "estate",
    name: "Real Estate",
    accent: "#2fb5aa",
    tagline: "Find a place to belong",
    cta: "Book a viewing",
    placeholder: "e.g. Skyline Properties",
    styles: [
      { label: "Luxury", tint: "#d8c08a" },
      { label: "Modern", tint: "#7aa2c7" },
      { label: "Urban", tint: "#9aa5b5" },
    ],
    features: ["Listings and filters", "Virtual tours", "Interactive map", "Agent profiles", "Mortgage calculator", "Lead capture"],
  },
  {
    id: "watch",
    name: "Watches",
    accent: "#c9a227",
    tagline: "Time, perfectly kept",
    cta: "Shop the collection",
    placeholder: "e.g. Meridian Watches",
    styles: [
      { label: "Gold", tint: "#e2c565" },
      { label: "Steel", tint: "#aab4bd" },
      { label: "Midnight", tint: "#5d7bc0" },
    ],
    features: ["360° product viewer", "Collection pages", "Limited drop countdown", "Online store", "Strap configurator", "Brand story timeline"],
  },
];

const STEPS = [
  { label: "Brand", title: "Tell us who you are", hint: "Pick your world and name your brand. The window starts taking shape." },
  { label: "Features", title: "What should it do?", hint: "Choose everything you want. Each pick lands on your page." },
  { label: "Scope", title: "Budget and timeline", hint: "Rough numbers are fine. They help us plan the right build." },
  { label: "Contact", title: "Where do we reach you?", hint: "We reply within 24 hours with a plan and a quote." },
];

const CAPTIONS = ["Shaping your hero", "Placing your features", "Mapping the launch", "Ready for takeoff"];

/* الكلام اللي بيتكتب بخط اليد حوالين النافذة (زي الهيرو) */
type Arrow = "dr" | "dl";
interface Note { text: string; x: string; y: string; arrow: Arrow }
const NOTES: Note[][] = [
  [
    { text: "your idea", x: "2%", y: "0%", arrow: "dr" },
    { text: "your logo", x: "56%", y: "-1%", arrow: "dl" },
  ],
  [
    { text: "layout", x: "2%", y: "0%", arrow: "dr" },
    { text: "your features", x: "52%", y: "-1%", arrow: "dl" },
  ],
  [
    { text: "your plan", x: "2%", y: "0%", arrow: "dr" },
    { text: "your timeline", x: "52%", y: "-1%", arrow: "dl" },
  ],
  [
    { text: "almost there", x: "2%", y: "0%", arrow: "dr" },
    { text: "ready to fly", x: "56%", y: "-1%", arrow: "dl" },
  ],
];
const NOTES_DONE: Note[] = [
  { text: "it's live!", x: "4%", y: "0%", arrow: "dr" },
  { text: "see you soon", x: "54%", y: "-1%", arrow: "dl" },
];

const BUDGETS = ["$1k – 3k", "$3k – 7k", "$7k – 15k", "$15k+"];
const TIMELINES = ["2 – 4 weeks", "1 – 2 months", "Flexible"];

/* لو عندك API route حط الرابط هنا (مثال: "/api/brief") وهيتبعت JSON بـ POST.
   لو فاضي، الفورم بيحاكي الإرسال فقط. */
const ENDPOINT = "";

interface FormState {
  brand: string;
  kind: "new" | "redesign";
  styleIdx: number;
  features: string[];
  budget: string;
  timeline: string;
  name: string;
  email: string;
  notes: string;
}

const EMPTY: FormState = {
  brand: "", kind: "new", styleIdx: 0, features: [],
  budget: "", timeline: "", name: "", email: "", notes: "",
};

const emailOk = (e: string) => /^\S+@\S+\.\S+$/.test(e.trim());

const canGo = (step: number, f: FormState) => {
  if (step === 1) return f.brand.trim().length > 1;
  if (step === 2) return f.features.length > 0;
  if (step === 3) return !!f.budget && !!f.timeline;
  return f.name.trim().length > 1 && emailOk(f.email);
};

/* ═══════════════════════════════════════════
   عناصر صغيرة
   ═══════════════════════════════════════════ */
function Cloud({ s, style, depth, still, wipe }: {
  s: number; style?: CSSProperties; depth?: number; still?: boolean; wipe?: boolean;
}) {
  return (
    <div
      data-cloud={still ? undefined : ""}
      data-z={depth}
      data-wipe={wipe ? "" : undefined}
      className={`${styles.cloud} ${wipe ? styles.wipe : ""}`}
      style={{ "--s": `${s}px`, ...style } as CSSProperties}
      aria-hidden="true"
    />
  );
}

function Art({ id }: { id: CatId }) {
  if (id === "interior") {
    return (
      <svg viewBox="0 0 120 100" className={styles.artSvg} aria-hidden="true">
        <rect className={styles.artFill} x="30" y="10" width="34" height="24" rx="2" />
        <rect className={styles.artLine} x="30" y="10" width="34" height="24" rx="2" />
        <path className={styles.artLine} d="M36 28 l8 -9 l6 6 l5 -5 l6 8" />
        <path className={styles.artFill} d="M14 56 h72 a6 6 0 0 1 6 6 v16 h-84 v-16 a6 6 0 0 1 6 -6z" />
        <path className={styles.artLine} d="M14 56 h72 a6 6 0 0 1 6 6 v16 h-84 v-16 a6 6 0 0 1 6 -6z M8 66 h8 v12 h-8 z M84 66 h8 v12 h-8 z" />
        <path className={styles.artLine} d="M104 80 V34 M97 34 l4 -12 h8 l4 12z" />
        <path className={styles.artLine} d="M4 84 H116" />
      </svg>
    );
  }
  if (id === "estate") {
    return (
      <svg viewBox="0 0 120 100" className={styles.artSvg} aria-hidden="true">
        <path className={styles.artFill} d="M18 90 V38 h26 v52z M48 90 V14 h28 v76z M80 90 V46 h24 v44z" />
        <path className={styles.artLine} d="M18 90 V38 h26 v52 M48 90 V14 h28 v76 M80 90 V46 h24 v44 M6 90 H116" />
        {[[54, 22], [64, 22], [54, 36], [64, 36], [54, 50], [64, 50], [24, 48], [34, 48], [86, 56], [94, 56]].map(([x, y], i) => (
          <rect key={i} x={x} y={y} width="5" height="6" rx="1" className={styles.artWin} />
        ))}
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 120 100" className={styles.artSvg} aria-hidden="true">
      <path className={styles.artFill} d="M52 4 h16 l-2 22 h-12z M52 96 h16 l-2 -22 h-12z" />
      <path className={styles.artLine} d="M52 4 h16 l-2 22 M54 26 L52 4 M52 96 h16 l-2 -22 M54 74 L52 96" />
      <circle className={styles.artFill} cx="60" cy="50" r="28" />
      <circle className={styles.artLine} cx="60" cy="50" r="28" />
      <circle className={styles.artLine} cx="60" cy="50" r="22" />
      <path className={styles.artLine} d="M60 28 v5 M60 67 v5 M38 50 h5 M77 50 h5" />
      <path className={styles.artHand} d="M60 50 V34 M60 50 L71 56" />
      <circle className={styles.artDot} cx="60" cy="50" r="2.4" />
    </svg>
  );
}

function Plant({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  const leaf = "M0 0 C 5 -12, 15 -20, 26 -22 C 21 -11, 11 -3, 0 0z";
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {[-70, -35, 0, 35, 70].map((r, i) => (
        <path key={r} d={leaf} transform={`rotate(${r - 45})`} fill={i % 2 ? "#6f9150" : "#4d6e3c"} />
      ))}
    </g>
  );
}

function Rock() {
  return (
    <svg viewBox="0 0 300 170" className={styles.rockSvg} aria-hidden="true">
      <defs>
        <linearGradient id="rk5" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#ecebe6" />
          <stop offset="1" stopColor="#b3b0a8" />
        </linearGradient>
      </defs>
      <ellipse cx="150" cy="160" rx="130" ry="8" fill="rgba(60,90,120,.22)" />
      <path d="M8 80 L48 36 L118 20 L192 26 L252 44 L294 82 L272 120 L222 150 L150 162 L88 148 L38 118 z" fill="url(#rk5)" />
      <path d="M48 36 L92 78 L118 20 M192 26 L176 84 L252 44 M92 78 L150 100 L176 84 M38 118 L92 78 M150 100 L150 162 M222 150 L176 84" fill="none" stroke="rgba(90,86,78,.28)" strokeWidth="1.6" strokeLinejoin="round" />
      {[[70, 60], [120, 50], [170, 62], [225, 70], [100, 118], [190, 126], [140, 84], [250, 100], [60, 96]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 2 ? 1.6 : 2.4} fill="rgba(90,86,78,.35)" />
      ))}
      <Plant x={60} y={42} s={1.2} />
      <Plant x={236} y={52} s={1.4} />
      <Plant x={270} y={96} s={0.9} />
    </svg>
  );
}

function ArrowSvg({ dir }: { dir: Arrow }) {
  const d = dir === "dr"
    ? "M4 6 C 30 0, 50 14, 52 34 M43 26 L52 37 L58 24"
    : "M58 6 C 32 0, 12 14, 10 34 M4 24 L10 37 L19 25";
  return (
    <svg viewBox="0 0 62 42" className={`${styles.arrow} ${dir === "dr" ? styles.arrowR : styles.arrowL}`} aria-hidden="true">
      <path data-arrow pathLength={1} d={d} />
    </svg>
  );
}

/* كل ميزة بتتحط في النافذة بتنزل من فوق وترتد */
function Tile({ label }: { label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const t = gsap.fromTo(
      el,
      { y: -70, opacity: 0, scale: 0.5, rotate: gsap.utils.random(-14, 14) },
      { y: 0, opacity: 1, scale: 1, rotate: 0, duration: 0.9, ease: "back.out(1.8)" }
    );
    return () => { t.kill(); };
  }, []);
  return (
    <div ref={ref} className={styles.tile}>
      <span className={styles.tileDot} />
      <span>{label}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════
   المكوّن الرئيسي
   ═══════════════════════════════════════════ */
export default function Section5() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const camRef = useRef<HTMLDivElement>(null);
  const warmRef = useRef<HTMLDivElement>(null);
  const sunRef = useRef<HTMLDivElement>(null);
  const winRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLSpanElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const sparksRef = useRef<HTMLDivElement>(null);
  const notesRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  const dirRef = useRef(1);
  const stepRef = useRef(1);
  const deskRef = useRef(false);
  const stRef = useRef<ScrollTrigger | null>(null);

  const [catId, setCatId] = useState<CatId>("interior");
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [entered, setEntered] = useState(false);

  const cat = CATEGORIES.find((c) => c.id === catId) ?? CATEGORIES[0];
  const tint = cat.styles[form.styleIdx].tint;
  const done = status === "done";
  const lvl = done ? 4 : step;
  const bodyKey = done ? "done" : String(step);
  const valid = canGo(step, form);

  useEffect(() => { stepRef.current = step; }, [step]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const toggleFeature = (name: string) =>
    setForm((f) => ({
      ...f,
      features: f.features.includes(name) ? f.features.filter((x) => x !== name) : [...f.features, name],
    }));

  const pickCat = (id: CatId) => {
    if (id === catId) return;
    setCatId(id);
    setForm((f) => ({ ...f, styleIdx: 0, features: [] }));
  };

  /* ديسكتوب: الأزرار بتحرك السكرول، والسكرول هو اللي بيغير الخطوة.
     موبايل: الأزرار بتغير الخطوة على طول */
  const goTo = (target: number) => {
    const t = Math.min(4, Math.max(1, target));
    const st = stRef.current;
    if (deskRef.current && st) {
      const y = st.start + (st.end - st.start) * ((t - 1) / 3);
      window.scrollTo({ top: y, behavior: "smooth" });
    } else {
      dirRef.current = t > stepRef.current ? 1 : -1;
      setStep(t);
    }
  };

  const go = (d: number) => goTo(step + d);

  const restart = () => {
    setStatus("idle");
    setForm(EMPTY);
    setCatId("interior");
    goTo(1);
  };

  const submit = async () => {
    if (!canGo(4, form) || status === "sending") return;
    setStatus("sending");
    const payload = { category: cat.id, ...form, style: cat.styles[form.styleIdx].label };
    try {
      if (ENDPOINT) {
        const res = await fetch(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Request failed");
      } else {
        await new Promise((r) => setTimeout(r, 900));
      }
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  const next = () => {
    if (!valid) return;
    if (step < 4) go(1);
    else submit();
  };

  /* ══════════ السكرول: المشهد كله بيتحرك مع السكرول ══════════ */
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mm = gsap.matchMedia();

    const ctx = gsap.context(() => {
      const s = sectionRef.current;
      const stage = stageRef.current;
      if (!s || !stage) return;

      /* العمق: كل عنصر بياخد مسافة z (data-z) */
      s.querySelectorAll<HTMLElement>("[data-z]").forEach((el) => {
        gsap.set(el, { z: Number(el.dataset.z) });
      });

      if (!reduce) {
        s.querySelectorAll<HTMLElement>("[data-float]").forEach((el) => {
          gsap.to(el, {
            y: gsap.utils.random(8, 16) * (Math.random() < 0.5 ? -1 : 1),
            rotation: gsap.utils.random(-1.4, 1.4),
            duration: gsap.utils.random(2.6, 4.2),
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          });
        });
        s.querySelectorAll<HTMLElement>("[data-cloud]").forEach((el) => {
          gsap.to(el, {
            x: gsap.utils.random(-36, 36),
            duration: gsap.utils.random(7, 13),
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          });
        });
      }

      /* العنوان */
      gsap.fromTo(
        s.querySelectorAll("[data-intro='line']"),
        { yPercent: 110 },
        { yPercent: 0, duration: 0.9, stagger: 0.12, ease: "power3.out",
          scrollTrigger: { trigger: s, start: "top 75%", once: true } }
      );
      gsap.fromTo(
        s.querySelectorAll("[data-intro='fade']"),
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.3,
          scrollTrigger: { trigger: s, start: "top 75%", once: true } }
      );

      /* دخول المشهد والنص قبل ما يتثبت */
      gsap.fromTo(
        tiltRef.current,
        { y: 80, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.3, ease: "power3.out",
          scrollTrigger: { trigger: stage, start: "top 85%", once: true, onEnter: () => setEntered(true) } }
      );
      gsap.fromTo(
        s.querySelectorAll("[data-copy]"),
        { x: -50, opacity: 0 },
        { x: 0, opacity: 1, duration: 1, delay: 0.25, ease: "power3.out",
          scrollTrigger: { trigger: stage, start: "top 85%", once: true } }
      );

      /* ── ديسكتوب: pin + scrub ── */
      mm.add("(min-width: 901px) and (prefers-reduced-motion: no-preference)", () => {
        deskRef.current = true;
        const cam = camRef.current;
        const warm = warmRef.current;
        const sun = sunRef.current;
        if (!cam || !warm || !sun) return;

        gsap.set(cam, { yPercent: -50, scale: 0.86, rotationY: -24, rotationX: 8 });

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: stage,
            start: "top top",
            end: "+=300%",
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
            snap: { snapTo: [0, 1 / 3, 2 / 3, 1], duration: { min: 0.3, max: 0.9 }, delay: 0.08, ease: "power2.inOut" },
            onUpdate: (self) => {
              const n = Math.round(self.progress * 3) + 1;
              if (n !== stepRef.current) {
                dirRef.current = n > stepRef.current ? 1 : -1;
                stepRef.current = n;
                setStep(n);
              }
            },
          },
        });

        /* الكاميرا: كل خطوة زاوية مختلفة للنافذة */
        const E = "power1.inOut";
        tl.to(cam, { scale: 1, rotationY: -8, rotationX: 3, x: -24, duration: 1, ease: E }, 0)
          .to(cam, { scale: 0.94, rotationY: 12, rotationX: 4, x: 16, duration: 1, ease: E }, 1)
          .to(cam, { scale: 1.04, rotationY: 0, rotationX: 0, x: -8, duration: 1, ease: E }, 2);

        /* باراالاكس السحاب: كل طبقة بسرعة */
        stage.querySelectorAll<HTMLElement>("[data-par]").forEach((el) => {
          tl.to(el, { x: Number(el.dataset.par), duration: 3 }, 0);
        });

        /* الشروق: السما بتدفى والشمس بتطلع */
        tl.to(warm, { opacity: 1, duration: 1.2 }, 1.8)
          .fromTo(sun, { y: 70, opacity: 0 }, { y: -50, opacity: 1, duration: 1.4 }, 1.6);

        /* سحابة كبيرة بتعدي الشاشة بين كل خطوتين (إحساس الطيران) */
        stage.querySelectorAll<HTMLElement>("[data-wipe]").forEach((w, i) => {
          const base = i + 0.1;
          tl.fromTo(w, { x: "-75vw", y: "46vh" }, { x: "62vw", y: "-46vh", duration: 0.8 }, base)
            .fromTo(w, { opacity: 0 }, { opacity: 0.92, duration: 0.4 }, base)
            .to(w, { opacity: 0, duration: 0.4 }, base + 0.4);
        });

        stRef.current = tl.scrollTrigger ?? null;
        return () => {
          deskRef.current = false;
          stRef.current = null;
        };
      });

      mm.add("(max-width: 900px), (prefers-reduced-motion: reduce)", () => {
        deskRef.current = false;
      });
    }, sectionRef);

    return () => {
      mm.revert();
      ctx.revert();
    };
  }, []);

  /* ── ميل خفيف للمشهد مع الماوس ── */
  useEffect(() => {
    const tilt = tiltRef.current;
    const stage = stageRef.current;
    if (!tilt || !stage) return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;
    const rx = gsap.quickTo(tilt, "rotationX", { duration: 0.8, ease: "power3.out" });
    const ry = gsap.quickTo(tilt, "rotationY", { duration: 0.8, ease: "power3.out" });
    const move = (e: MouseEvent) => {
      const r = stage.getBoundingClientRect();
      ry(((e.clientX - (r.left + r.width / 2)) / r.width) * 7);
      rx((-(e.clientY - (r.top + r.height / 2)) / r.height) * 5);
    };
    const leave = () => { rx(0); ry(0); };
    stage.addEventListener("mousemove", move);
    stage.addEventListener("mouseleave", leave);
    return () => {
      stage.removeEventListener("mousemove", move);
      stage.removeEventListener("mouseleave", leave);
    };
  }, []);

  /* ── كل خطوة: الكلام بخط اليد والأسهم بترتسم ── */
  useEffect(() => {
    if (!entered) return;
    const root = notesRef.current;
    if (!root) return;
    const notes = root.querySelectorAll("[data-note]");
    const arrows = root.querySelectorAll("[data-arrow]");
    const tl = gsap.timeline({ delay: 0.2 });
    tl.fromTo(notes, { opacity: 0, y: 12, rotate: -3 },
        { opacity: 1, y: 0, rotate: 0, duration: 0.6, stagger: 0.18, ease: "power3.out" }, 0)
      .fromTo(arrows, { strokeDashoffset: 1 },
        { strokeDashoffset: 0, duration: 0.8, stagger: 0.18, ease: "power2.inOut" }, 0.25);
    return () => { tl.kill(); };
  }, [bodyKey, entered]);

  /* ── دخول محتوى الخطوة ── */
  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    const dir = dirRef.current;
    const tl = gsap.timeline({ delay: 0.05 });
    tl.fromTo(body.querySelectorAll("[data-s='line']"), { yPercent: 110 },
        { yPercent: 0, duration: 0.8, ease: "power4.out" }, 0)
      .fromTo(body.querySelectorAll("[data-s='fade']"), { y: 26 * dir, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.07, ease: "power3.out" }, 0.1);
    return () => { tl.kill(); };
  }, [bodyKey]);

  /* ── تغيير العالم: النافذة بتلف لفة صغيرة ── */
  useEffect(() => {
    const win = winRef.current;
    if (!win) return;
    const t = gsap.fromTo(win,
      { rotationY: -16, scale: 0.95, opacity: 0.4 },
      { rotationY: 0, scale: 1, opacity: 1, duration: 0.9, ease: "power3.out", transformPerspective: 900 });
    return () => { t.kill(); };
  }, [catId]);

  /* ── النهاية: النافذة بتطلع + حلقة + شرارات + LIVE ── */
  useEffect(() => {
    const win = winRef.current;
    const ring = ringRef.current;
    const badge = badgeRef.current;
    const sparks = sparksRef.current;
    if (!win || !ring || !badge || !sparks) return;

    if (done) {
      const tl = gsap.timeline();
      tl.to(win, { y: -28, scale: 1.04, duration: 1, ease: "elastic.out(1, 0.5)" }, 0)
        .fromTo(ring, { scale: 0.96, opacity: 0.9 }, { scale: 1.4, opacity: 0, duration: 1.2, ease: "power2.out" }, 0)
        .fromTo(badge, { scale: 0, rotate: -20 }, { scale: 1, rotate: 0, duration: 0.8, ease: "back.out(2.4)" }, 0.35);
      const dots = Array.from(sparks.children);
      dots.forEach((c, i) => {
        const a = (i / dots.length) * Math.PI * 2;
        const dist = 150 + Math.random() * 100;
        tl.fromTo(c, { x: 0, y: 0, opacity: 1, scale: 1 },
          { x: Math.cos(a) * dist, y: Math.sin(a) * dist, opacity: 0, scale: 0.2, duration: 1.5, ease: "power3.out" }, 0.05 + i * 0.02);
      });
      return () => { tl.kill(); };
    }
    gsap.to(win, { y: 0, scale: 1, duration: 0.6, ease: "power3.out" });
    gsap.set(badge, { scale: 0 });
    gsap.set(ring, { opacity: 0 });
  }, [done]);

  /* ═══════════ الواجهة ═══════════ */
  const stepMeta = STEPS[step - 1];
  const progress = done ? 1 : (step - 1) / 3;
  const first = form.name.trim().split(" ")[0];
  const slug = form.brand.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 16) || "yourbrand";
  const planP = (form.budget ? 0.5 : 0) + (form.timeline ? 0.5 : 0);
  const notes = done ? NOTES_DONE : NOTES[step - 1];

  const renderBody = () => {
    if (done) {
      return (
        <>
          <div data-s="fade" className={styles.doneBadge} aria-hidden="true">✓</div>
          <h3 className={styles.stepTitle}>
            <span className={styles.mask}>
              <span data-s="line" className={styles.maskInner}>Brief received</span>
            </span>
          </h3>
          <p data-s="fade" className={styles.stepHint}>
            Thanks{first ? `, ${first}` : ""}. We are reviewing your {cat.name.toLowerCase()} brief and will email {form.email.trim()} within 24 hours.
          </p>
          <ul data-s="fade" className={styles.summary}>
            <li>{form.brand.trim()}</li>
            <li>{cat.styles[form.styleIdx].label}</li>
            <li>{form.features.length} features</li>
            <li>{form.budget}</li>
            <li>{form.timeline}</li>
          </ul>
        </>
      );
    }

    return (
      <>
        <h3 className={styles.stepTitle}>
          <span className={styles.mask}>
            <span data-s="line" className={styles.maskInner}>{stepMeta.title}</span>
          </span>
        </h3>
        <p data-s="fade" className={styles.stepHint}>{stepMeta.hint}</p>

        {step === 1 && (
          <>
            <div data-s="fade" className={styles.field}>
              <span className={styles.label}>Your world</span>
              <div className={styles.chips} role="group" aria-label="Website category">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={`${styles.chip} ${catId === c.id ? styles.chipOn : ""}`}
                    aria-pressed={catId === c.id}
                    onClick={() => pickCat(c.id)}
                  >
                    <span className={styles.worldDot} style={{ background: c.accent }} />
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <label data-s="fade" className={styles.field}>
              <span className={styles.label}>Brand name</span>
              <input
                className={styles.input}
                value={form.brand}
                onChange={(e) => set("brand", e.target.value)}
                placeholder={cat.placeholder}
                autoComplete="organization"
              />
            </label>

            <div data-s="fade" className={styles.seg} role="group" aria-label="Project type">
              {([["new", "New website"], ["redesign", "Redesign my site"]] as const).map(([k, label]) => (
                <button
                  key={k}
                  type="button"
                  className={`${styles.segBtn} ${form.kind === k ? styles.segOn : ""}`}
                  onClick={() => set("kind", k)}
                >
                  {label}
                </button>
              ))}
            </div>

            <div data-s="fade" className={styles.field}>
              <span className={styles.label}>Visual direction</span>
              <div className={styles.chips}>
                {cat.styles.map((s, i) => (
                  <button
                    key={s.label}
                    type="button"
                    className={`${styles.chip} ${form.styleIdx === i ? styles.chipOn : ""}`}
                    onClick={() => set("styleIdx", i)}
                  >
                    <span className={styles.swatch} style={{ background: s.tint }} />
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div data-s="fade" className={styles.chips}>
              {cat.features.map((ft) => (
                <button
                  key={ft}
                  type="button"
                  className={`${styles.chip} ${form.features.includes(ft) ? styles.chipOn : ""}`}
                  aria-pressed={form.features.includes(ft)}
                  onClick={() => toggleFeature(ft)}
                >
                  {ft}
                </button>
              ))}
            </div>
            <p data-s="fade" className={styles.hint}>
              {form.features.length ? `${form.features.length} selected` : "Pick at least one"}
            </p>
          </>
        )}

        {step === 3 && (
          <>
            <div data-s="fade" className={styles.field}>
              <span className={styles.label}>Budget</span>
              <div className={styles.chips}>
                {BUDGETS.map((b) => (
                  <button
                    key={b}
                    type="button"
                    className={`${styles.chip} ${form.budget === b ? styles.chipOn : ""}`}
                    onClick={() => set("budget", b)}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
            <div data-s="fade" className={styles.field}>
              <span className={styles.label}>Timeline</span>
              <div className={styles.chips}>
                {TIMELINES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`${styles.chip} ${form.timeline === t ? styles.chipOn : ""}`}
                    onClick={() => set("timeline", t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <div data-s="fade" className={styles.row2}>
              <label className={styles.field}>
                <span className={styles.label}>Your name</span>
                <input
                  className={styles.input}
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Full name"
                  autoComplete="name"
                />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Email</span>
                <input
                  className={styles.input}
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="you@brand.com"
                  autoComplete="email"
                />
              </label>
            </div>
            <label data-s="fade" className={styles.field}>
              <span className={styles.label}>Anything else? (optional)</span>
              <textarea
                className={`${styles.input} ${styles.textarea}`}
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                placeholder="Links, references, deadlines…"
              />
            </label>
          </>
        )}
      </>
    );
  };

  return (
    <section ref={sectionRef} id="contact" className={styles.section} aria-labelledby="section5-title">
      <div className={styles.head}>
        <h2 id="section5-title" className={styles.title}>
          <span className={styles.mask}>
            <span data-intro="line" className={styles.maskInner}>ORDER YOUR WEBSITE</span>
          </span>
          <span className={styles.mask}>
            <span data-intro="line" className={styles.maskInner}>IN FOUR QUICK STEPS</span>
          </span>
        </h2>
        <p data-intro="fade" className={styles.subtitle}>scroll, and watch your site take shape in the clouds</p>
      </div>

      {/* المشهد الكامل: بيتثبت وبيتحرك مع السكرول */}
      <div
        ref={stageRef}
        className={styles.stage}
        style={{ "--accent": cat.accent, "--tint": tint } as CSSProperties}
      >
        {/* السما: ألوان + شمس + سحاب بعيد (باراالاكس) */}
        <div className={styles.sky} aria-hidden="true">
          <div ref={warmRef} className={styles.warm} />
          <div ref={sunRef} className={styles.sun} />
          <div data-par="-70" className={styles.layer}>
            <Cloud s={9} style={{ left: "6%", top: "12%", opacity: 0.55 }} />
            <Cloud s={8} style={{ left: "46%", top: "7%", opacity: 0.5 }} />
            <Cloud s={10} style={{ right: "4%", top: "18%", opacity: 0.55 }} />
          </div>
          <div data-par="-180" className={styles.layer}>
            <Cloud s={14} style={{ left: "-4%", top: "52%", opacity: 0.85 }} />
            <Cloud s={12} style={{ left: "34%", top: "70%", opacity: 0.8 }} />
            <Cloud s={13} style={{ right: "18%", top: "62%", opacity: 0.85 }} />
            <Cloud s={11} style={{ right: "-3%", top: "30%", opacity: 0.7 }} />
          </div>
        </div>

        {/* المشهد 3D */}
        <div className={styles.scene}>
          <div ref={tiltRef} className={styles.tilt}>
            <div ref={camRef} className={styles.cam}>
              <Cloud s={13} depth={-70} style={{ left: "-8%", top: "58%" }} />
              <Cloud s={10} depth={-70} style={{ right: "-6%", top: "6%" }} />

              {/* النافذة الزجاجية الحية */}
              <div className={styles.winFloat} data-float data-z="0">
                <div
                  ref={winRef}
                  className={styles.win}
                  data-lvl={lvl}
                  role="img"
                  aria-label={`Live preview of your ${cat.name.toLowerCase()} website`}
                >
                  <div className={styles.bar}>
                    <span className={styles.dotR} />
                    <span className={styles.dotY} />
                    <span className={styles.dotC} />
                    <span className={styles.url}>{slug}.com</span>
                  </div>

                  <div className={styles.mNav}>
                    <span className={styles.mBrand}>
                      <span className={styles.mLogo} />
                      <span className={styles.mBrandName}>{form.brand.trim().slice(0, 14) || "Brand"}</span>
                    </span>
                    <span className={styles.mLinks}><i /><i /><i /></span>
                  </div>

                  <div className={styles.mHero}>
                    <div className={styles.mCopy}>
                      <p className={styles.mTag}>{cat.tagline}</p>
                      <h4 className={`${styles.mTitle} ${form.brand.trim() ? "" : styles.ghostText}`}>
                        {form.brand.trim() || "Your brand"}
                      </h4>
                      <span className={styles.skel} />
                      <span className={`${styles.skel} ${styles.skelShort}`} />
                      <span className={styles.mCta}>{cat.cta}</span>
                    </div>
                    <div className={styles.art}>
                      <Art id={cat.id} />
                    </div>
                  </div>

                  <div className={styles.mGrid}>
                    {Array.from({ length: 6 }, (_, i) => {
                      const ft = form.features[i];
                      return ft ? <Tile key={ft} label={ft} /> : <div key={`s${i}`} className={styles.slot} />;
                    })}
                  </div>

                  <div className={styles.plan}>
                    <div className={styles.planTrack}>
                      <span className={styles.planFill} style={{ transform: `scaleX(${planP})` }} />
                    </div>
                    <div className={styles.planText}>
                      <span>{form.budget || "Budget"}</span>
                      <span>{form.timeline || "Timeline"}</span>
                    </div>
                  </div>
                </div>

                <span ref={ringRef} className={styles.ring} />
                <div ref={sparksRef} className={styles.sparks} aria-hidden="true">
                  {Array.from({ length: 16 }, (_, i) => <span key={i} />)}
                </div>
                <span ref={badgeRef} className={styles.live}>LIVE</span>
              </div>

              {/* كروت زجاج صغيرة طايرة (زي الهيرو) */}
              <div className={`${styles.glass} ${styles.gPhoto}`} data-float data-z="70" aria-hidden="true">
                <span className={styles.gPhotoImg} />
              </div>
              <div className={`${styles.glass} ${styles.gCode}`} data-float data-z="95" aria-hidden="true">
                <span>{"</>"}</span>
              </div>
              <div className={`${styles.glass} ${styles.gText}`} data-float data-z="60" aria-hidden="true">
                <i /><i /><i />
              </div>

              <div className={styles.rock} aria-hidden="true">
                <Rock />
              </div>

              <div key={bodyKey} ref={notesRef} className={styles.notes} aria-hidden="true">
                {notes.map((n) => (
                  <div
                    key={n.text}
                    data-note
                    className={`${styles.note} ${n.arrow === "dl" ? styles.noteL : ""}`}
                    style={{ left: n.x, top: n.y }}
                  >
                    <span className={styles.noteText}>{n.text}</span>
                    <ArrowSvg dir={n.arrow} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* سحاب أمامي: أسرع طبقة */}
        <div data-par="-340" className={`${styles.layer} ${styles.near}`} aria-hidden="true">
          <Cloud s={30} style={{ left: "-8%", bottom: "-120px" }} />
          <Cloud s={34} style={{ left: "38%", bottom: "-150px" }} />
          <Cloud s={28} style={{ right: "-6%", bottom: "-110px" }} />
        </div>

        {/* سحابات بتعدي الشاشة بين الخطوات */}
        <Cloud s={90} wipe still />
        <Cloud s={90} wipe still />
        <Cloud s={90} wipe still />

        {/* ── النص والفورم: مباشرة على السما، بدون كارت ── */}
        <div data-copy className={styles.copy}>
          <div className={styles.topRow}>
            <span className={styles.kicker}>{done ? "Complete" : `Step 0${step} / 04`}</span>
            <span className={styles.catName}>{cat.name}</span>
          </div>

          <div className={styles.stepper}>
            <span className={styles.track}>
              <span className={styles.trackFill} style={{ transform: `scaleX(${progress})` }} />
            </span>
            {STEPS.map((s, i) => {
              const n = i + 1;
              const isDone = done || n < step;
              return (
                <button
                  key={s.label}
                  type="button"
                  className={`${styles.stepItem} ${isDone ? styles.stepDone : ""} ${!done && n === step ? styles.stepCur : ""}`}
                  onClick={() => goTo(n)}
                  aria-label={`Go to step ${n}: ${s.label}`}
                >
                  <span className={styles.stepDot}>{isDone ? "✓" : n}</span>
                  <span className={styles.stepLabel}>{s.label}</span>
                </button>
              );
            })}
          </div>

          <div
            key={bodyKey}
            ref={bodyRef}
            className={styles.body}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.target as HTMLElement).tagName === "INPUT") {
                e.preventDefault();
                next();
              }
            }}
          >
            {renderBody()}
          </div>

          {done ? (
            <div className={styles.actions}>
              <button type="button" className={styles.primary} onClick={restart}>
                Start another brief
              </button>
            </div>
          ) : (
            <>
              {status === "error" && (
                <p className={styles.error}>We could not send your brief. Check your connection and try again.</p>
              )}
              <div className={styles.actions}>
                <button type="button" className={styles.ghost} onClick={() => go(-1)} disabled={step === 1}>
                  ← Back
                </button>
                <button type="button" className={styles.primary} onClick={next} disabled={!valid || status === "sending"}>
                  {step < 4 ? "Next →" : status === "sending" ? "Sending…" : "Send brief"}
                </button>
              </div>
            </>
          )}
        </div>

        <p key={`c${bodyKey}`} className={styles.caption}>
          <span className={styles.capDot} />
          {done ? "Live in the clouds" : CAPTIONS[step - 1]}
        </p>

        <p className={`${styles.scrollHint} ${step > 1 || done ? styles.scrollHintOff : ""}`} aria-hidden="true">
          <span>Scroll to build</span>
          <i />
        </p>
      </div>
    </section>
  );
}