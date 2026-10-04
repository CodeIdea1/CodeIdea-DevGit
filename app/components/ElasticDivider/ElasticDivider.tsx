"use client";

import { useEffect, useRef } from "react";
import styles from "./ElasticDivider.module.css";

export default function ElasticDivider() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    let st: any;

    (async () => {
      const { gsap }          = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      const wrap = wrapRef.current;
      const path = pathRef.current;
      if (!wrap || !path) return;

      st = ScrollTrigger.create({
        trigger: wrap,
        start: "top 95%",
        end: "top 10%",
        scrub: 0.8,
        onUpdate: (self) => {
          const p = self.progress;
          // arc starts at -120 (up), snaps through +28 (overshoot), settles at 0
          const bulge = p < 0.6
            ? -120 * (1 - p / 0.6)
            : 28 * Math.sin(((p - 0.6) / 0.4) * Math.PI) * Math.exp(-(p - 0.6) * 6);
          path.setAttribute("d", `M0,80 Q720,${80 + bulge} 1440,80`);
        },
      });
    })();

    return () => st?.kill();
  }, []);

  return (
    <div ref={wrapRef} className={styles.wrapper}>
      <svg
        className={styles.svg}
        viewBox="0 0 1440 160"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          ref={pathRef}
          d="M0,80 Q720,-40 1440,80"
          fill="none"
          stroke="rgba(255,255,255,0.55)"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}
