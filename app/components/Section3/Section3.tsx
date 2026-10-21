"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./Section3.module.css";

const IMAGES = [
  { id: "rt", src: "/web-3.png", cls: "imgRightTop",    dir: "right"        },
  { id: "rb", src: "/web-2.png", cls: "imgRightBottom", dir: "right_bottom" },
  { id: "lt", src: "/web-3.png", cls: "imgLeftTop",     dir: "left"         },
  { id: "lb", src: "/web-4.png", cls: "imgLeftBottom",  dir: "left_bottom"  },
  { id: "tp", src: "/web-4.png", cls: "imgTop",         dir: "top"          },
  { id: "bt", src: "/qq.webp",  cls: "imgBottom",      dir: "bottom"       },
] as const;

const OFFSETS: Record<string, { x: number; y: number }> = {
  right:        { x: 160,  y: 0    },
  left:         { x: -160, y: 0    },
  right_bottom: { x: 160,  y: 160  },
  left_bottom:  { x: -160, y: 160  },
  top:          { x: 0,    y: -180 },
  bottom:       { x: 0,    y: 35   },
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

/* حجم الدايرة اللي بتكشف الصورة مع الماوس (كان 0.26) */
const REVEAL_RADIUS_RATIO = 0.36;

const hostOf = (url: string) => {
  try { return new URL(url).host; } catch { return url; }
};

export default function Section3() {
  const sectionRef    = useRef<HTMLElement>(null);
  const contentRef    = useRef<HTMLDivElement>(null);
  const growWrapRef   = useRef<HTMLDivElement>(null);
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
    const ctx = gsap.context(() => {
      const section     = sectionRef.current;
      const growWrap    = growWrapRef.current;
      const coffeeWrap  = coffeeWrapRef.current;
      const overlay     = overlayRef.current;
      const badge       = badgeRef.current;
      const badgeName   = badgeNameRef.current;
      if (!section || !growWrap) return;

      gsap.set(growWrap, { xPercent: -50, transformOrigin: "50% 50%" });
      /* مكان الصور جوه الكونتينر: تبدأ فوق وتنزل مع نزول/تكبير الكونتينر */
      const IMG_TOP_START = "36%";
      const IMG_TOP_END   = "66%";
      gsap.set(growWrap, { "--img-top": IMG_TOP_START });

      /* ── باقي الصور تدخل من الجوانب ── */
      section.querySelectorAll<HTMLElement>(`.${styles.imgWrap}`).forEach((el) => {
        if (el === growWrap) return;
        const dir  = el.dataset.dir ?? "right";
        const from = OFFSETS[dir] ?? OFFSETS.right;
        gsap.fromTo(
          el,
          { x: from.x, y: from.y },
          {
            x: 0, y: 0,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
              start: "top 100%",
              end:   "bottom 60%",
              scrub: 1,
            },
          }
        );
      });

      /* ── النص يظهر ── */
      gsap.fromTo(
        contentRef.current,
        { y: 60, opacity: 0 },
        {
          y: 0, opacity: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 78%",
            end:   "top 40%",
            scrub: 1,
          },
        }
      );

      /* نقطة بداية الـ pin والتكبير: كل ما الرقم أكبر بدأ أبكر
         (كان 0.85) */
      const PIN_AT = 0.97;

      /* ── الكونتينر كله يكبر مع السكرول لتغطي Section4
            + محتوى الأوفرلاي (جوه الكونتينر) يظهر تدريجيًا مع نفس الـ scrub ── */
      const s4 = document.getElementById("section4");

      if (s4) {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const W  = growWrap.offsetWidth;
        const H  = growWrap.offsetHeight;

        const scaleW     = vw / W;
        const scaleH     = (s4.offsetHeight * 1.1) / H;
        const coverScale = Math.max(scaleW, scaleH);

        /* بدل ما نحرّك y على العنصر اللي عليه الـ pin (ScrollTrigger بيكتب y بنفسه
           بعد نهاية الـ pin، وده كان بيعمل تعارض بعد إضافة Section5)،
           بنحرّك نقطة أصل الـ scale لتحت: نفس النتيجة بالظبط من غير y */
        const KEEP_DROP = 0.35;
        const ORIGIN_Y  = 50 + ((1 - KEEP_DROP) / 2) * 100; // 82.5%
        gsap.set(growWrap, { xPercent: -50, transformOrigin: `50% ${ORIGIN_Y}%` });

        /* ── تثبيت الأوفرلاي جوه الكونتينر ──
           الأوفرلاي بحجم الشاشة ومصغّر بمقدار 1/coverScale،
           فمع تكبير الكونتينر يكبر معاه، وفي النهاية بالظبط يبقى على حجم الشاشة.
           (lx, ly) = مكانه جوه الكونتينر عشان في نهاية الـ scale يتطابق مع الـ viewport.
           الكونتينر بيتثبّت (pin) وقتها وحرفه السفلي على PIN_AT من ارتفاع الشاشة. */
        if (overlay) {
          const Ox = W / 2;
          const Oy = (H * ORIGIN_Y) / 100;
          const rect0Left = (vw - W) / 2;
          const rect0Top  = vh * PIN_AT - H;
          const lx = Ox - (rect0Left + Ox) / coverScale;
          const ly = Oy - (rect0Top  + Oy) / coverScale;

          gsap.set(overlay, {
            autoAlpha: 1,
            x: lx,
            y: ly,
            scale: 1 / coverScale,
            transformOrigin: "0 0",
          });
        }

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger:    growWrap,
            start:      `bottom ${PIN_AT * 100}%`,
            endTrigger: s4,
            end:        "bottom bottom",
            pin:        true,
            pinSpacing: false,
            scrub:      0.3,
          },
        });

        // تكبير الكونتينر (المدة = 1 → الـ timeline كله من 0 لـ 1)
        tl.to(
          growWrap,
          {
            scale: coverScale,
            xPercent: -50,
            "--img-top": IMG_TOP_END,
          },
          0
        );

        // محتوى الأوفرلاي: يظهر بالتدريج مع نفس حركة الكونتينر
        if (overlay) {
          const q = (sel: string) => overlay.querySelectorAll<HTMLElement>(sel);

          tl.fromTo(
            q("[data-anim='title-line']"),
            { yPercent: 110 },
            { yPercent: 0, duration: 0.3, stagger: 0.07, ease: "power2.out" },
            0.2
          )
            .fromTo(
              q("[data-anim='desc-line']"),
              { y: 24, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.25, stagger: 0.06, ease: "power2.out" },
              0.3
            )
            .fromTo(
              q("[data-anim='cta']"),
              { y: 24, opacity: 0, scale: 0.92 },
              { y: 0, opacity: 1, scale: 1, duration: 0.25, ease: "power2.out" },
              0.5
            )
            .fromTo(
              q("[data-anim='line']"),
              { scaleX: 0 },
              { scaleX: 1, duration: 0.3, ease: "power2.inOut" },
              0.6
            )
            .fromTo(
              q("[data-anim='stat']"),
              { x: 60, opacity: 0 },
              { x: 0, opacity: 1, duration: 0.3, stagger: 0.08, ease: "power2.out" },
              0.3
            )
            .fromTo(
              q("[data-anim='stat-line']"),
              { scaleX: 0 },
              { scaleX: 1, duration: 0.25, stagger: 0.08, ease: "power2.inOut" },
              0.4
            );
        }
      }

      /* ── Hover Reveal + بادج + تبديل المشاريع + فتح العرض عند الضغط ── */
      let cleanupHover: (() => void) | undefined;

      if (coffeeWrap) {
        const projectImgs = Array.from(
          coffeeWrap.querySelectorAll<HTMLElement>("[data-project]")
        );
        const coffeeImg = projectImgs[0] ?? null;

        /* المشروع الحالي: بيتبدل لما الماوس يبعد عن الصورة */
        let projectIndex = 0;

        const applyProjectImage = (i: number) => {
          projectImgs.forEach((el, k) => {
            el.classList.toggle(styles.imgActive, k === i);
          });
        };

        const applyBadgeText = (i: number) => {
          if (badgeName) badgeName.textContent = `${PROJECTS[i].name} project`;
        };

        let raf = 0;
        let curX = 0, curY = 0, curR = 0;
        let targetX = 0, targetY = 0, targetR = 0;

        // حجم الدايرة اللي بتكشف الصورة
        const getRevealRadius = () => growWrap.offsetHeight * REVEAL_RADIUS_RATIO;

        const toLocal = (e: MouseEvent) => {
          const rect   = growWrap.getBoundingClientRect();
          const scaleX = growWrap.offsetWidth  / rect.width;
          const scaleY = growWrap.offsetHeight / rect.height;
          return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top)  * scaleY,
          };
        };

        const loop = () => {
          curX += (targetX - curX) * 0.25;
          curY += (targetY - curY) * 0.25;
          curR += (targetR - curR) * 0.15;

          coffeeWrap.style.setProperty("--mx", `${curX}px`);
          coffeeWrap.style.setProperty("--my", `${curY}px`);
          coffeeWrap.style.setProperty("--mr", `${curR}px`);

          const settled =
            Math.abs(targetX - curX) < 0.1 &&
            Math.abs(targetY - curY) < 0.1 &&
            Math.abs(targetR - curR) < 0.1;

          raf = settled ? 0 : requestAnimationFrame(loop);
        };
        const startLoop = () => { if (!raf) raf = requestAnimationFrame(loop); };

        /* ── البادج ── */
        const BADGE_OFFSET_X = 78;
        const BADGE_OFFSET_Y = 78;
        let moveBadgeX: ((v: number) => void) | null = null;
        let moveBadgeY: ((v: number) => void) | null = null;
        let badgeShown = false;
        let mouseX = -9999, mouseY = -9999;
        let hasMouse = false;
        /* التبديل بيتفعّل بعد ما الماوس يدخل الصورة، وبيتنفذ لما يبعد عنها مسافة كافية */
        let switchArmed = false;

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
          switchArmed = true;
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

        /* أول ما الماوس يخرج من الصورة: يخفي البادج بس (من غير تبديل) */
        const hideBadge = () => {
          if (!badgeShown) return;
          badgeShown = false;
          animateBadgeOut();
        };

        /* تبديل المشروع للي بعده */
        const switchProject = () => {
          if (!switchArmed) return;
          switchArmed = false;
          projectIndex = (projectIndex + 1) % PROJECTS.length;
          applyProjectImage(projectIndex);
        };

        /* المسافة المطلوبة للتبديل = أكبر من 160px أو 1.1 × عرض الصورة (بتكبر مع الكونتينر) */
        const SWITCH_MIN_DISTANCE = 160;
        const SWITCH_WIDTH_FACTOR = 1.1;

        const maybeSwitch = () => {
          if (!switchArmed || !coffeeImg) return;
          const r  = coffeeImg.getBoundingClientRect();
          const dx = Math.max(r.left - mouseX, 0, mouseX - r.right);
          const dy = Math.max(r.top  - mouseY, 0, mouseY - r.bottom);
          const threshold = Math.max(SWITCH_MIN_DISTANCE, r.width * SWITCH_WIDTH_FACTOR);
          if (Math.hypot(dx, dy) > threshold) switchProject();
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
            maybeSwitch();
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
          switchProject();
        };

        const onScroll = () => syncBadge();

        document.addEventListener("mousemove", onDocMove, { passive: true });
        document.documentElement.addEventListener("mouseleave", onDocLeave);
        window.addEventListener("scroll", onScroll, { passive: true });

        /* ── Hover Reveal على الكونتينر ── */
        const onEnter = (e: MouseEvent) => {
          const p = toLocal(e);
          targetX = curX = p.x;
          targetY = curY = p.y;
          targetR = getRevealRadius();
          coffeeWrap.style.opacity = "1";
          startLoop();
        };

        const onMove = (e: MouseEvent) => {
          const p = toLocal(e);
          targetX = p.x;
          targetY = p.y;
          targetR = getRevealRadius();
          startLoop();
        };

        const onLeave = () => {
          targetR = 0;
          coffeeWrap.style.opacity = "0";
          growWrap.style.cursor = "default";
          startLoop();
          hideBadge();
        };

        /* الضغط على الصورة: يفتح المشروع الحالي فقط بدايرة بتتوسع من مكان الضغطة */
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

          // نخفي البادج ونجهز المشروع اللي بعده للهفر الجاي
          badgeShown = false;
          switchArmed = false;
          animateBadgeOut();
          projectIndex = (projectIndex + 1) % PROJECTS.length;
          applyProjectImage(projectIndex);
        };

        growWrap.addEventListener("mouseenter", onEnter);
        growWrap.addEventListener("mousemove", onMove);
        growWrap.addEventListener("mouseleave", onLeave);
        growWrap.addEventListener("click", onClick);

        cleanupHover = () => {
          if (raf) cancelAnimationFrame(raf);
          document.removeEventListener("mousemove", onDocMove);
          document.documentElement.removeEventListener("mouseleave", onDocLeave);
          window.removeEventListener("scroll", onScroll);
          growWrap.removeEventListener("mouseenter", onEnter);
          growWrap.removeEventListener("mousemove", onMove);
          growWrap.removeEventListener("mouseleave", onLeave);
          growWrap.removeEventListener("click", onClick);
        };
      }

      return () => cleanupHover?.();
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const current = viewer ? PROJECTS[viewer.p] : null;
  const currentVariant = current && viewer ? current.variants[viewer.v] : null;

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
            quality={100}
            unoptimized={img.id === "bt"}
            sizes={img.id === "bt" ? "9vw" : "40vw"}
            className={styles.img}
          />

          {img.id === "bt" && (
            <>
              <div ref={coffeeWrapRef} className={styles.coffeeOverlay}>
                {PROJECTS.map((p, i) => (
                  <Image
                    key={p.id}
                    data-project={p.id}
                    src={p.src}
                    alt=""
                    width={600}
                    height={600}
                    quality={100}
                    unoptimized
                    sizes="9vw"
                    className={`${styles.img} ${i === 0 ? styles.imgActive : ""}`}
                  />
                ))}
              </div>

              {/* ── محتوى الأوفرلاي: جوه الكونتينر نفسه ويتقص بحدوده،
                  ويظهر مع سكرول الـ scale (مش بعده) ── */}
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
                      <span key={line} data-anim="desc-line" className={styles.ovDescLine}>
                        {line}
                      </span>
                    ))}
                  </p>

                  <div className={styles.ctaWrap}>
                    <a href="#contact" data-anim="cta" className={styles.cta}>
                      Start a project
                    </a>
                    <span data-anim="line" className={styles.ctaLine} />
                  </div>
                </div>

                <ul className={styles.stats}>
                  {STATS.map((s) => (
                    <li key={s.label} data-anim="stat" className={styles.stat}>
                      <span className={styles.statValue}>{s.value}</span>
                      <span className={styles.statLabel}>{s.label}</span>
                      <span data-anim="stat-line" className={styles.statLine} />
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      ))}

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
        style={{ visibility: "hidden", opacity: 0 }}
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