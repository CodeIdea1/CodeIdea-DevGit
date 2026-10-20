"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./Section3.module.css";

const IMAGES = [
  { id: "rt", src: "/rock22.webp",   cls: "imgRightTop",    dir: "right"  },
  { id: "rb", src: "/tree1.webp",    cls: "imgRightBottom", dir: "right"  },
  { id: "lt", src: "/tree2.webp",    cls: "imgLeftTop",     dir: "left"   },
  { id: "lb", src: "/tree3.webp",    cls: "imgLeftBottom",  dir: "left"   },
  { id: "tp", src: "/cloud3.webp",   cls: "imgTop",         dir: "top"    },
  { id: "bt", src: "/person.webp",   cls: "imgBottom",      dir: "bottom" },
] as const;

const OFFSETS: Record<string, { x: number; y: number }> = {
  right:  { x: 260, y: 0 },
  left:   { x: -260, y: 0 },
  top:    { x: 0, y: -220 },
  bottom: { x: 0, y: 220 },
};

export default function Section3() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const growWrapRef = useRef<HTMLDivElement>(null);
  const growImgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const section = sectionRef.current;
      if (!section) return;

      gsap.fromTo(
        contentRef.current,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          ease: "power2.out",
          scrollTrigger: { trigger: section, start: "top 78%", end: "top 40%", scrub: 1 },
        }
      );

      section.querySelectorAll<HTMLElement>(`.${styles.imgWrap}`).forEach((el) => {
        if (el === growWrapRef.current) return;
        const dir = el.dataset.dir ?? "right";
        const from = OFFSETS[dir] ?? OFFSETS.right;
        gsap.fromTo(
          el,
          { x: from.x, y: from.y, opacity: 0 },
          {
            x: 0,
            y: 0,
            opacity: 1,
            ease: "power2.out",
            scrollTrigger: { trigger: section, start: "top 85%", end: "top 25%", scrub: 1 },
          }
        );
      });

      const growWrap = growWrapRef.current;
      const growImg = growImgRef.current;
      const s4 = document.getElementById("section4");
      if (growWrap && growImg && s4) {
        const coverScale =
          Math.max(window.innerWidth, window.innerHeight) / growWrap.offsetWidth * 1.04;
        gsap.timeline({
          scrollTrigger: {
            trigger: growWrap,
            start: "center center",
            endTrigger: s4,
            end: "bottom bottom",
            pin: growWrap,
            pinSpacing: false,
            scrub: 1,
          },
        }).to(growImg, { scale: coverScale, borderRadius: "0px", ease: "none" });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className={styles.section} aria-labelledby="section3-title">
      {IMAGES.map((img) => (
        <div
          key={img.id}
          data-dir={img.dir}
          ref={img.id === "bt" ? growWrapRef : undefined}
          className={`${styles.imgWrap} ${styles[img.cls]}`}
        >
          <Image
            src={img.src}
            alt=""
            width={600}
            height={600}
            ref={img.id === "bt" ? growImgRef : undefined}
            className={styles.img}
          />
        </div>
      ))}

      <div ref={contentRef} className={styles.content}>
        <h2 id="section3-title" className={styles.title}>
          LET&apos;S BUILD SOMETHING GREAT TOGETHER
        </h2>
        <p className={styles.subtitle}>your idea, our craft</p>
        <div className={styles.buttons}>
          <a href="#" className={`${styles.btn} ${styles.btnPrimary}`}>Get Started</a>
          <a href="#" className={`${styles.btn} ${styles.btnGhost}`}>Learn More</a>
        </div>
      </div>
    </section>
  );
}
