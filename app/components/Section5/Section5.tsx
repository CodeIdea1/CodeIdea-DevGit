"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, MouseEvent as ReactMouseEvent } from "react";
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
  blurb: string;
  tags: string[];
  placeholder: string;
  styles: { label: string; tint: string }[];
  features: string[];
  /* اسم العنصر اللي بيتضاف للمشهد مع كل خطوة */
  build: [string, string, string, string];
}

const CATEGORIES: Category[] = [
  {
    id: "interior",
    name: "Interior & Furniture",
    accent: "#e08e5c",
    blurb: "Showrooms, lookbooks and configurators that make a room feel lived in before it is built.",
    tags: ["3D rooms", "Configurator", "Lookbook"],
    placeholder: "e.g. Nordic Nest Studio",
    styles: [
      { label: "Minimal",      tint: "#e9e4da" },
      { label: "Warm classic", tint: "#c08a5b" },
      { label: "Modern dark",  tint: "#556a77" },
    ],
    features: ["3D room viewer", "Product configurator", "Lookbook gallery", "Online store", "Book a consultation", "AR preview"],
    build: ["Sofa", "Lamp and wall art", "Rug and plant", "Coffee table"],
  },
  {
    id: "estate",
    name: "Real Estate",
    accent: "#4fd1c5",
    blurb: "Listings, virtual tours and map search that turn browsers into booked viewings.",
    tags: ["Listings", "Virtual tours", "Map search"],
    placeholder: "e.g. Skyline Properties",
    styles: [
      { label: "Luxury", tint: "#d8c08a" },
      { label: "Modern", tint: "#7aa2c7" },
      { label: "Urban",  tint: "#9aa5b5" },
    ],
    features: ["Listings and filters", "Virtual tours", "Interactive map", "Agent profiles", "Mortgage calculator", "Lead capture"],
    build: ["Main tower", "Residence block", "Apartment block", "Map pin and trees"],
  },
  {
    id: "watch",
    name: "Watches",
    accent: "#d4af37",
    blurb: "Slow, precise showcases with 360° detail for brands that count every second.",
    tags: ["360° viewer", "Collections", "Limited drops"],
    placeholder: "e.g. Meridian Watches",
    styles: [
      { label: "Gold",     tint: "#d4af37" },
      { label: "Steel",    tint: "#aab4bd" },
      { label: "Midnight", tint: "#2f4f9a" },
    ],
    features: ["360° product viewer", "Collection pages", "Limited drop countdown", "Online store", "Strap configurator", "Brand story timeline"],
    build: ["Dial and time", "Chronograph", "Progress ring and date", "Lume and stitching"],
  },
];

const STEPS = [
  { label: "Brand",      title: "Tell us who you are",       hint: "Your name and the look you have in mind. Pick a direction and the scene changes with it." },
  { label: "Features",   title: "What should it do?",        hint: "Choose everything you want on the site. You can change your mind later." },
  { label: "Scope",      title: "Budget and timeline",       hint: "Rough numbers are fine. They help us plan the right build." },
  { label: "Contact",    title: "Where do we reach you?",    hint: "We reply within 24 hours with a plan and a quote." },
];

const BUDGETS   = ["$1k – 3k", "$3k – 7k", "$7k – 15k", "$15k+"];
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

const HIDE = 1.05; /* لازم يطابق stroke-dashoffset في الـ CSS */

/* ═══════════════════════════════════════════
   أيقونات الكروت
   ═══════════════════════════════════════════ */
function CardIcon({ id }: { id: CatId }) {
  if (id === "interior") {
    return (
      <svg viewBox="0 0 100 100" className={styles.icon} aria-hidden="true">
        <path className={styles.iGlow} d="M38 42 L18 90 H82 L62 42 z" />
        <path d="M38 42 l6 -22 h12 l6 22 z" />
        <path d="M50 42 V84 M36 90 h28" />
      </svg>
    );
  }
  if (id === "estate") {
    return (
      <svg viewBox="0 0 100 100" className={styles.icon} aria-hidden="true">
        <path d="M12 90 V52 h18 v38 M38 90 V24 h26 v66 M72 90 V58 h16 v32 M6 90 H94" />
        {[[44, 32], [54, 32], [44, 44], [54, 44], [44, 56], [54, 56]].map(([x, y], i) => (
          <rect key={i} x={x} y={y} width="6" height="6" rx="1" className={styles.iWin} style={{ animationDelay: `${i * 0.18}s` }} />
        ))}
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 100 100" className={styles.icon} aria-hidden="true">
      <circle cx="50" cy="50" r="26" />
      <path d="M41 24 l4 -14 h10 l4 14 M41 76 l4 14 h10 l4 -14" />
      <path className={styles.iHand} d="M50 50 V32" />
      <path className={styles.iHand2} d="M50 50 L61 57" />
    </svg>
  );
}

/* ═══════════════════════════════════════════
   المشاهد: كل خطوة بتضيف "طبقة" (data-layer)
   data-d = خط بيترسم | data-f = تعبئة بتظهر | data-pop = عنصر بينط
   ═══════════════════════════════════════════ */
function InteriorScene() {
  return (
    <>
      <rect className={styles.wall} x="24" y="30" width="352" height="292" rx="18" />
      <rect className={styles.floor} x="24" y="322" width="352" height="64" rx="14" />
      <g className={styles.line}>
        {/* 1: الكنبة */}
        <g data-layer="1">
          <path data-f className={styles.fillAcc} d="M114 212 h172 a14 14 0 0 1 14 14 v40 h-200 v-40 a14 14 0 0 1 14 -14 z" />
          <path data-f className={styles.fillAcc} d="M100 266 h200 v34 a10 10 0 0 1 -10 10 h-180 a10 10 0 0 1 -10 -10 z" />
          <path data-d pathLength={1} d="M114 212 h172 a14 14 0 0 1 14 14 v40 h-200 v-40 a14 14 0 0 1 14 -14 z" />
          <path data-d pathLength={1} d="M100 266 h200 v34 a10 10 0 0 1 -10 10 h-180 a10 10 0 0 1 -10 -10 z" />
          <path data-d pathLength={1} d="M80 236 h20 v74 h-20 a10 10 0 0 1 -10 -10 v-54 a10 10 0 0 1 10 -10 z" />
          <path data-d pathLength={1} d="M320 236 h-20 v74 h20 a10 10 0 0 0 10 -10 v-54 a10 10 0 0 0 -10 -10 z" />
          <path data-d pathLength={1} d="M200 266 v44" />
          <path data-d pathLength={1} d="M104 310 v12 M296 310 v12" />
        </g>
        {/* 2: لمبة + براويز */}
        <g data-layer="2">
          <path data-d pathLength={1} d="M120 76 h64 v74 h-64 z" />
          <path data-d pathLength={1} d="M128 138 l16 -22 l12 14 l10 -10 l10 18" />
          <path data-d pathLength={1} d="M204 76 h76 v50 h-76 z" />
          <path data-d pathLength={1} d="M242 101 m-12 0 a12 12 0 1 0 24 0 a12 12 0 1 0 -24 0" />
          <path data-d pathLength={1} d="M355 322 V152 M337 322 h36" />
          <path data-d pathLength={1} d="M333 152 l12 -44 h22 l12 44 z" />
          <g data-f>
            <path className={styles.glow} d="M336 154 L296 322 H376 L376 154 z" />
          </g>
        </g>
        {/* 3: سجادة + نبتة */}
        <g data-layer="3">
          <path data-f className={styles.fillAcc} d="M84 346 a116 14 0 1 0 232 0 a116 14 0 1 0 -232 0" />
          <path data-d pathLength={1} d="M84 346 a116 14 0 1 0 232 0 a116 14 0 1 0 -232 0" />
          <g className={styles.sway}>
            <path data-d pathLength={1} d="M28 322 l6 -34 h24 l6 34 z" />
            <path data-d pathLength={1} d="M46 288 C 30 262, 34 240, 46 222" />
            <path data-d pathLength={1} d="M46 288 C 62 266, 62 244, 50 226" />
            <path data-d pathLength={1} d="M46 288 C 40 272, 22 266, 16 250" />
          </g>
        </g>
        {/* 4: ترابيزة + قهوة */}
        <g data-layer="4">
          <path data-d pathLength={1} d="M150 350 h100 a4 4 0 0 1 0 8 h-100 a4 4 0 0 1 0 -8 z" />
          <path data-d pathLength={1} d="M160 358 v22 M240 358 v22" />
          <path data-d pathLength={1} d="M188 350 v-16 h22 v16" />
          <path data-d pathLength={1} d="M210 338 a6 6 0 0 1 0 10" />
          <g data-f>
            <path className={styles.steam}  d="M194 328 c-5 -8 5 -12 0 -20" />
            <path className={styles.steam2} d="M203 328 c-5 -8 5 -12 0 -20" />
          </g>
        </g>
      </g>
    </>
  );
}

function Windows({ cols, rows, x0, y0, dx, dy, w, h, offset }: {
  cols: number; rows: number; x0: number; y0: number; dx: number; dy: number; w: number; h: number; offset: number;
}) {
  const out = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = offset + r * cols + c;
      out.push(
        <rect
          key={i}
          x={x0 + c * dx}
          y={y0 + r * dy}
          width={w}
          height={h}
          rx="2"
          className={`${styles.win} ${(i * 7) % 10 < 6 ? styles.winLit : ""}`}
          style={{ "--i": i } as CSSProperties}
        />
      );
    }
  }
  return <>{out}</>;
}

function EstateScene() {
  return (
    <>
      <rect className={styles.wall} x="24" y="30" width="352" height="310" rx="18" />
      <rect className={styles.floor} x="24" y="340" width="352" height="46" rx="14" />
      <g className={styles.line}>
        <path d="M24 340 H376" />
        <circle cx="322" cy="86" r="22" />
        {/* 1: البرج الرئيسي */}
        <g data-layer="1">
          <path data-f className={styles.tintFill} d="M150 340 V112 L170 90 H230 L250 112 V340 z" />
          <path data-d pathLength={1} d="M150 340 V112 L170 90 H230 L250 112 V340" />
          <Windows cols={4} rows={6} x0={162} y0={112} dx={22} dy={36} w={12} h={18} offset={0} />
        </g>
        {/* 2: عمارة اليسار */}
        <g data-layer="2">
          <path data-f className={styles.tintFill} d="M70 340 V190 H140 V340 z" />
          <path data-d pathLength={1} d="M70 340 V190 H140 V340" />
          <Windows cols={3} rows={4} x0={78} y0={204} dx={20} dy={34} w={12} h={16} offset={24} />
        </g>
        {/* 3: عمارة اليمين */}
        <g data-layer="3">
          <path data-f className={styles.tintFill} d="M260 340 V150 H334 V340 z" />
          <path data-d pathLength={1} d="M260 340 V150 H334 V340" />
          <path data-d pathLength={1} d="M270 150 V132 h54 V150" />
          <Windows cols={3} rows={5} x0={272} y0={166} dx={22} dy={34} w={12} h={16} offset={36} />
        </g>
        {/* 4: دبوس الخريطة + شجر */}
        <g data-layer="4">
          <path data-d pathLength={1} d="M44 340 V324 M360 340 V324" />
          <path data-d pathLength={1} d="M34 314 a10 10 0 1 0 20 0 a10 10 0 1 0 -20 0" />
          <path data-d pathLength={1} d="M350 314 a10 10 0 1 0 20 0 a10 10 0 1 0 -20 0" />
          <ellipse className={styles.ripple} cx="200" cy="90" rx="22" ry="5" />
          <g data-pop>
            <path className={styles.pin} d="M200 44 a14 14 0 0 1 14 14 c0 11 -14 26 -14 26 c0 0 -14 -15 -14 -26 a14 14 0 0 1 14 -14 z" />
            <circle className={styles.pinDot} cx="200" cy="58" r="5" />
          </g>
        </g>
      </g>
    </>
  );
}

function WatchScene({ brand }: { brand: string }) {
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const a = (i * 30 * Math.PI) / 180;
    const r1 = i % 3 === 0 ? 70 : 79;
    const r2 = 90;
    const p = (r: number) => `${(200 + Math.sin(a) * r).toFixed(1)} ${(210 - Math.cos(a) * r).toFixed(1)}`;
    return `M${p(r1)} L${p(r2)}`;
  });
  const lumes = Array.from({ length: 12 }, (_, i) => {
    const a = (i * 30 * Math.PI) / 180;
    return { x: 200 + Math.sin(a) * 62, y: 210 - Math.cos(a) * 62 };
  });

  return (
    <>
      {/* الحزام والعلبة (دايمًا ظاهرين) */}
      <g className={styles.line}>
        <path data-f className={styles.tintFill} style={{ opacity: 1 }} d="M152 100 L162 28 H238 L248 100 z M152 320 L162 392 H238 L248 320 z" />
        <path d="M152 100 L162 28 H238 L248 100 M152 320 L162 392 H238 L248 320" />
        <path d="M320 200 h14 v20 h-14 z" />
        <circle cx="200" cy="210" r="120" />
        <circle cx="200" cy="210" r="104" />
        <circle className={styles.dial} cx="200" cy="210" r="96" />
      </g>

      <g className={styles.line}>
        {/* 1: العلامات + اسم البراند */}
        <g data-layer="1">
          {ticks.map((d, i) => (
            <path key={i} data-d pathLength={1} d={d} />
          ))}
          <text data-f className={styles.dialText} x="200" y="166" textAnchor="middle">
            {(brand.trim() || "YOUR BRAND").slice(0, 12).toUpperCase()}
          </text>
        </g>
        {/* 2: كرونوجراف */}
        <g data-layer="2">
          <path data-d pathLength={1} d="M150 232 a18 18 0 1 0 36 0 a18 18 0 1 0 -36 0" />
          <path data-d pathLength={1} d="M214 232 a18 18 0 1 0 36 0 a18 18 0 1 0 -36 0" />
          <g data-f>
            <path className={styles.spin1} d="M168 232 V218" />
            <path className={styles.spin2} d="M232 232 V219" />
          </g>
        </g>
        {/* 3: حلقة التقدم + التاريخ */}
        <g data-layer="3">
          <path className={styles.ring} data-d pathLength={1} d="M200 98 a112 112 0 0 1 0 224 a112 112 0 0 1 0 -224" />
          <path data-d pathLength={1} d="M256 200 h30 v20 h-30 z" />
          <text data-f className={styles.dateText} x="271" y="214.5" textAnchor="middle">21</text>
        </g>
        {/* 4: لوم + غرز الحزام */}
        <g data-layer="4">
          {lumes.map((p, i) => (
            <circle key={i} data-pop className={styles.lume} cx={p.x} cy={p.y} r="2.6" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
          <g data-f>
            <path className={styles.stitch} d="M171 40 L178 96 M229 40 L222 96 M171 380 L178 324 M229 380 L222 324" />
          </g>
        </g>

        {/* العقارب */}
        <path data-hand="hour" className={styles.hHour} d="M200 210 V158" />
        <path data-hand="min"  className={styles.hMin}  d="M200 210 V132" />
        <path className={styles.secHand} d="M200 226 V122" />
        <circle className={styles.hubDot} cx="200" cy="210" r="5" />
      </g>
    </>
  );
}

/* ═══════════════════════════════════════════
   المكوّن الرئيسي
   ═══════════════════════════════════════════ */
export default function Section5() {
  const sectionRef = useRef<HTMLElement>(null);
  const panelRef   = useRef<HTMLDivElement>(null);
  const wrapRef    = useRef<HTMLDivElement>(null);
  const stageRef   = useRef<HTMLDivElement>(null);
  const sceneColRef = useRef<HTMLDivElement>(null);
  const tiltRef    = useRef<HTMLDivElement>(null);
  const sceneRef   = useRef<SVGSVGElement>(null);
  const bodyRef    = useRef<HTMLDivElement>(null);

  const dirRef          = useRef(1);
  const closingRef      = useRef(false);
  const enteredRef      = useRef(false);
  const sceneStartedRef = useRef(false);

  const [catId, setCatId]   = useState<CatId | null>(null);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const [step, setStep]     = useState(1);
  const [form, setForm]     = useState<FormState>(EMPTY);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  const cat = CATEGORIES.find((c) => c.id === catId) ?? null;
  const done = status === "done";
  const bodyKey = done ? "done" : String(step);
  const valid = canGo(step, form);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const toggleFeature = (name: string) =>
    setForm((f) => ({
      ...f,
      features: f.features.includes(name) ? f.features.filter((x) => x !== name) : [...f.features, name],
    }));

  /* ── اختيار الفئة: الدايرة بتتوسع من مكان الضغطة ── */
  const choose = (id: CatId, e: ReactMouseEvent<HTMLButtonElement>) => {
    const panel = panelRef.current;
    if (!panel || catId) return;
    const pr = panel.getBoundingClientRect();
    let cx = e.clientX;
    let cy = e.clientY;
    if (e.detail === 0) {
      const br = e.currentTarget.getBoundingClientRect();
      cx = br.left + br.width / 2;
      cy = br.top + br.height / 2;
    }
    dirRef.current = 1;
    setOrigin({ x: cx - pr.left, y: cy - pr.top });
    setCatId(id);
  };

  const cardGlow = (e: ReactMouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  const closeForm = () => {
    const wrap = wrapRef.current;
    const stage = stageRef.current;
    const panel = panelRef.current;
    const reset = () => {
      closingRef.current = false;
      enteredRef.current = false;
      sceneStartedRef.current = false;
      setCatId(null);
      setStep(1);
      setForm(EMPTY);
      setStatus("idle");
    };
    if (!wrap || !stage || !panel) return reset();
    if (closingRef.current) return;
    closingRef.current = true;

    const { x, y } = origin;
    const r = Math.hypot(panel.offsetWidth, panel.offsetHeight) * 1.05;
    const full = `circle(${r}px at ${x}px ${y}px)`;
    const hide = `circle(0px at ${x}px ${y}px)`;

    gsap
      .timeline({ onComplete: reset })
      .to(stage.querySelectorAll("[data-c], [data-s]"), { opacity: 0, y: -14, duration: 0.3, stagger: 0.02, ease: "power2.in" }, 0)
      .fromTo(stage, { clipPath: full }, { clipPath: hide, duration: 0.75, ease: "power3.inOut" }, 0.1)
      .fromTo(wrap,  { clipPath: full }, { clipPath: hide, duration: 0.75, ease: "power3.inOut" }, 0.26);
  };

  const go = (d: number) => {
    dirRef.current = d;
    setStep((s) => Math.min(4, Math.max(1, s + d)));
  };

  const submit = async () => {
    if (!cat || !canGo(4, form) || status === "sending") return;
    setStatus("sending");
    const payload = {
      category: cat.id,
      ...form,
      style: cat.styles[form.styleIdx].label,
    };
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

  /* ── دخول العنوان والكروت مع السكرول ── */
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const s = sectionRef.current;
      const panel = panelRef.current;
      if (!s || !panel) return;

      gsap.fromTo(
        s.querySelectorAll("[data-intro='line']"),
        { yPercent: 110 },
        { yPercent: 0, duration: 0.9, stagger: 0.12, ease: "power3.out",
          scrollTrigger: { trigger: s, start: "top 70%", once: true } }
      );
      gsap.fromTo(
        s.querySelectorAll("[data-intro='fade']"),
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.3,
          scrollTrigger: { trigger: s, start: "top 70%", once: true } }
      );
      gsap.fromTo(
        s.querySelectorAll("[data-card]"),
        { y: 90, opacity: 0, rotate: 2 },
        { y: 0, opacity: 1, rotate: 0, duration: 1, stagger: 0.14, ease: "power3.out",
          scrollTrigger: { trigger: panel, start: "top 80%", once: true } }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  /* ── فتح الفورم: دايرتين (لون الفئة ثم الغامق) ── */
  useEffect(() => {
    if (!catId) return;
    const wrap = wrapRef.current;
    const stage = stageRef.current;
    const panel = panelRef.current;
    if (!wrap || !stage || !panel) return;

    const { x, y } = origin;
    const r = Math.hypot(panel.offsetWidth, panel.offsetHeight) * 1.05;
    const from = `circle(0px at ${x}px ${y}px)`;
    const to = `circle(${r}px at ${x}px ${y}px)`;

    const tl = gsap.timeline();
    tl.fromTo(wrap,  { clipPath: from }, { clipPath: to, duration: 1.05, ease: "power3.inOut", clearProps: "clipPath" }, 0)
      .fromTo(stage, { clipPath: from }, { clipPath: to, duration: 1.05, ease: "power3.inOut", clearProps: "clipPath", delay: 0 }, 0.16)
      .fromTo(stage.querySelectorAll("[data-c]"), { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.08, ease: "power3.out" }, 0.85);

    return () => { tl.kill(); };
  }, [catId, origin]);

  /* Escape يقفل الفورم */
  useEffect(() => {
    if (!catId) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeForm(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catId]);

  /* ── دخول محتوى كل خطوة ── */
  useEffect(() => {
    if (!catId) return;
    const body = bodyRef.current;
    if (!body) return;
    const delay = enteredRef.current ? 0 : 0.8;
    enteredRef.current = true;
    const dir = dirRef.current;

    const tl = gsap.timeline({ delay });
    tl.fromTo(body.querySelectorAll("[data-s='line']"), { yPercent: 110 },
        { yPercent: 0, duration: 0.8, ease: "power4.out" }, 0)
      .fromTo(body.querySelectorAll("[data-s='fade']"), { x: 40 * dir, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, stagger: 0.07, ease: "power3.out" }, 0.1);

    return () => { tl.kill(); };
  }, [catId, bodyKey]);

  /* ── المشهد: كل خطوة بتبني طبقة جديدة ── */
  useEffect(() => {
    const svg = sceneRef.current;
    if (!svg || !catId) return;
    const target = done ? 4 : step;
    const base = sceneStartedRef.current ? 0 : 0.95;
    sceneStartedRef.current = true;

    svg.querySelectorAll<SVGGElement>("[data-layer]").forEach((g) => {
      const n = Number(g.dataset.layer);
      const want = n <= target;
      if ((g.dataset.on === "1") === want) return;
      g.dataset.on = want ? "1" : "0";
      g.classList.toggle(styles.layerOn, want);

      const d = g.querySelectorAll("[data-d]");
      const f = g.querySelectorAll("[data-f]");
      const p = g.querySelectorAll("[data-pop]");
      gsap.killTweensOf([...Array.from(d), ...Array.from(f), ...Array.from(p)]);

      if (want) {
        gsap.to(d, { strokeDashoffset: 0, duration: 0.95, stagger: 0.08, delay: base, ease: "power2.inOut" });
        gsap.to(f, { opacity: 1, duration: 0.7, stagger: 0.06, delay: base + 0.35 });
        gsap.fromTo(p, { scale: 0, opacity: 0, transformOrigin: "50% 100%" },
          { scale: 1, opacity: 1, duration: 0.9, stagger: 0.05, delay: base + 0.5, ease: "bounce.out" });
      } else {
        gsap.to(d, { strokeDashoffset: HIDE, duration: 0.35, stagger: { each: 0.02, from: "end" } });
        gsap.to(f, { opacity: 0, duration: 0.3 });
        gsap.to(p, { scale: 0, opacity: 0, duration: 0.3 });
      }
    });

    /* الساعة: العقارب بتتحرك مع كل خطوة (10:10) */
    if (catId === "watch") {
      const hour = svg.querySelector("[data-hand='hour']");
      const min = svg.querySelector("[data-hand='min']");
      if (hour) gsap.to(hour, { rotation: target >= 1 ? -60 : 0, svgOrigin: "200 210", duration: 1.2, delay: base, ease: "elastic.out(1, 0.55)" });
      if (min)  gsap.to(min,  { rotation: target >= 2 ? 60 : 0,  svgOrigin: "200 210", duration: 1.2, delay: base, ease: "elastic.out(1, 0.55)" });
    }
  }, [catId, step, done]);

  /* ── النهاية: شرارات + نبضة ── */
  useEffect(() => {
    if (!done) return;
    const svg = sceneRef.current;
    if (!svg) return;
    const sparks = svg.querySelectorAll<SVGCircleElement>("[data-spark] circle");
    sparks.forEach((c, i) => {
      const a = (i / sparks.length) * Math.PI * 2;
      const dist = 130 + Math.random() * 70;
      gsap.fromTo(c, { x: 0, y: 0, opacity: 1, scale: 1 },
        { x: Math.cos(a) * dist, y: Math.sin(a) * dist, opacity: 0, scale: 0.2, duration: 1.5, delay: i * 0.025, ease: "power3.out" });
    });
    gsap.fromTo(svg, { scale: 1 }, { scale: 1.05, duration: 0.3, yoyo: true, repeat: 1, ease: "power2.out", transformOrigin: "50% 50%" });
  }, [done]);

  /* ── ميل خفيف للمشهد مع حركة الماوس ── */
  useEffect(() => {
    const wrap = tiltRef.current;
    const col = sceneColRef.current;
    if (!wrap || !col) return;
    gsap.set(wrap, { transformPerspective: 900 });
    const rx = gsap.quickTo(wrap, "rotationX", { duration: 0.6, ease: "power3.out" });
    const ry = gsap.quickTo(wrap, "rotationY", { duration: 0.6, ease: "power3.out" });
    const move = (e: MouseEvent) => {
      const r = wrap.getBoundingClientRect();
      ry(((e.clientX - (r.left + r.width / 2)) / r.width) * 14);
      rx((-(e.clientY - (r.top + r.height / 2)) / r.height) * 14);
    };
    const leave = () => { rx(0); ry(0); };
    col.addEventListener("mousemove", move);
    col.addEventListener("mouseleave", leave);
    return () => {
      col.removeEventListener("mousemove", move);
      col.removeEventListener("mouseleave", leave);
    };
  }, [catId]);

  /* ═══════════ الواجهة ═══════════ */
  const stepMeta = STEPS[step - 1];
  const progress = done ? 1 : (step - 1) / 3;
  const first = form.name.trim().split(" ")[0];

  const renderBody = () => {
    if (!cat) return null;

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
            <label data-s="fade" className={styles.field}>
              <span className={styles.label}>Brand name</span>
              <input
                className={styles.input}
                value={form.brand}
                onChange={(e) => set("brand", e.target.value)}
                placeholder={cat.placeholder}
                autoComplete="organization"
                autoFocus
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
        <p data-intro="fade" className={styles.subtitle}>pick your world, watch it take shape</p>
      </div>

      <div ref={panelRef} className={styles.panel}>
        {/* ── اختيار الفئة ── */}
        <div className={styles.pick}>
          <div className={styles.pickHead}>
            <p className={styles.pickKicker}>Step 1 · Choose your world</p>
            <h3 className={styles.pickTitle}>What kind of website do you need?</h3>
          </div>

          <div className={styles.cards}>
            {CATEGORIES.map((c, i) => (
              <button
                key={c.id}
                type="button"
                data-card
                className={styles.card}
                style={{ "--accent": c.accent } as CSSProperties}
                onMouseMove={cardGlow}
                onClick={(e) => choose(c.id, e)}
              >
                <span className={styles.cardNum}>0{i + 1}</span>
                <CardIcon id={c.id} />
                <span className={styles.cardName}>{c.name}</span>
                <span className={styles.cardBlurb}>{c.blurb}</span>
                <span className={styles.tags}>
                  {c.tags.map((t) => (
                    <span key={t} className={styles.tag}>{t}</span>
                  ))}
                </span>
                <span className={styles.cardCta}>Start your brief <span aria-hidden="true">→</span></span>
              </button>
            ))}
          </div>
        </div>

        {/* ── الفورم ── */}
        {cat && (
          <div
            ref={wrapRef}
            className={styles.formWrap}
            style={{
              "--accent": cat.accent,
              clipPath: `circle(0px at ${origin.x}px ${origin.y}px)`,
            } as CSSProperties}
          >
            <div
              ref={stageRef}
              className={styles.formStage}
              style={{ clipPath: `circle(0px at ${origin.x}px ${origin.y}px)` }}
              role="group"
              aria-label={`${cat.name} website brief`}
            >
              {/* المشهد */}
              <div ref={sceneColRef} className={styles.sceneCol}>
                <div ref={tiltRef} data-c className={styles.sceneWrap}>
                  <svg
                    ref={sceneRef}
                    key={cat.id}
                    viewBox="0 0 400 420"
                    className={styles.scene}
                    style={{ "--tint": cat.styles[form.styleIdx].tint } as CSSProperties}
                    role="img"
                    aria-label={`${cat.name} illustration that builds as you fill the form`}
                  >
                    {cat.id === "interior" && <InteriorScene />}
                    {cat.id === "estate" && <EstateScene />}
                    {cat.id === "watch" && <WatchScene brand={form.brand} />}
                    <g className={styles.sparks} data-spark>
                      {Array.from({ length: 16 }, (_, i) => (
                        <circle key={i} cx="200" cy="210" r="3" />
                      ))}
                    </g>
                  </svg>
                </div>
                <p key={bodyKey} data-c className={styles.caption}>
                  <span className={styles.capDot} />
                  {done ? "Your brief is ready" : `Now adding · ${cat.build[step - 1]}`}
                </p>
              </div>

              {/* الخطوات */}
              <div className={styles.formCol}>
                <div data-c className={styles.topRow}>
                  <button type="button" className={styles.back} onClick={closeForm}>
                    ← All categories
                  </button>
                  <span className={styles.catName}>{cat.name}</span>
                </div>

                <div data-c className={styles.stepper}>
                  <span className={styles.track}>
                    <span className={styles.trackFill} style={{ transform: `scaleX(${progress})` }} />
                  </span>
                  {STEPS.map((s, i) => {
                    const n = i + 1;
                    const isDone = done || n < step;
                    return (
                      <div
                        key={s.label}
                        className={`${styles.stepItem} ${isDone ? styles.stepDone : ""} ${!done && n === step ? styles.stepCur : ""}`}
                      >
                        <span className={styles.stepDot}>{isDone ? "✓" : n}</span>
                        <span className={styles.stepLabel}>{s.label}</span>
                      </div>
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
                  <div data-c className={styles.actions}>
                    <button type="button" className={styles.primary} onClick={closeForm}>
                      Start another brief
                    </button>
                  </div>
                ) : (
                  <>
                    {status === "error" && (
                      <p className={styles.error}>We could not send your brief. Check your connection and try again.</p>
                    )}
                    <div data-c className={styles.actions}>
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
            </div>
          </div>
        )}
      </div>
    </section>
  );
}