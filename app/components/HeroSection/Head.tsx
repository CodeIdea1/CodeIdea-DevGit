"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import styles from "./HeroSection.module.css";

type HeadProps = {
  className: string;
  baseRotation?: number;
  upRotation?: number;
  downRotation?: number;
  sensitivity?: number;
};

export default function Head({
  className,
  baseRotation = 4,
  upRotation = 46,
  downRotation = 6,
  sensitivity = 0.15,
}: HeadProps) {
  const rotateWrapperRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLImageElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [barsVisible, setBarsVisible] = useState(false);
  const [barsExiting, setBarsExiting] = useState(false);
  const [burst, setBurst] = useState(false);

  useEffect(() => {
    audioRef.current = new Audio("/music.mp3");
    audioRef.current.loop = true;
    return () => { audioRef.current?.pause(); };
  }, []);

  const handleClick = useCallback((e: React.MouseEvent<HTMLImageElement>) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    if (e.clientX - rect.left < rect.width * 0.5) return;

    if (!playing) {
      audioRef.current?.play().catch(() => {});
      setPlaying(true);
      setBarsVisible(true);
      setBarsExiting(false);
      setBurst(true);
      setTimeout(() => setBurst(false), 700);
    } else {
      audioRef.current?.pause();
      setPlaying(false);
      setBarsExiting(true);
      setTimeout(() => { setBarsVisible(false); setBarsExiting(false); }, 600);
    }
  }, [playing]);

  useEffect(() => {
    const rotateEl = rotateWrapperRef.current;
    if (!rotateEl) return;

    let frame = 0;
    let target = baseRotation;
    let current = baseRotation;
    let moving = false;

    const onPointerMove = (e: PointerEvent) => {
      const progress = -((e.clientY / window.innerHeight) * 2 - 1);
      target = baseRotation + progress * (progress >= 0 ? downRotation : upRotation);
      if (!moving) { moving = true; animate(); }
    };

    const onPointerLeave = () => { target = baseRotation; };

    const animate = () => {
      current += (target - current) * sensitivity;
      rotateEl.style.transform = `rotate(${current.toFixed(2)}deg)`;
      if (Math.abs(target - current) > 0.01) {
        frame = requestAnimationFrame(animate);
      } else {
        moving = false;
      }
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("mouseleave", onPointerLeave);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("mouseleave", onPointerLeave);
      cancelAnimationFrame(frame);
    };
  }, [baseRotation, upRotation, downRotation, sensitivity]);

  return (
    <div className={styles.headWrapper}>
      {barsVisible && (
        <>
          <span className={`${styles.bar} ${styles.bar1} ${barsExiting ? styles.barExit : styles.barEnter}`} />
          <span className={`${styles.bar} ${styles.bar2} ${barsExiting ? styles.barExit : styles.barEnter}`} />
          <span className={`${styles.bar} ${styles.bar3} ${barsExiting ? styles.barExit : styles.barEnter}`} />
        </>
      )}
      <div ref={rotateWrapperRef} className={styles.rotateWrapper}>
        <div className={`${styles.bobWrapper} ${playing ? styles.active : ""}`}>
          {burst && (
            <>
              <span className={`${styles.wave} ${styles.wave1}`} />
              <span className={`${styles.wave} ${styles.wave2}`} />
              <span className={`${styles.wave} ${styles.wave3}`} />
            </>
          )}
          {playing && <div className={styles.ledDot} />}
          <Image
            ref={headRef}
            src="/head.webp"
            alt="Head"
            width={302}
            height={208}
            placeholder="empty"
            className={className}
            onClick={handleClick}
            style={{ cursor: "pointer", pointerEvents: "all", background: "none" }}
          />
        </div>
      </div>
    </div>
  );
}
