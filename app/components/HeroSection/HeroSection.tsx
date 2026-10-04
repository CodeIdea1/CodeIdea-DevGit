"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import Head from "./Head";
import styles from "./HeroSection.module.css";

const STEPS = [
  { id: "layout", src: "/yy.webp",   nextScreen: "/center-screen-layout.webp",                    label: "Layout",     arrowDir: "right" },
  { id: "texts",  src: "/text.webp",  nextScreen: "/center-screen-layout-text.webp",                label: "Your Text",  arrowDir: "right"  },
  { id: "img",    src: "/img.webp",   nextScreen: "/center-screen-layout-text-img2.webp",            label: "Your Image", arrowDir: "right" },
  { id: "card",   src: "/card.webp",  nextScreen: "/center-screen-layout-text-img-card2.webp",      label: "Card",       arrowDir: "right" },
  { id: "logo",   src: "/logo.webp",  nextScreen: "/center-screen-layout-text-img-card-logo1.webp", label: "Your Logo",  arrowDir: "left"  },
];

const ORBIT_POSITIONS = [
  { top: 85, left: 28 },
  { top: 20, left: 58 },
  { top: 45, left: 68 },
  { top: 68, left: 55 },
  { top: 68, left: 28 },
  { top: 45, left: 18 },
];

type FloaterPos = { top: number; left: number; spinning: boolean };
type FlyState   = { src: string; x: number; y: number; dx: number; dy: number };
type Tilt       = { rx: number; ry: number; scale: number };

export default function HeroSection() {
  const [floaterPositions, setFloaterPositions] = useState<FloaterPos[]>([
    { top: ORBIT_POSITIONS[0].top, left: ORBIT_POSITIONS[0].left, spinning: false },
    { top: ORBIT_POSITIONS[3].top, left: ORBIT_POSITIONS[3].left, spinning: false },
  ]);
  const refs: Record<string, React.RefObject<HTMLImageElement | null>> = {
    layout: useRef<HTMLImageElement>(null),
    texts:  useRef<HTMLImageElement>(null),
    img:    useRef<HTMLImageElement>(null),
    card:   useRef<HTMLImageElement>(null),
    logo:   useRef<HTMLImageElement>(null),
  };
  const screenRef  = useRef<HTMLImageElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const [screenSrc,     setScreenSrc]     = useState("/first-screen.webp");
  const [screenAnim,    setScreenAnim]    = useState(false);
  const [showFlash,     setShowFlash]     = useState(false);
  const [flyState,      setFlyState]      = useState<FlyState | null>(null);
  const [step,          setStep]          = useState(0);
  const [done,          setDone]          = useState<Set<string>>(new Set());
  const [tilts,         setTilts]         = useState<Record<string, Tilt>>(
    Object.fromEntries(STEPS.map(s => [s.id, { rx: 0, ry: 0, scale: 1 }]))
  );

  function calcTilt(e: React.MouseEvent<HTMLImageElement>): Tilt {
    const el = e.currentTarget;
    if (!el) return { rx: 0, ry: 0, scale: 1 };
    const rect = el.getBoundingClientRect();
    const dx = (e.clientX - (rect.left + rect.width  / 2)) / (rect.width  / 2);
    const dy = (e.clientY - (rect.top  + rect.height / 2)) / (rect.height / 2);
    return { rx: dy * -12, ry: dx * 12, scale: 1.06 };
  }

  function tiltStyle(id: string, flying: boolean): React.CSSProperties {
    const t = tilts[id];
    return {
      transform: `perspective(800px) rotateX(${t.rx}deg) rotateY(${t.ry}deg) scale(${t.scale})`,
      transition: "transform 0.15s ease-out, opacity 0.3s ease",
      opacity: t.scale > 1 ? 1 : 0.9,
      visibility: flying ? "hidden" : "visible",
      ...(id === "layout" ? { filter: "brightness(1.05) saturate(0.85)" } : {}),
    };
  }

  function spinFloaters() {
    setFloaterPositions(prev => prev.map(f => ({ ...f, spinning: true })));
    setTimeout(() => {
      const used: number[] = [];
      setFloaterPositions(prev => prev.map(() => {
        let idx: number;
        do { idx = Math.floor(Math.random() * ORBIT_POSITIONS.length); } while (used.includes(idx));
        used.push(idx);
        return { top: ORBIT_POSITIONS[idx].top, left: ORBIT_POSITIONS[idx].left, spinning: false };
      }));
    }, 600);
  }

  function fly(id: string, src: string, nextScreen: string) {
    const ref = refs[id];
    if (!ref.current || !screenRef.current || !sectionRef.current) return;

    if (id === "layout") {

      const section = sectionRef.current.getBoundingClientRect();
      const el      = ref.current.getBoundingClientRect();
      const screen  = screenRef.current.getBoundingClientRect();

      setFlyState({
        src,
        x:  el.left - section.left + el.width  / 2,
        y:  el.top  - section.top  + el.height / 2,
        dx: (screen.left + screen.width  / 2) - (el.left + el.width  / 2),
        dy: (screen.top  + screen.height / 2) - (el.top  + el.height / 2),
      });

      setTimeout(() => {
        setFlyState(null);
        setShowFlash(true);
        setDone(prev => new Set(prev).add(id));
        setStep(prev => prev + 1);
        spinFloaters();
        setTimeout(() => {
          setShowFlash(false);
          setScreenSrc(nextScreen);
          setScreenAnim(true);
          setTimeout(() => setScreenAnim(false), 800);
        }, 300);
      }, 900);
      return;
    }

    const section = sectionRef.current.getBoundingClientRect();
    const el      = ref.current.getBoundingClientRect();
    const screen  = screenRef.current.getBoundingClientRect();

    setFlyState({
      src,
      x:  el.left - section.left + el.width  / 2,
      y:  el.top  - section.top  + el.height / 2,
      dx: (screen.left + screen.width  / 2) - (el.left + el.width  / 2),
      dy: (screen.top  + screen.height / 2) - (el.top  + el.height / 2),
    });

    setTimeout(() => {
      setFlyState(null);
      setShowFlash(true);
      setDone(prev => new Set(prev).add(id));
      setStep(prev => prev + 1);
      spinFloaters();
      setTimeout(() => {
        setShowFlash(false);
        setScreenSrc(nextScreen);
        setScreenAnim(true);
        setTimeout(() => setScreenAnim(false), 800);
      }, 300);
    }, 900);
  }

  const stepCls: Record<string, string> = {
    layout: styles.imgLayout,
    texts:  styles.imgTexts,
    img:    styles.imgMain,
    card:   styles.imgCard,
    logo:   styles.screenLeft,
  };

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.glassOverlay} />

      <div className={styles.cloudTrack}>
        <img src="/cloud-slide.webp" alt="" className={styles.cloudSlide} />
        <img src="/cloud-slide.webp" alt="" className={styles.cloudSlide} />
      </div>

      <img src="/cloud3.webp" alt="" className={styles.ccBg} />

      <div className={styles.screenLabel}>
        <span className={styles.hintText}>
          {"your idea".split("").map((char, ci) => (
            <span key={ci} className={styles.hintChar} style={{ animationDelay: `${ci * 0.06}s` }}>
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </span>
        <img src="/arrow2.webp" alt="" className={styles.screenLabelArrow} />
      </div>

      <img
        key={screenSrc}
        ref={screenRef}
        src={screenSrc}
        alt="Screen"
        className={`${styles.screenCenter}${screenAnim ? " " + styles.screenChanged : ""}`}
      />

      {showFlash && <div className={styles.screenFlash} />}

      {flyState && (
        <>
          <style>{`
            @keyframes __fly {
              0%   { opacity:1; transform: translate(-50%,-50%) scale(1) rotate(2deg); }
              50%  { opacity:1; transform: translate(calc(-50% + ${flyState.dx * 0.6}px), calc(-50% + ${flyState.dy * 0.6}px)) scale(0.75) rotate(-8deg); }
              85%  { opacity:0.5; transform: translate(calc(-50% + ${flyState.dx}px), calc(-50% + ${flyState.dy}px)) scale(0.25) rotate(-3deg); }
              100% { opacity:0; transform: translate(calc(-50% + ${flyState.dx}px), calc(-50% + ${flyState.dy}px)) scale(0) rotate(0deg); }
            }
          `}</style>
          <img
            src={flyState.src}
            alt=""
            style={{
              position: "absolute",
              left: flyState.x,
              top: flyState.y,
              maxWidth: "11%",
              width: "auto",
              height: "auto",
              zIndex: 30,
              pointerEvents: "none",
              filter: flyState.src === "/yy.webp" ? "brightness(1.05) saturate(0.85)" : undefined,
              animation: "__fly 0.9s cubic-bezier(0.4,0,0.2,1) forwards",
            }}
          />
        </>
      )}

      {(["coding.webp", "cursor.webp"] as const).map((src, i) => (
        <img
          key={src}
          src={`/${src}`}
          alt=""
          className={`${styles.floater} ${floaterPositions[i].spinning ? styles.floaterSpin : ""}`}
          style={{
            top:  `${floaterPositions[i].top}%`,
            left: `${floaterPositions[i].left}%`,
            transition: floaterPositions[i].spinning
              ? "none"
              : "top 0.7s cubic-bezier(0.34,1.56,0.64,1), left 0.7s cubic-bezier(0.34,1.56,0.64,1)",
          }}
        />
      ))}

      {STEPS.map(({ id, src, nextScreen, label, arrowDir }, i) => {
        if (done.has(id)) return null;
        const isActive = i === step;
        return (
          <div key={id} className={`${styles.stepWrapper} ${id === "layout" ? styles.stepWrapperBehind : ""} ${stepCls[id]}`}>
            <div className={`${styles.hint} ${id === "layout" || id === "texts" ? styles.hintReverseRight : arrowDir === "left" ? styles.hintLeft : styles.hintRight} ${isActive ? styles.hintActive : styles.hintIdle}`}>
              <span className={styles.hintText}>
                {label.split("").map((char, ci) => (
                  <span key={ci} className={styles.hintChar} style={{ animationDelay: `${ci * 0.06}s` }}>
                    {char === " " ? "\u00A0" : char}
                  </span>
                ))}
              </span>
              <span className={styles.hintArrow}>
                <img src={id === "layout" || id === "texts" ? "/arrow-left.webp" : "/arrow2.webp"} alt="" className={`${styles.arrowImg} ${arrowDir === "left" ? styles.arrowLeft : ""} ${isActive ? styles.arrowActive : ""}`} />
              </span>
            </div>
            <img
              ref={refs[id] as React.RefObject<HTMLImageElement>}
              src={src}
              alt={label}
              className={styles.stepImg}
              style={tiltStyle(id, flyState?.src === src)}
              onMouseMove={isActive ? e => setTilts(p => ({ ...p, [id]: calcTilt(e) })) : undefined}
              onMouseLeave={isActive ? () => setTilts(p => ({ ...p, [id]: { rx: 0, ry: 0, scale: 1 } })) : undefined}
              onClick={() => {
                if (!isActive || flyState) return;
                setTilts(p => ({ ...p, [id]: { rx: 0, ry: 0, scale: 1 } }));
                fly(id, src, nextScreen);
              }}
            />
          </div>
        );
      })}

      <Image src="/back1.webp" alt="Hero" width={0} height={0} sizes="100vw" className={styles.heroBottom} />

      <div className={styles.content}>
        <div className={styles.scene}>
          <Image src="/tree1.webp"  alt="Tree 1" width={1211} height={1299} className={`${styles.tree} ${styles.tree1}`} />
          <Image src="/tree2.webp"  alt="Tree 2" width={1422} height={1106} className={`${styles.tree} ${styles.tree2}`} />
          <Image src="/tree3.webp"  alt="Tree 3" width={1319} height={1193} className={`${styles.tree} ${styles.tree3}`} />
          <Image src="/rock-1.webp" alt="Rock"   width={1530} height={1028} className={styles.rockImage} />
          <Image src="/rock22.webp" alt="Rock 2" width={1530} height={1028} className={styles.rockImage2} />
        </div>
      </div>

      <div className={styles.personWrapper}>
        <Image src="/person1.webp" alt="Person" width={1145} height={1374} className={styles.personImage} />
        <Head className={styles.headImage} />
      </div>
    </section>
  );
}
