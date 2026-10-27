"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./Section3.module.css";

const IMAGES = [
  { id: "rt", src: "/web-3.png", cls: "imgRightTop",    dir: "right"        },
  { id: "rb", src: "/cof.png", cls: "imgRightBottom", dir: "right_bottom" },
  { id: "lt", src: "/web-3.png", cls: "imgLeftTop",     dir: "left"         },
  { id: "lb", src: "/gg.png", cls: "imgLeftBottom",  dir: "left_bottom"  },
  { id: "tp", src: "/gg.png", cls: "imgTop",         dir: "top"          },
  { id: "bt", src: "/ccll.png", cls: "imgBottom",      dir: "bottom"       },
] as const;

const OFFSETS: Record<string, { x: number; y: number }> = {
  right:        { x: 160,  y: 0    },
  left:         { x: -160, y: 0    },
  right_bottom: { x: 160,  y: 160  },
  left_bottom:  { x: -160, y: 160  },
  top:          { x: 0,    y: -180 },
  bottom:       { x: 0,    y: 35   },
};

/* حالة البداية لأنيميشن الـ clip عند دخول الصور الجانبية (من جهة دخولها) */
const SIDE_CLIP_FROM: Record<string, string> = {
  right:        "inset(0% 0% 0% 100%)",
  right_bottom: "inset(0% 0% 0% 100%)",
  left:         "inset(0% 100% 0% 0%)",
  left_bottom:  "inset(0% 100% 0% 0%)",
  top:          "inset(0% 0% 100% 0%)",
};

/* ── المشاريع ──
   name     = الاسم في البادج وفي العرض
   accent   = لون المشروع (دايرة الفتح والتفاصيل)
   variants = المواقع التابعة للمشروع (القهوة والهودي فيهم موقعين، والنظارات موقع واحد)
              لو أكتر من واحد، كل ضغطة على الصورة بتفتح اللي بعده بالتبادل */
interface Project {
  id: string;
  name: string;
  src: string;
  accent: string;
  tagline: string;
  variants: { label: string; url: string }[];
}

const PROJECTS: Project[] = [
  {
    id: "coffee",
    name: "Coffee",
    src: "/coffee.webp",
    accent: "#c89b6d",
    tagline: "Warm, tactile storefronts for coffee brands, built to make every scroll smell a little better.",
    variants: [
      { label: "Caffinity",  url: "https://caffinity-omega.vercel.app/"  },
      { label: "VOG Coffee", url: "https://vog-coffee-fef9.vercel.app/" },
    ],
  },
  {
    id: "hoodie",
    name: "Hoodie",
    src: "/hoodie.webp",
    accent: "#ff5a36",
    tagline: "A streetwear experience with loud type, fast motion and a checkout that keeps up.",
    variants: [
      { label: "Hype Hood", url: "https://hype-hood.vercel.app/"   },
      { label: "Hoodie",    url: "https://hoodie-theta.vercel.app/" },
    ],
  },
  {
    id: "glasses",
    name: "Glasses",
    src: "/glasses.webp",
    accent: "#5b8cff",
    tagline: "Clean, precise eyewear shopping where every frame gets the spotlight it deserves.",
    variants: [{ label: "Vision Craft", url: "https://vision-craft-pi.vercel.app/" }],
  },
];

/* ── محتوى الأوفرلاي (غيّر النصوص براحتك) ── */
const TITLE_LINES = ["WE CRAFT DIGITAL", "EXPERIENCES"];

const DESC_LINES = [
  "We design and build fast, modern websites",
  "that tell your story and turn visitors",
  "into loyal customers, from idea to launch.",
];

const STATS = [
  { value: "120+", label: "Projects delivered" },
  { value: "8",    label: "Years of experience" },
  { value: "60+",  label: "Happy clients"       },
  { value: "99%",  label: "Client satisfaction" },
];

/* ── ضبط حركة الكونتينر مع السكرول ──
   IMG_WIDTH_RATIO             : عرض الصورة بالنسبة لعرض الكونتينر النهائي (36%)
   IMG_TOP_START / IMG_TOP_END : مكان مركز الصورة داخل الكونتينر (بالنسبة لارتفاعه) */
const IMG_WIDTH_RATIO = 0.36;
const IMG_TOP_START   = 0.36;
const IMG_TOP_END     = 0.66;

/* انسيابية نزول وتكبير الكونتينر: كل ما القيمة أقل = أسرع وأقرب للسكرول */
const CONTAINER_SCRUB = 0.25;

/* مدة وإيزي انتقال صور المشاريع أثناء التمرير */
const CLIP_DURATION = 2.4;
const CLIP_EASE     = "power2.inOut";

/* ── التثبيت (Pin) بعد ما الكونتينر يكبر ──
   PIN_VH_PER_PROJECT : مسافة السكرول (بوحدة ارتفاع الشاشة) لكل مشروع
                        المسافة الكلية = عدد المشاريع × القيمة دي × ارتفاع الشاشة */
const PIN_VH_PER_PROJECT = 0.8;

const hostOf = (url: string) => {
  try { return new URL(url).host; } catch { return url; }
};

export default function Section3() {
  const sectionRef    = useRef<HTMLElement>(null);
  const contentRef    = useRef<HTMLDivElement>(null);
  const growWrapRef   = useRef<HTMLDivElement>(null);
  const pinLayerRef   = useRef<HTMLDivElement>(null);
  const coffeeWrapRef = useRef<HTMLDivElement>(null);
  const overlayRef    = useRef<HTMLDivElement>(null);
  const badgeRef      = useRef<HTMLDivElement>(null);
  const badgeNameRef  = useRef<HTMLSpanElement>(null);

  /* ── عرض المشروع (Viewer) ── */
  const viewerRef      = useRef<HTMLDivElement>(null);
  const stageRef       = useRef<HTMLDivElement>(null);
  const originRef      = useRef({ x: 0, y: 0 });
  const shownRef       = useRef(false);
  const closingRef     = useRef(false);
  const viewerOpenRef  = useRef(false);
  const clickCountRef  = useRef<Record<string, number>>({});
  const [viewer, setViewer] = useState<{ p: number; v: number } | null>(null);
  const [loaded, setLoaded] = useState(false);

  /* نسخة حديثة من الحالة للاستخدام جوه الـ event listeners */
  const viewerStateRef = useRef(viewer);
  viewerStateRef.current = viewer;

  const closeViewer = () => {
    const root  = viewerRef.current;
    const stage = stageRef.current;
    if (!root || !stage || closingRef.current) return;
    closingRef.current = true;
    const { x, y } = originRef.current;
    const hide = `circle(0px at ${x}px ${y}px)`;

    gsap
      .timeline({
        onComplete: () => {
          closingRef.current = false;
          shownRef.current = false;
          setViewer(null);
        },
      })
      .to(
        root.querySelectorAll("[data-v='fade'], [data-v='chrome']"),
        { opacity: 0, y: -18, duration: 0.3, stagger: 0.03, ease: "power2.in" },
        0
      )
      .to(stage, { clipPath: hide, duration: 0.75, ease: "power3.inOut" }, 0.1)
      .to(root,  { clipPath: hide, duration: 0.75, ease: "power3.inOut" }, 0.26);
  };

  /* اختيار موقع من مواقع نفس المشروع */
  const selectVariant = (v: number) => {
    const s = viewerStateRef.current;
    if (!s || s.v === v) return;
    setLoaded(false);
    setViewer({ ...s, v });
  };

  /* الأسهم في الكيبورد بتبدّل بين موقعي نفس المشروع فقط */
  const cycleVariant = (d: number) => {
    const s = viewerStateRef.current;
    if (!s) return;
    const n = PROJECTS[s.p].variants.length;
    if (n < 2) return;
    selectVariant((s.v + d + n) % n);
  };

  /* قفل السكرول + أزرار الكيبورد أثناء فتح العرض */
  useEffect(() => {
    viewerOpenRef.current = viewer !== null;
    if (viewer === null) return;

    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape")     closeViewer();
      if (e.key === "ArrowRight") cycleVariant(1);
      if (e.key === "ArrowLeft")  cycleVariant(-1);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.documentElement.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewer === null]);

  /* أنيميشن فتح العرض + دخول المحتوى */
  useEffect(() => {
    if (!viewer) return;
    const root  = viewerRef.current;
    const stage = stageRef.current;
    if (!root || !stage) return;

    const q = (sel: string) => root.querySelectorAll<HTMLElement>(sel);
    let t = 0;

    // الفتح الأول: دايرتين بيتوسعوا من مكان الضغطة
    if (!shownRef.current) {
      shownRef.current = true;
      const { x, y } = originRef.current;
      const r = Math.hypot(window.innerWidth, window.innerHeight) * 1.05;
      const from = `circle(0px at ${x}px ${y}px)`;
      const to   = `circle(${r}px at ${x}px ${y}px)`;

      gsap.fromTo(root,  { clipPath: from }, { clipPath: to, duration: 1.05, ease: "power3.inOut" });
      gsap.fromTo(stage, { clipPath: from }, { clipPath: to, duration: 1.05, ease: "power3.inOut", delay: 0.16 });

      gsap.fromTo(
        q("[data-v='chrome']"),
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.08, ease: "power3.out", delay: 0.85 }
      );
      t = 0.7;
    }

    const tl = gsap.timeline();
    tl
      // الاسم: حرف حرف من تحت القناع
      .fromTo(
        q("[data-v='char']"),
        { yPercent: 115, rotate: 6 },
        { yPercent: 0, rotate: 0, duration: 0.9, stagger: 0.05, ease: "power4.out" },
        t
      )
      // باقي النصوص والأزرار
      .fromTo(
        q("[data-v='fade']"),
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.08, ease: "power3.out" },
        t + 0.15
      )
      // إطار المتصفح يطلع بإحساس 3D
      .fromTo(
        q("[data-v='frame']"),
        { y: 90, rotateX: 14, scale: 0.92, opacity: 0, transformPerspective: 1200 },
        { y: 0, rotateX: 0, scale: 1, opacity: 1, duration: 1.1, ease: "expo.out" },
        t
      )
      // الحرف الكبير في الخلفية
      .fromTo(
        q("[data-v='ghost']"),
        { xPercent: -8, opacity: 0 },
        { xPercent: 0, opacity: 0.07, duration: 1.2, ease: "power3.out" },
        t
      );

    return () => {
      tl.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewer?.p, viewer === null]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    // ما نعملش refresh لما شريط العنوان في الموبايل يطلع وينزل (بيسبب قفزات)
    ScrollTrigger.config({ ignoreMobileResize: true });

    const ctx = gsap.context(() => {
      const section    = sectionRef.current;
      const growWrap   = growWrapRef.current;
      const coffeeWrap = coffeeWrapRef.current;
      const overlay    = overlayRef.current;
      const badge      = badgeRef.current;
      const badgeName  = badgeNameRef.current;
      const pinLayer   = pinLayerRef.current;
      if (!section || !growWrap) return;

      /* بتتعمل جوه بلوك التفاعل، وبيناديها الـ pin عشان يبدّل الصورة مع السكرول */
      let setScrollMode: ((on: boolean, idx: number) => void) | null = null;
      let setOverlayVisibility: (show: boolean) => void = () => {};
      let overlayIsVisible = false;
      let overlayTimeline: gsap.core.Timeline | null = null;

      /* ════════════════════════════════════════════
         1) باقي الصور تدخل من الجوانب
         ════════════════════════════════════════════ */
      section.querySelectorAll<HTMLElement>(`.${styles.imgWrap}`).forEach((el) => {
        if (el === growWrap) return;
        const dir  = el.dataset.dir ?? "right";
        const from = OFFSETS[dir] ?? OFFSETS.right;
        gsap.fromTo(
          el,
          { x: from.x, y: from.y, clipPath: SIDE_CLIP_FROM[dir] ?? SIDE_CLIP_FROM.right },
          {
            x: 0,
            y: 0,
            clipPath: "inset(0% 0% 0% 0%)",
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
              start: "top 100%",
              end: "bottom 60%",
              scrub: 1,
            },
          }
        );
      });

      /* ════════════════════════════════════════════
         2) العنوان يظهر
         ════════════════════════════════════════════ */
      gsap.fromTo(
        contentRef.current,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 78%",
            end: "top 40%",
            scrub: 1,
          },
        }
      );

      /* ════════════════════════════════════════════
         3) الكونتينر يتحرك ويكبر ليغطي السيكشن الرابع باستخدام transform فقط
         ════════════════════════════════════════════ */
      const nextSection = section.nextElementSibling;
      const s4 = nextSection instanceof HTMLElement && nextSection.id === "section4"
        ? nextSection
        : null;

      if (s4) {
        /* ── قياسات الكونتينر (الحجم الأصلي من الـ CSS + حجم السيكشن الرابع) ──
           بتتعاد مع كل refresh (تغيير حجم الشاشة)، ومن غير ما نتأثر بأي inline style
           حطّه GSAP أثناء الحركة. */
        const imgEls = Array.from(
          growWrap.querySelectorAll<HTMLElement>(`.${styles.coffeeOverlay} .${styles.img}`)
        );
        const backdropImg = growWrap.querySelector<HTMLElement>(`.${styles.containerImage}`);
        const dims = { w0: 1, h0: 1, w1: 1, h1: 1, x: 0, y: 0 };

        const measure = () => {
          const transform = growWrap.style.transform;
          growWrap.style.transform = "none";
          dims.w0 = growWrap.offsetWidth  || 1;
          dims.h0 = growWrap.offsetHeight || 1;
          const wrapRect = growWrap.getBoundingClientRect();
          const targetRect = s4.getBoundingClientRect();
          dims.w1 = s4.offsetWidth  || 1;
          dims.h1 = s4.offsetHeight || 1;
          dims.x = targetRect.left - wrapRect.left;
          dims.y = targetRect.top - wrapRect.top;
          growWrap.style.transform = transform;
          growWrap.style.setProperty("--img-w", `${dims.w1 * IMG_WIDTH_RATIO}px`);
        };

        /* تحريك وتكبير الحاوية والصور بالـ transform لتجنب layout وpaint أثناء التمرير. */
        const applyContainer = (p: number) => {
          const sx = (dims.w0 + (dims.w1 - dims.w0) * p) / dims.w0;
          const sy = (dims.h0 + (dims.h1 - dims.h0) * p) / dims.h0;
          growWrap.style.transform =
            `translate3d(${dims.x * p}px, ${dims.y * p}px, 0) scale(${sx}, ${sy})`;
        };

        const applyImages = (p: number) => {
          const w = dims.w0 + (dims.w1 - dims.w0) * p;
          const h = dims.h0 + (dims.h1 - dims.h0) * p;
          const containerScaleY = h / dims.h0;
          // عوّض تكبير الحاوية حتى لا تُضرب حركة الصورة في مقياس الحاوية مرة ثانية.
          const scaleX = dims.w0 / dims.w1;
          const scaleY = (w / dims.w1) / containerScaleY;
          const y = (IMG_TOP_START + (IMG_TOP_END - IMG_TOP_START) * p - 0.5) * dims.h0;
          const t = `translate3d(0, ${y}px, 0) scale(${scaleX}, ${scaleY})`;
          for (let i = 0; i < imgEls.length; i++) imgEls[i].style.transform = t;
          if (backdropImg) backdropImg.style.transform = `scaleY(${(w / dims.w0) / containerScaleY})`;
        };

        /* ── تجهيز المحتوى ليظهر فور اكتمال تكبير الكونتينر ── */
        if (overlay) {
          const lines = overlay.querySelectorAll<HTMLElement>(
            '[data-anim="title-line"], [data-anim="desc-line"], [data-anim="cta"], [data-anim="stat-text"]'
          );
          const rules = overlay.querySelectorAll<HTMLElement>(
            '[data-anim="line"], [data-anim="stat-line"]'
          );

          gsap.set(lines, { yPercent: 110 });
          gsap.set(rules, { scaleX: 0 });
          overlay.style.visibility = "hidden";

          setOverlayVisibility = (show: boolean) => {
            if (show === overlayIsVisible) return;
            overlayIsVisible = show;
            overlay.style.visibility = show ? "visible" : "hidden";
            if (show) {
              overlayTimeline = gsap.timeline()
                .to(lines, {
                  yPercent: 0,
                  duration: 0.8,
                  stagger: 0.045,
                  ease: "power3.out",
                })
                .to(rules, {
                  scaleX: 1,
                  duration: 0.65,
                  stagger: 0.1,
                  ease: "power2.out",
                }, "<0.15");
            } else {
              overlayTimeline?.kill();
              gsap.set(lines, { yPercent: 110 });
              gsap.set(rules, { scaleX: 0 });
            }
          };
        }

        measure();
        applyContainer(0);
        applyImages(0);

        let tl: gsap.core.Timeline | null = null;
        const progressNow = () => (tl ? tl.progress() : 0);

        tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            endTrigger: s4,
            end: "top top",
            scrub: CONTAINER_SCRUB,
            invalidateOnRefresh: true,
            onRefreshInit: measure,
            onRefresh: () => {
              const p = progressNow();
              applyContainer(p);
              applyImages(p);
            },
          },
          onUpdate: () => {
            const p = progressNow();
            applyContainer(p);
            applyImages(p);
          },
        });

        tl.to({ progress: 0 }, { progress: 1, duration: 1 }, 0);
      }

      /* ════════════════════════════════════════════
         4) Hover Reveal + بادج + فتح العرض عند الضغط
            (تبديل المشاريع بقى بالسكرول داخل الـ pin — الخطوة 5)
         ════════════════════════════════════════════ */
      let cleanupHover: (() => void) | undefined;

      if (coffeeWrap) {
        /* كل مشروع = نافذة (win) فيها طبقة معاكسة (counter) فيها الصورة.
           التبديل بالـ clip بيتم بتحريك النافذة والطبقة المعاكسة بعكس بعض (transform فقط)،
           فالصورة تفضل ثابتة والنافذة بتنكشف حواليها = clip كامل على الـ GPU من غير repaint. */
        const wins     = Array.from(coffeeWrap.querySelectorAll<HTMLElement>("[data-win]"));
        const counters = Array.from(coffeeWrap.querySelectorAll<HTMLElement>("[data-counter]"));
        const coffeeImg = coffeeWrap.querySelector<HTMLElement>("img");

        /* المشروع الحالي: بيتبدل مع السكرول جوه الـ pin */
        let projectIndex = 0;
        /* true = إحنا جوه/بعد الـ pin: الصورة ظاهرة كاملة وبتتبدل بالسكرول */
        let scrollMode = false;

        let clipTl: gsap.core.Timeline | null = null;

        /* يوقف أي أنيميشن شغال ويرجع كل النوافذ لحالتها الطبيعية، ويظهر المطلوبة بس */
        const resetWins = (visible: number[]) => {
          clipTl?.kill();
          clipTl = null;
          wins.forEach((w, k) => {
            gsap.set([w, counters[k]], { clearProps: "transform" });
            w.style.zIndex = "";
            w.style.visibility = visible.includes(k) ? "visible" : "hidden";
          });
        };

        /* تبديل فوري (من غير أنيميشن): للهفر والريسيت */
        const applyProjectImage = (i: number) => resetWins([i]);

        /* تبديل بأنيميشن clip: الصورة الجديدة تنكشف فوق القديمة
           (للأسفل: من تحت لفوق، وللأعلى: من فوق لتحت) */
        const clipToProject = (from: number, to: number) => {
          if (from === to || !wins[from] || !wins[to]) return applyProjectImage(to);

          const dir = to > from ? 1 : -1;
          resetWins([from, to]);

          const prevWin = wins[from];
          const nextWin = wins[to];
          prevWin.style.zIndex = "1";
          nextWin.style.zIndex = "2";

          clipTl = gsap
            .timeline({
              defaults: { duration: CLIP_DURATION, ease: CLIP_EASE },
              onComplete: () => {
                prevWin.style.visibility = "hidden";
                prevWin.style.zIndex = "";
                nextWin.style.zIndex = "";
                gsap.set([nextWin, counters[to]], { clearProps: "transform" });
                clipTl = null;
              },
            })
            .fromTo(nextWin,        { yPercent:  100 * dir }, { yPercent: 0 }, 0)
            .fromTo(counters[to],   { yPercent: -100 * dir }, { yPercent: 0 }, 0);
        };

        const applyBadgeText = (i: number) => {
          if (badgeName) badgeName.textContent = `${PROJECTS[i].name} project`;
        };

        /* ── تفعيل/إلغاء وضع السكرول وتبديل الصورة ── */
        setScrollMode = (on: boolean, idx: number) => {
          if (on !== scrollMode) {
            scrollMode = on;
            coffeeWrap.style.opacity = on ? "1" : "0";
            if (!on) {
              projectIndex = 0;
              applyProjectImage(0);
              applyBadgeText(0);
            }
          }
          if (on && idx !== projectIndex) {
            const from = projectIndex;
            projectIndex = idx;
            clipToProject(from, idx);
            applyBadgeText(idx);
          }
        };

        /* ── البادج ── */
        const BADGE_OFFSET_X = 78;
        const BADGE_OFFSET_Y = 78;
        let moveBadgeX: ((v: number) => void) | null = null;
        let moveBadgeY: ((v: number) => void) | null = null;
        let badgeShown = false;
        let mouseX = -9999, mouseY = -9999;
        let hasMouse = false;

        if (badge) {
          gsap.set(badge, { xPercent: -50, yPercent: -50, scale: 0, autoAlpha: 0 });
          moveBadgeX = gsap.quickTo(badge, "x", { duration: 0.55, ease: "power3.out" });
          moveBadgeY = gsap.quickTo(badge, "y", { duration: 0.55, ease: "power3.out" });
        }

        const isOverCoffee = (x: number, y: number) => {
          if (!coffeeImg) return false;
          const r = coffeeImg.getBoundingClientRect();
          return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
        };

        const animateBadgeOut = () => {
          if (!badge) return;
          gsap.to(badge, {
            scale: 0,
            autoAlpha: 0,
            duration: 0.25,
            ease: "power2.in",
            overwrite: "auto",
          });
        };

        const showBadge = () => {
          if (!badge || badgeShown) return;
          badgeShown = true;
          applyBadgeText(projectIndex);
          gsap.set(badge, { x: mouseX + BADGE_OFFSET_X, y: mouseY + BADGE_OFFSET_Y });
          gsap.to(badge, {
            scale: 1,
            autoAlpha: 1,
            duration: 0.5,
            ease: "back.out(2)",
            overwrite: "auto",
          });
        };

        const hideBadge = () => {
          if (!badgeShown) return;
          badgeShown = false;
          animateBadgeOut();
        };

        const syncBadge = () => {
          if (!hasMouse || viewerOpenRef.current) return;
          const over = isOverCoffee(mouseX, mouseY);
          growWrap.style.cursor = over ? "pointer" : "default";
          if (over) {
            showBadge();
            moveBadgeX?.(mouseX + BADGE_OFFSET_X);
            moveBadgeY?.(mouseY + BADGE_OFFSET_Y);
          } else {
            hideBadge();
          }
        };

        const onDocMove = (e: MouseEvent) => {
          mouseX = e.clientX;
          mouseY = e.clientY;
          hasMouse = true;
          syncBadge();
        };

        const onDocLeave = () => {
          hasMouse = false;
          hideBadge();
        };

        // نجمع أحداث السكرول في frame واحد (بدل getBoundingClientRect مع كل حدث)
        let scrollRaf = 0;
        const onScroll = () => {
          if (scrollRaf) return;
          scrollRaf = requestAnimationFrame(() => {
            scrollRaf = 0;
            syncBadge();
          });
        };

        document.addEventListener("mousemove", onDocMove, { passive: true });
        document.documentElement.addEventListener("mouseleave", onDocLeave);
        window.addEventListener("scroll", onScroll, { passive: true });

        /* إظهار الصورة مباشرة عند المرور عليها، بدون ماسك أو حركة. */
        const onEnter = () => {
          if (scrollMode) return;
          coffeeWrap.style.opacity = "1";
        };

        const onLeave = () => {
          growWrap.style.cursor = "default";
          hideBadge();
          if (scrollMode) return;
          coffeeWrap.style.opacity = "0";
        };

        /* الضغط على الصورة: يفتح المشروع الحالي بدايرة بتتوسع من مكان الضغطة */
        const onClick = (e: MouseEvent) => {
          if (viewerOpenRef.current) return;
          // الضغط على زرار/رابط جوه الأوفرلاي (Start a project) ما يفتحش المشروع
          if ((e.target as HTMLElement | null)?.closest("a, button")) return;
          if (!isOverCoffee(e.clientX, e.clientY)) return;

          const p  = projectIndex;
          const pr = PROJECTS[p];

          // لو المشروع فيه موقعين (القهوة / الهودي): كل ضغطة تفتح اللي بعده
          const n = clickCountRef.current[pr.id] ?? 0;
          clickCountRef.current[pr.id] = n + 1;

          originRef.current = { x: e.clientX, y: e.clientY };
          viewerOpenRef.current = true;
          setLoaded(false);
          setViewer({ p, v: n % pr.variants.length });

          // نخفي البادج (الصورة تفضل زي ما هي لأن التبديل بالسكرول)
          badgeShown = false;
          animateBadgeOut();
        };

        growWrap.addEventListener("mouseenter", onEnter);
        growWrap.addEventListener("mouseleave", onLeave);
        growWrap.addEventListener("click", onClick);

        cleanupHover = () => {
          if (scrollRaf) cancelAnimationFrame(scrollRaf);
          clipTl?.kill();
          document.removeEventListener("mousemove", onDocMove);
          document.documentElement.removeEventListener("mouseleave", onDocLeave);
          window.removeEventListener("scroll", onScroll);
          growWrap.removeEventListener("mouseenter", onEnter);
          growWrap.removeEventListener("mouseleave", onLeave);
          growWrap.removeEventListener("click", onClick);
        };
      }

      /* ════════════════════════════════════════════
         5) Pin: الكونتينر يثبت بعد ما يكبر، والصور تتبدل مع السكرول

         - بنثبّت السيكشن الرابع (pin + spacing) لمسافة سكرول محددة
         - وبنثبّت طبقة الكونتينر (pinLayer) بـ pin حقيقي من غير spacing،
           فالكونتينر يفضل ثابت تمامًا على الشاشة بدون أي هزّة
         - خلال الـ pin: التقدّم 0 → 1 بيحدد أنهي مشروع ظاهر
         ════════════════════════════════════════════ */
      if (s4) {
        const pinLen = () => window.innerHeight * PIN_VH_PER_PROJECT * PROJECTS.length;

        /* Pin حقيقي للطبقة اللي شايلة الكونتينر (pinLayer):
           بتتثبت بـ position: fixed من GSAP نفسه، فمفيش أي تعويض بالجافاسكريبت
           ومفيش هزّة. الكونتينر جواها بيحافظ على مكانه ومقاسه من الحركة الأولى. */
        if (pinLayer) {
          ScrollTrigger.create({
            trigger: s4,
            start: "top top",
            end: () => `+=${pinLen()}`,
            pin: pinLayer,
            pinSpacing: false,
            invalidateOnRefresh: true,
          });
        }

        const sync = (self: ScrollTrigger) => {
          setOverlayVisibility(self.isActive);
          const on  = self.isActive || self.progress > 0;
          const idx = Math.min(
            PROJECTS.length - 1,
            Math.floor(self.progress * PROJECTS.length)
          );
          setScrollMode?.(on, idx);
        };

        ScrollTrigger.create({
          trigger: s4,
          start: "top top",
          end: () => `+=${pinLen()}`,
          pin: true,
          pinSpacing: true,
          invalidateOnRefresh: true,
          onUpdate: sync,
          onToggle: sync,
          onRefresh: sync,
        });
      }

      return () => cleanupHover?.();
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const current = viewer ? PROJECTS[viewer.p] : null;
  const currentVariant = current && viewer ? current.variants[viewer.v] : null;

  return (
    <section ref={sectionRef} className={styles.section} aria-labelledby="section3-title">
      {IMAGES.map((img) => {
        const item = (
        <div
          key={img.id}
          data-dir={img.dir}
          ref={img.id === "bt" ? growWrapRef : undefined}
          className={`${styles.imgWrap} ${styles[img.cls]}`}
        >
          <Image
            src={img.src}
            alt=""
            width={img.id === "bt" ? 2118 : 600}
            height={img.id === "bt" ? 742 : 600}
            quality={100}
            unoptimized={img.id === "bt"}
            sizes={img.id === "bt" ? "100vw" : "40vw"}
            className={img.id === "bt" ? styles.containerImage : styles.img}
          />

          {img.id === "bt" && (
            <div ref={coffeeWrapRef} className={styles.coffeeOverlay}>
              {PROJECTS.map((p, i) => (
                <div
                  key={p.id}
                  data-win={p.id}
                  className={styles.clipWin}
                  style={{ visibility: i === 0 ? "visible" : "hidden" }}
                >
                  <div data-counter={p.id} className={styles.clipCounter}>
                    <Image
                      src={p.src}
                      alt=""
                      width={600}
                      height={600}
                      quality={100}
                      unoptimized
                      sizes="9vw"
                      className={styles.img}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        );

        /* الكونتينر السفلي جوه طبقة (pinLayer) بنثبّتها بالـ pin الحقيقي من GSAP
           (inline style عشان مفيش حاجة مطلوبة في الـ CSS) */
        return img.id === "bt" ? (
          <div
            key={img.id}
            style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 50 }}
          >
            <div
              ref={pinLayerRef}
              style={{ position: "relative", width: "100%", height: "100%", pointerEvents: "none" }}
            >
              {item}
            </div>
            {img.id === "bt" && (
              <div ref={overlayRef} className={styles.overlay}>
                  <div className={styles.overlayLeft}>
                    <h3 className={styles.ovTitle}>
                      {TITLE_LINES.map((line) => (
                        <span key={line} className={styles.mask}>
                          <span data-anim="title-line" className={styles.maskInner}>
                            {line}
                          </span>
                        </span>
                      ))}
                    </h3>

                    <p className={styles.ovDesc}>
                      {DESC_LINES.map((line) => (
                        <span key={line} className={styles.mask}>
                          <span data-anim="desc-line" className={styles.maskInner}>
                            {line}
                          </span>
                        </span>
                      ))}
                    </p>

                    <div className={styles.ctaWrap}>
                      <span className={styles.mask} style={{ padding: "6px 0", margin: "-6px 0" }}>
                        <span data-anim="cta" className={styles.maskInner}>
                          <a href="#contact" className={styles.cta} style={{ display: "inline-block" }}>
                            Start a project
                          </a>
                        </span>
                      </span>
                      <span data-anim="line" className={styles.ctaLine} />
                    </div>
                  </div>

                  <ul className={styles.stats}>
                    {STATS.map((s) => (
                      <li key={s.label} className={styles.stat}>
                        <span className={styles.mask}>
                          <span data-anim="stat-text" className={`${styles.maskInner} ${styles.statValue}`}>
                            {s.value}
                          </span>
                        </span>
                        <span className={styles.mask}>
                          <span data-anim="stat-text" className={`${styles.maskInner} ${styles.statLabel}`}>
                            {s.label}
                          </span>
                        </span>
                        <span data-anim="stat-line" className={styles.statLine} />
                      </li>
                    ))}
                  </ul>
            </div>
            )}
          </div>
        ) : (
          item
        );
      })}

      <div ref={contentRef} className={styles.content}>
        <h2 id="section3-title" className={styles.title}>
          LET&apos;S BUILD SOMETHING GREAT TOGETHER
        </h2>
        <p className={styles.subtitle}>your idea, our craft</p>
      </div>

      {/* ── بادج: مخفي من البداية، ويظهر فقط فوق صورة المشروع ── */}
      <div
        ref={badgeRef}
        className={styles.hoverBadge}
        style={{ visibility: "hidden", opacity: 0, zIndex: 60 }}
        aria-hidden="true"
      >
        <span className={styles.badgeSmall}>Our work</span>
        <span ref={badgeNameRef} className={styles.badgeMain}>
          {PROJECTS[0].name} project
        </span>
        <span className={styles.badgeArrow}>↗</span>
      </div>

      {/* ══════════ عرض المشروع (يفتح عند الضغط، مشروع واحد فقط) ══════════ */}
      {viewer && current && currentVariant && (
        <div
          ref={viewerRef}
          className={styles.viewer}
          style={
            {
              clipPath: "circle(0px at 50% 50%)",
              "--accent": current.accent,
            } as React.CSSProperties
          }
          role="dialog"
          aria-modal="true"
          aria-label={`${current.name} project`}
        >
          <div
            ref={stageRef}
            className={styles.vStage}
            style={{ clipPath: "circle(0px at 50% 50%)" }}
          >
            <span data-v="ghost" className={styles.vGhost} aria-hidden="true">
              {current.name.charAt(0)}
            </span>

            <button
              type="button"
              data-v="chrome"
              className={styles.vClose}
              onClick={closeViewer}
            >
              Close <span aria-hidden="true">✕</span>
            </button>

            <div key={current.id} className={styles.vGrid}>
              <div className={styles.vInfo}>
                <p data-v="fade" className={styles.vKicker}>
                  Selected work
                  {current.variants.length > 1
                    ? ` · ${viewer.v + 1} / ${current.variants.length}`
                    : ""}
                </p>

                <h3 className={styles.vTitle} aria-label={current.name}>
                  {current.name.split("").map((c, i) => (
                    <span key={i} className={styles.vMask} aria-hidden="true">
                      <span data-v="char" className={styles.vChar}>
                        {c}
                      </span>
                    </span>
                  ))}
                </h3>

                <p data-v="fade" className={styles.vDesc}>
                  {current.tagline}
                </p>

                {/* مشروعين من نفس الفئة (القهوة / الهودي): تبديل بينهم */}
                {current.variants.length > 1 && (
                  <div data-v="fade" className={styles.vChips}>
                    {current.variants.map((vr, i) => (
                      <button
                        key={vr.url}
                        type="button"
                        className={`${styles.vChip} ${i === viewer.v ? styles.vChipActive : ""}`}
                        onClick={() => selectVariant(i)}
                      >
                        {vr.label}
                      </button>
                    ))}
                  </div>
                )}

                <a
                  data-v="fade"
                  className={styles.vVisit}
                  href={currentVariant.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit live site <span aria-hidden="true">↗</span>
                </a>

                <p data-v="fade" className={styles.vHint}>
                  Live preview — scroll inside the frame.
                </p>
              </div>

              <div data-v="frame" className={styles.vFrame}>
                <div className={styles.vBar}>
                  <i /><i /><i />
                  <span className={styles.vUrl}>{hostOf(currentVariant.url)}</span>
                </div>
                <div className={styles.vScreen}>
                  <div className={`${styles.vLoader} ${loaded ? styles.vLoaderDone : ""}`}>
                    <span />
                  </div>
                  <iframe
                    key={currentVariant.url}
                    src={currentVariant.url}
                    title={`${current.name} — ${currentVariant.label}`}
                    className={styles.vIframe}
                    onLoad={() => setLoaded(true)}
                  />
                </div>
              </div>
            </div>

            {/* أسهم يمين/يسار: تظهر فقط لو الفئة فيها أكتر من مشروع */}
            {current.variants.length > 1 && (
              <div data-v="chrome" className={styles.vNav}>
                <button
                  type="button"
                  className={styles.vArrow}
                  onClick={() => cycleVariant(-1)}
                  aria-label="Previous project"
                >
                  ←
                </button>
                <div className={styles.vDots}>
                  {current.variants.map((vr, i) => (
                    <button
                      key={vr.url}
                      type="button"
                      aria-label={vr.label}
                      className={`${styles.vDot} ${i === viewer.v ? styles.vDotActive : ""}`}
                      onClick={() => selectVariant(i)}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  className={styles.vArrow}
                  onClick={() => cycleVariant(1)}
                  aria-label="Next project"
                >
                  →
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}