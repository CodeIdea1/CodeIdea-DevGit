"use client";

import { useEffect, useState } from "react";
import styles from "./LoadingScreen.module.css";

/* ───────────── Logo parts (غيّر قيم d لو جبت مسارات أدق) ───────────── */
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

function Logo() {
  return (
    <svg
      className={styles.logoSvg}
      viewBox="200 360 1500 1190"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
    >
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6ee7b7" />
          <stop offset="100%" stopColor="#93c5fd" />
        </linearGradient>
      </defs>

      {/* مسار شبحي خافت خلف الرسم */}
      {PARTS.map((p) => (
        <path key={`g-${p.name}`} d={p.d} className={styles.ghost} />
      ))}

      {/* الرسم الفعلي */}
      {PARTS.map((p, i) => (
        <path
          key={p.name}
          d={p.d}
          pathLength={1}
          className={styles.draw}
          style={{ ["--i" as string]: i }}
          data-part={p.name}
        />
      ))}
    </svg>
  );
}

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [hidden, setHidden] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const start = Date.now();
    const duration = 3600; // يتزامن مع أنيميشن الرسم
    let frame = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const raf = () => {
      const p = Math.min((Date.now() - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setProgress(Math.round(eased * 100));

      if (p < 1) {
        frame = requestAnimationFrame(raf);
      } else {
        // بعد النبض: ابدأ الدخول داخل اللوجو
        timers.push(
          setTimeout(() => {
            setLeaving(true);
            timers.push(setTimeout(() => setHidden(true), 1500));
          }, 700)
        );
      }
    };

    frame = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(frame);
      timers.forEach(clearTimeout);
    };
  }, []);

  if (hidden) return null;

  const done = progress === 100;

  return (
    <div className={`${styles.wrapper} ${leaving ? styles.leaving : ""}`}>
      {/* floating particles */}
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

      {/* tree silhouettes */}
      <svg className={styles.trees} viewBox="0 0 1440 220" preserveAspectRatio="none">
        {TREES.map((t, i) => (
          <polygon
            key={i}
            points={t.points}
            fill={t.fill}
            style={{
              animation: `treeSway ${t.dur}s ease-in-out ${t.delay}s infinite alternate`,
              transformOrigin: `${t.ox}px 220px`,
            }}
          />
        ))}
      </svg>

      {/* clouds */}
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

      {/* brand */}
      <div className={styles.brand}>
        <div className={styles.halo} />
        <div className={`${styles.logoWrap} ${done ? styles.done : ""}`}>
          <Logo />
        </div>
        <p className={styles.tagline}>your idea, built.</p>
      </div>

      {/* progress bar */}
      <div className={styles.progressWrapper}>
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>
        <span className={styles.progressText}>{progress}%</span>
      </div>
    </div>
  );
}

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

const TREES = [
  { points: "200,220 240,120 280,220", fill: "#1a2a1a", dur: 3.5, delay: 0, ox: 240 },
  { points: "320,220 370,80  420,220", fill: "#162216", dur: 4.2, delay: 0.4, ox: 370 },
  { points: "500,220 535,110 570,220", fill: "#1a2a1a", dur: 3.8, delay: 0.8, ox: 535 },
  { points: "680,220 730,60  780,220", fill: "#162216", dur: 4.5, delay: 0.2, ox: 730 },
  { points: "860,220 900,95  940,220", fill: "#1a2a1a", dur: 3.3, delay: 1.0, ox: 900 },
  { points: "1020,220 1060,75 1100,220", fill: "#162216", dur: 4.0, delay: 0.6, ox: 1060 },
  { points: "1180,220 1215,105 1250,220", fill: "#1a2a1a", dur: 3.6, delay: 0.3, ox: 1215 },
  { points: "100,220  130,140 160,220", fill: "#1a2a1a", dur: 4.3, delay: 0.7, ox: 130 },
  { points: "1300,220 1340,90 1380,220", fill: "#162216", dur: 3.9, delay: 1.1, ox: 1340 },
];