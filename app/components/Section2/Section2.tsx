"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import NextImage from "next/image";
import styles from "./nextSection.module.css";

gsap.registerPlugin(ScrollTrigger);

const FRAMES_FOLDER = "/hero2-webp";
const DEFAULT_TOTAL_FRAMES = 300;
const BLINK_FRAME = 280;

const CURSOR_IMAGES = ["/code.png", "/dev.webp"];

const getTotalFrames = async (): Promise<number> => {
  try {
    const res = await fetch(`${FRAMES_FOLDER}/manifest.json`);
    if (!res.ok) return DEFAULT_TOTAL_FRAMES;
    const manifest: { total?: number } = await res.json();
    return typeof manifest.total === "number" && manifest.total > 0
      ? manifest.total
      : DEFAULT_TOTAL_FRAMES;
  } catch {
    return DEFAULT_TOTAL_FRAMES;
  }
};

const getFrameSrc = (index: number): string => {
  const frameNumber = (index + 1).toString().padStart(4, "0");
  return `${FRAMES_FOLDER}/hero2-frame-${frameNumber}.jpg`;
};

export default function Hero2Section() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const blinkCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const nextLineRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const releaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [cursorActive, setCursorActive] = useState(false);
  const [cursorVariant, setCursorVariant] = useState(0);

  const frameImages = useRef<HTMLImageElement[]>([]);
  const frameIndex = useRef(0);

  /* ── تحميل الفريمات ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    let cancelled = false;

    getTotalFrames().then((total) => {
      if (cancelled) return;
      const images: HTMLImageElement[] = [];
      let attempted = 0;

      const maybeReady = () => {
        if (attempted >= total && !cancelled) {
          const firstImg = images.find((img) => img.complete);
          if (firstImg) {
            canvas.width = firstImg.naturalWidth;
            canvas.height = firstImg.naturalHeight;
            context.drawImage(firstImg, 0, 0);
          }
          setImagesLoaded(true);
        }
      };

      for (let i = 0; i < total; i++) {
        const img = new Image();
        img.src = getFrameSrc(i);
        images.push(img);
        const onDone = () => { attempted++; maybeReady(); };
        if (img.complete) { onDone(); } else { img.onload = onDone; img.onerror = onDone; }
      }
      frameImages.current = images;
    });

    return () => { cancelled = true; };
  }, []);

  /* ── ScrollTrigger + canvas render ── */
  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    const blinkCanvas = blinkCanvasRef.current;
    if (!section || !canvas || !blinkCanvas || !imagesLoaded) return;

    const context = canvas.getContext("2d");
    if (!context) return;
    let lastDrawn: HTMLImageElement | null = null;

    const render = () => {
      const img = frameImages.current[frameIndex.current];
      const source = img && img.complete ? img : lastDrawn;
      if (source) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(source, 0, 0);
        lastDrawn = source;
      }
    };

    const frameTrigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "+=300%",
      scrub: 0.5,
      pin: true,
      anticipatePin: 1,
      onUpdate: (self) => {
        const totalFrames = frameImages.current.length;
        const newFrame = Math.min(totalFrames - 1, Math.floor(self.progress * totalFrames));
        if (newFrame !== frameIndex.current) { frameIndex.current = newFrame; render(); }

        if (newFrame >= BLINK_FRAME) {
          const bp = Math.min(1, (newFrame - BLINK_FRAME) / 1);
          gsap.to(blinkCanvas, { opacity: bp < 0.5 ? bp * 2 : (1 - bp) * 2, duration: 0.1, ease: "power2.inOut" });
        } else {
          gsap.to(blinkCanvas, { opacity: 0, duration: 0.1 });
        }
      },
    });

    render();
    return () => { frameTrigger.kill(); };
  }, [imagesLoaded]);

  /* ── إعداد السطور: الأولى ظاهرة، الثانية مخفية تحت ── */
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
    if (!lines.length) return;

    setCursorVariant((v) => (v + 1) % CURSOR_IMAGES.length);

    const isFirst = Number(gsap.getProperty(lines[0], "yPercent")) === 0;
    const outgoing = isFirst ? lines : nextLines;
    const incoming = isFirst ? nextLines : lines;

    gsap.set(incoming, { yPercent: 100, xPercent: 0 });

    const outDir = (i: number) => (i % 2 === 0 ? 8 : -8);

    gsap.timeline()
      .to(outgoing, {
        yPercent: 100,
        xPercent: (i) => outDir(i),
        duration: 1.1,
        ease: "expo.inOut",
        stagger: 0.08,
        overwrite: true,
      }, 0)
      .fromTo(
        incoming,
        { yPercent: 100, xPercent: (i) => -outDir(i) },
        { yPercent: 0, xPercent: 0, duration: 1.1, ease: "expo.inOut", stagger: 0.08, overwrite: true },
        0.15
      );
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLHeadingElement>) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleLines(); }
  };

  return (
    <>
      <section ref={sectionRef} className={styles.hero} aria-labelledby="hero2-title">
        <canvas ref={canvasRef} className={styles.backgroundVideo} aria-hidden="true" />
        <canvas ref={blinkCanvasRef} className={styles.blinkOverlay} width="100" height="100" aria-hidden="true" />

        <h2
          id="hero2-title"
          ref={titleRef}
          className={styles.title}
          style={{ cursor: cursorActive ? "none" : "pointer" }}
          onClick={toggleLines}
          onKeyDown={onKeyDown}
          onMouseEnter={() => { setCursorVariant((v) => (v + 1) % CURSOR_IMAGES.length); setCursorActive(true); }}
          onMouseLeave={() => setCursorActive(false)}
          onMouseDown={() => { if (releaseTimerRef.current) clearTimeout(releaseTimerRef.current); }}
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

      {/* مؤشر مخصص */}
      <div
        ref={cursorRef}
        aria-hidden="true"
        className={`${styles.customCursor} ${cursorActive ? styles.customCursorActive : ""}`}
      >
        <NextImage src={CURSOR_IMAGES[cursorVariant]} alt="" width={80} height={cursorVariant === 0 ? 65 : 80} priority />
      </div>
    </>
  );
}
