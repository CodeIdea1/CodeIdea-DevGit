"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./LoadingScreen.module.css";

/* ───────────── Data ───────────── */
const PARTS = [
  {
    name: "top",
    d: `M950 368 C978 368 1005 386 1045 404 L1630 680 Q1668 700 1666 718
        Q1662 738 1640 748 L1420 850 Q1395 864 1375 862 L975 670
        Q950 662 925 672 L545 850 Q520 864 495 858 L265 748
        Q238 738 232 718 Q232 700 265 688 L860 404 Q905 368 950 368 Z`,
  },
  {
    name: "left-upper",
    d: `M207 815 Q207 782 240 782 Q255 782 270 790 L870 1065
        Q928 1100 928 1150 L928 1350 Q905 1358 880 1352 L265 1075
        Q232 1062 220 1038 L207 1038 Z`,
  },
  {
    name: "left-lower",
    d: `M220 1048 Q235 1072 265 1086 L880 1366 Q900 1371 915 1363
        L915 1500 Q912 1520 890 1522 Q880 1522 870 1517 L265 1235
        Q222 1212 220 1180 Z`,
  },
  {
    name: "right-upper",
    d: `M1645 785 Q1670 785 1676 805 L1675 962 Q1655 958 1635 968
        L1040 1245 Q1000 1262 980 1285 L982 1160 Q985 1100 1030 1082
        L1640 797 Z`,
  },
  {
    name: "right-lower",
    d: `M1690 978 L1690 1190 Q1685 1225 1645 1245 L1030 1530
        Q995 1540 975 1520 Q966 1510 966 1495 L968 1300
        Q990 1262 1040 1248 L1640 972 Q1665 962 1690 978 Z`,
  },
];

const PARTICLES = [
  { x: "12%", y: "20%", size: "6px", color: "#6ee7b7", dur: 3.2, delay: 0 },
  { x: "80%", y: "15%", size: "4px", color: "#93c5fd", dur: 4.1, delay: 0.5 },
  { x: "55%", y: "70%", size: "5px", color: "#6ee7b7", dur: 3.7, delay: 1 },
  { x: "30%", y: "60%", size: "3px", color: "#fff", dur: 5.0, delay: 0.3 },
  { x: "70%", y: "50%", size: "4px", color: "#93c5fd", dur: 4.5, delay: 1.2 },
  { x: "90%", y: "75%", size: "6px", color: "#6ee7b7", dur: 3.0, delay: 0.8 },
  { x: "20%", y: "80%", size: "3px", color: "#fff", dur: 4.8, delay: 0.2 },
  { x: "45%", y: "30%", size: "5px", color: "#93c5fd", dur: 3.5, delay: 1.5 },
];



/* ───────────── Constants ───────────── */
const VB = { w: 1500, cx: 950, cy: 955 }; // إحداثيات اللوجو الأصلية
const ANCHOR = { x: 950, y: 520 }; // نقطة الزوم (جوه جسم اللوجو)

const DRAW_DURATION = 3800;
const FILL_HOLD = 1000;
const ZOOM_DURATION = 1700;

type Phase = "draw" | "fill" | "zoom";

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/* ───────────── Sub components ───────────── */

/* الطبقة الغامقة: اللوجو فيها فتحة بيظهر منها الموقع */
function Backdrop({ holeRef }: { holeRef: React.RefObject<SVGGElement | null> }) {
  return (
    <svg className={`${styles.layer} ${styles.backdrop}`} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <mask id="logoHole" maskUnits="userSpaceOnUse" x="-50%" y="-50%" width="200%" height="200%">
          <rect x="-50%" y="-50%" width="200%" height="200%" fill="#fff" />
          <g ref={holeRef} style={{ visibility: "hidden" }}>
            {PARTS.map((p) => (
              <path key={p.name} d={p.d} fill="#000" className={styles.holeFill} />
            ))}
          </g>
        </mask>
      </defs>
      <defs>
          <radialGradient id="bgGrad" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#0f1923" />
            <stop offset="100%" stopColor="#060a0f" />
          </radialGradient>
        </defs>
      <rect x="-50%" y="-50%" width="200%" height="200%" fill="url(#bgGrad)" mask="url(#logoHole)" />
    </svg>
  );
}

/* الديكور: بدون أي stroke نهائيًا */
function Decor() {
  return (
    <div className={styles.decor}>
      <div className={styles.grid} />

      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className={styles.particle}
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            background: p.color,
            animationDuration: `${p.dur}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      <svg className={styles.cloud1} width="260" height="80" viewBox="0 0 260 80">
        <ellipse cx="130" cy="55" rx="120" ry="28" fill="#fff" />
        <ellipse cx="90" cy="42" rx="60" ry="32" fill="#fff" />
        <ellipse cx="170" cy="38" rx="55" ry="30" fill="#fff" />
      </svg>
      <svg className={styles.cloud2} width="180" height="60" viewBox="0 0 180 60">
        <ellipse cx="90" cy="42" rx="80" ry="20" fill="#fff" />
        <ellipse cx="65" cy="30" rx="42" ry="24" fill="#fff" />
        <ellipse cx="120" cy="28" rx="38" ry="22" fill="#fff" />
      </svg>
    </div>
  );
}

/* بوردر اللوجو: الوحيد اللي عليه stroke */
function LogoOutline({ groupRef }: { groupRef: React.RefObject<SVGGElement | null> }) {
  const pathsRef = useRef<SVGPathElement[]>([]);

  useEffect(() => {
    const paths = pathsRef.current.filter(Boolean);
    if (!paths.length) return;

    // نحسب الطول الحقيقي لكل path ونخفيها
    paths.forEach((p) => {
      const len = p.getTotalLength();
      p.style.strokeDasharray = String(len);
      p.style.strokeDashoffset = String(len);
    });

    const STAGGER = 0.55;
    const PART_DUR = 1.3;
    const ease = (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    let frame = 0;
    const start = performance.now() + 300;

    const tick = (now: number) => {
      paths.forEach((p, i) => {
        const len = parseFloat(p.style.strokeDasharray);
        const elapsed = (now - start - i * STAGGER * 1000) / (PART_DUR * 1000);
        const t = Math.max(0, Math.min(1, elapsed));
        p.style.strokeDashoffset = String(len * (1 - ease(t)));
      });

      const done = paths.every((p, i) => {
        const elapsed = (now - start - i * STAGGER * 1000) / (PART_DUR * 1000);
        return elapsed >= 1;
      });

      if (!done) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <svg className={`${styles.layer} ${styles.strokes}`} xmlns="http://www.w3.org/2000/svg" fill="none">
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6ee7b7" />
          <stop offset="100%" stopColor="#93c5fd" />
        </linearGradient>
      </defs>
      <g ref={groupRef} style={{ visibility: "hidden" }}>
        {PARTS.map((p) => (
          <path key={`ghost-${p.name}`} d={p.d} className={styles.ghost} />
        ))}
        {PARTS.map((p, i) => (
          <path
            key={p.name}
            ref={(el) => { if (el) pathsRef.current[i] = el; }}
            d={p.d}
            className={styles.draw}
          />
        ))}
      </g>
    </svg>
  );
}

/* ───────────── Main ───────────── */
export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<Phase>("draw");
  const [ready, setReady] = useState(false); // اللوجو اتقاس واتحط في مكانه
  const [hidden, setHidden] = useState(false);

  const phaseRef = useRef<Phase>("draw");
  const slotRef = useRef<HTMLDivElement>(null);
  const holeG = useRef<SVGGElement>(null);
  const strokeG = useRef<SVGGElement>(null);
  const geo = useRef({ base: 0.13, ax: 0, ay: 0, w: 0, h: 0 });
  const holeGStyle = useRef<string>("");
  const strokeGStyle = useRef<string>("");

  phaseRef.current = phase;

  const setTransform = (s: number, px: number, py: number) => {
    const t = `translate(${px} ${py}) scale(${s}) translate(${-ANCHOR.x} ${-ANCHOR.y})`;
    if (holeG.current) { holeG.current.setAttribute("transform", t); holeG.current.style.visibility = "visible"; }
    if (strokeG.current) { strokeG.current.setAttribute("transform", t); strokeG.current.style.visibility = "visible"; }
  };

  const measure = () => {
    const el = slotRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const base = r.width / VB.w;
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    geo.current = {
      base,
      ax: cx + (ANCHOR.x - VB.cx) * base,
      ay: cy + (ANCHOR.y - VB.cy) * base,
      w: window.innerWidth,
      h: window.innerHeight,
    };
    setTransform(base, geo.current.ax, geo.current.ay);
  };

  /* قفل السكرول + القياس (اللوجو مخفي لحد ما يخلص) */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    measure();
    setReady(true); // دلوقتي بس نظهر اللوجو ونبدأ الأنيميشن

    const onResize = () => {
      if (phaseRef.current !== "zoom") measure();
    };
    window.addEventListener("resize", onResize);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* التقدم + الانتقال بين المراحل (بعد ready) */
  useEffect(() => {
    if (!ready) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      const t = setTimeout(() => setHidden(true), 600);
      return () => clearTimeout(t);
    }

    const start = performance.now();
    let frame = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const tick = (now: number) => {
      const p = Math.min((now - start) / DRAW_DURATION, 1);
      setProgress(Math.round((1 - Math.pow(1 - p, 3)) * 100));

      if (p < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        setPhase("fill");
        timer = setTimeout(() => setPhase("zoom"), FILL_HOLD);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      if (timer) clearTimeout(timer);
    };
  }, [ready]);

  /* الزوم: تحريك الـ transform مباشرة بدون re-render */
  useEffect(() => {
    if (phase !== "zoom") return;
    const { base, ax, ay, w, h } = geo.current;

    const K = (1.1 * (h + 0.5 * w)) / (300 * base);
    const cx = w / 2;
    const cy = h / 2;
    const t0 = performance.now();
    let frame = 0;

    const step = (now: number) => {
      const t = Math.min((now - t0) / ZOOM_DURATION, 1);
      const e = easeInOutCubic(t);
      const s = base * Math.exp(Math.log(K) * e);
      setTransform(s, ax + (cx - ax) * e, ay + (cy - ay) * e);

      if (t < 1) frame = requestAnimationFrame(step);
      else setHidden(true);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  if (hidden) return null;

  return (
    <div
      className={`${styles.wrapper} ${styles[phase]} ${ready ? styles.ready : ""}`}
    >
      <Backdrop holeRef={holeG} />
      <Decor />
      <LogoOutline groupRef={strokeG} />

      <div className={styles.ui}>
        <div ref={slotRef} className={styles.logoSlot} />
        <p className={styles.tagline}>your idea, built.</p>

        <div className={styles.progressWrapper}>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>
          <span className={styles.progressText}>{progress}%</span>
        </div>
      </div>
    </div>
  );
}