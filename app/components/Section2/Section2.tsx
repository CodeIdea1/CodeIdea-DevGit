"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import NextImage from "next/image";
import styles from "./nextSection.module.css";

const CURSOR_IMAGES = ["/code.png", "/dev.webp"];

export default function Hero2Section() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const shadowRef = useRef<HTMLImageElement>(null);
  const lineRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const nextLineRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const [cursorActive, setCursorActive] = useState(false);
  const [cursorVariant, setCursorVariant] = useState(0);

  /* ── إعداد السطور ── */
  useEffect(() => {
    const lines = lineRefs.current.filter(Boolean) as HTMLSpanElement[];
    const nextLines = nextLineRefs.current.filter(Boolean) as HTMLSpanElement[];
    if (lines.length) gsap.set(lines, { yPercent: 0 });
    if (nextLines.length) gsap.set(nextLines, { yPercent: 100 });
  }, []);

  /* ── مؤشر مخصص ── */
  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;
    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const current = { x: target.x, y: target.y };
    let tilt = 0, zoom = 1, frame = 0, idleUntil = 0;

    const draw = () => {
      const prevX = current.x;
      current.x += (target.x - current.x) * 0.11;
      current.y += (target.y - current.y) * 0.11;
      const vx = current.x - prevX;
      const speed = Math.hypot(vx, current.y - current.y);
      tilt += (Math.min(Math.max(vx * 1.2, -22), 22) - tilt) * 0.08;
      zoom += (1 + Math.min(speed * 0.0045, 0.28) - zoom) * 0.06;
      cursor.style.transform = `translate3d(calc(${current.x}px - 50%), calc(${current.y}px - 50%), 0) rotate(${tilt}deg) scale(${zoom})`;
      const settled = Math.abs(target.x - current.x) < 0.1 && Math.abs(target.y - current.y) < 0.1 && Math.abs(1 - zoom) < 0.001 && Math.abs(tilt) < 0.05;
      if (settled) { idleUntil = performance.now() + 400; frame = 0; return; }
      frame = requestAnimationFrame(draw);
    };

    const onMove = (e: MouseEvent) => {
      target.x = e.clientX; target.y = e.clientY;
      if (!frame && performance.now() >= idleUntil) frame = requestAnimationFrame(draw);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    frame = requestAnimationFrame(draw);
    return () => { window.removeEventListener("mousemove", onMove); cancelAnimationFrame(frame); };
  }, []);

  /* ── تبديل السطور عند الضغط ── */
  const toggleLines = () => {
    const lines = lineRefs.current.filter(Boolean) as HTMLSpanElement[];
    const nextLines = nextLineRefs.current.filter(Boolean) as HTMLSpanElement[];
    const img = imgRef.current;
    const shadow = shadowRef.current;
    if (!lines.length || !img || !shadow) return;

    new Audio("/click3.wav").play().catch(() => {});
    const isFirst = Number(gsap.getProperty(lines[0], "yPercent")) === 0;
    const outgoing = isFirst ? lines : nextLines;
    const incoming = isFirst ? nextLines : lines;
    const outDir = (i: number) => (i % 2 === 0 ? 8 : -8);

    gsap.timeline()
      .to(shadow, { opacity: 0, filter: "brightness(0) opacity(0) blur(0px)", x: -4, y: -5, duration: 0.22, ease: "power2.out" }, 0)
      .to(img, { x: 34, y: 44, duration: 0.22, ease: "power2.out" }, 0)
      .to(img, { scale: 1.15, duration: 0.12, ease: "power2.in" })
      .to(img, { scale: 1.15, duration: 0.35 })
      .to(img, { scale: 0, duration: 0.18, ease: "power2.in" })
      .call(() => setCursorVariant((v) => (v + 1) % CURSOR_IMAGES.length))
      .set(img, { scale: 0 })
      .to(img, { scale: 1.15, duration: 0.22, ease: "power2.out" })
      .to(img, { scale: 1.15, duration: 0.4 })
      .to(img, { scale: 0.85, duration: 0.08, ease: "power2.in" })
      .to(img, { scale: 1, x: 0, y: 0, duration: 0.6, ease: "power3.out" })
      .to(shadow, { x: 0, y: 0, opacity: 1, filter: "brightness(0) opacity(0.3) blur(0.8px)", duration: 0.3 }, "-=0.3")
      .call(() => {
        gsap.set(incoming, { yPercent: 100, xPercent: 0 });
        gsap.timeline()
          .to(outgoing, { yPercent: 100, xPercent: (i) => outDir(i), duration: 1.1, ease: "expo.inOut", stagger: 0.08, overwrite: true }, 0)
          .fromTo(incoming, { yPercent: 100, xPercent: (i) => -outDir(i) }, { yPercent: 0, xPercent: 0, duration: 1.1, ease: "expo.inOut", stagger: 0.08, overwrite: true }, 0.15);
      }, undefined, 0.1);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLHeadingElement>) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleLines(); }
  };

  return (
    <>
      <section className={styles.hero} aria-labelledby="hero2-title">
        <h2
          id="hero2-title"
          className={styles.title}
          style={{ cursor: cursorActive ? "none" : "pointer" }}
          onClick={toggleLines}
          onKeyDown={onKeyDown}
          onMouseEnter={() => { setCursorVariant((v) => (v + 1) % CURSOR_IMAGES.length); setCursorActive(true); }}
          onMouseLeave={() => setCursorActive(false)}
          role="button"
          tabIndex={0}
          aria-label="LET'S CREATE A REMARKABLE JOURNEY — YOUR GATEWAY TO EXCITEMENT STARTS HERE"
        >
          <span className={styles.lineMask}>
            <span ref={(el) => { lineRefs.current[0] = el; }} className={styles.line}>LET&apos;S CREATE</span>
            <span ref={(el) => { nextLineRefs.current[0] = el; }} className={styles.line} aria-hidden="true">YOUR GATEWAY</span>
          </span>
          <span className={styles.lineMask}>
            <span ref={(el) => { lineRefs.current[1] = el; }} className={styles.line}>A REMARKABLE</span>
            <span ref={(el) => { nextLineRefs.current[1] = el; }} className={styles.line} aria-hidden="true">TO EXCITEMENT</span>
          </span>
          <span className={styles.lineMask}>
            <span ref={(el) => { lineRefs.current[2] = el; }} className={styles.line}>JOURNEY</span>
            <span ref={(el) => { nextLineRefs.current[2] = el; }} className={styles.line} aria-hidden="true">STARTS HERE!</span>
          </span>
        </h2>
      </section>

      <div
        ref={cursorRef}
        aria-hidden="true"
        className={`${styles.customCursor} ${cursorActive ? styles.customCursorActive : ""}`}
      >
        <NextImage ref={shadowRef} className={styles.customCursorShadowImg} src={CURSOR_IMAGES[cursorVariant]} alt="" width={80} height={cursorVariant === 0 ? 65 : 80} aria-hidden="true" />
        <NextImage ref={imgRef} className={styles.customCursorImg} src={CURSOR_IMAGES[cursorVariant]} alt="" width={80} height={cursorVariant === 0 ? 65 : 80} priority />
      </div>
    </>
  );
}
