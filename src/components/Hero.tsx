"use client";

import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Icon from "./Icon";
import LiveBoard from "./LiveBoard";
import { useScrolling } from "../utils/useScrolling";

const HeroScene = lazy(() => import("./HeroScene"));

type Nav = (page: "home" | "doctors" | "doctor" | "login" | "appointments" | "article" | "panel" | "admin" | "secretary" | "favorites" | "help" | "profile", section?: string) => void;

const ECG_POINTS =
  "0,40 120,40 140,40 152,20 164,60 176,8 188,72 200,40 320,40 340,40 352,25 364,55 376,40 600,40";

function EcgLine() {
  return (
    <svg
      viewBox="0 0 600 80"
      className="h-14 w-full max-w-xl"
      preserveAspectRatio="none"
    >
      <line x1="0" y1="40" x2="600" y2="40" stroke="#bae1ee" strokeWidth="1" strokeDasharray="4 6" />
      <polyline
        points={ECG_POINTS}
        pathLength={1}
        fill="none"
        stroke="#0891b2"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          strokeDasharray: 1,
          filter: "drop-shadow(0 0 6px rgba(8,145,178,0.45))",
          animation: "ecg 2.6s cubic-bezier(0.4,0,0.2,1) infinite",
        }}
      />
    </svg>
  );
}

export default function Hero({ navigate }: { navigate: Nav }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(true);
  const scrolling = useScrolling();

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Pause the heavy 3D scene when off-screen or while scrolling
  const sceneActive = inView && !scrolling;

  return (
    <section
      ref={sectionRef}
      id="home"
      className="relative flex min-h-screen items-center overflow-hidden pt-28 pb-20 lg:pb-16"
    >
      {/* 3D background — paused when off-screen / scrolling; blurred so it never competes with content.
          Hidden on mobile to save performance + reduce visual clutter. */}
      <div className="absolute -inset-10 hidden opacity-90 [filter:blur(6px)] sm:block">
        <Suspense fallback={null}>
          <HeroScene active={sceneActive} />
        </Suspense>
      </div>

      {/* Mobile-friendly gradient background (no 3D) — dark-mode aware */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-50 via-white to-blue-50 dark:from-[#0c1e2a] dark:via-[#0a1520] dark:to-[#0e2433] sm:hidden" />

      {/* light legibility veils — hidden in dark mode to avoid bright halos */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/45 via-white/10 to-[#eef6fb] dark:hidden" />
      <div className="absolute inset-0 bg-gradient-to-l from-white/60 via-white/5 to-white/35 dark:hidden" />

      {/* dark mode subtle overlay for depth */}
      <div className="absolute inset-0 hidden bg-gradient-to-b from-cyan-950/20 via-transparent to-blue-950/20 dark:block" />

      {/* 3D grid floor */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 [mask-image:linear-gradient(to_top,black,transparent)]">
        <div className="grid-floor h-full [transform:perspective(400px)_rotateX(70deg)] origin-bottom opacity-70" />
      </div>

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-6 px-5 sm:gap-10 sm:px-6 lg:grid-cols-12 lg:px-8">
        {/* Copy */}
        <div className="w-full min-w-0 lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-1.5 text-sm font-semibold text-cyan-700"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500" />
            </span>
            سامانه هوشمند رزرو نوبت پزشک
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="mt-4 text-[1.75rem] font-black leading-[1.25] tracking-tight text-slate-900 sm:mt-5 sm:text-5xl lg:text-6xl"
          >
            نوبت مطب پزشک را
            <br />
            <span className="shimmer-text">آنلاین و در لحظه</span> بگیرید
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-4 hidden sm:block"
          >
            <EcgLine />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600 sm:mt-2 sm:text-lg"
          >
            بدون معطلی در صف تلفن، در کمتر از یک دقیقه نوبت بهترین متخصصان را
            رزرو کنید. یادآور هوشمند، پرونده دیجیتال و تقویم زنده‌ی مطب در یک
            پلتفرم.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-6 flex flex-wrap items-center gap-3 sm:gap-4"
          >
            <a
              href="#booking"
              data-cursor="hover"
              className="group flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-cyan-500/30 transition hover:scale-[1.03] hover:shadow-cyan-500/45 sm:px-7 sm:py-4 sm:text-base"
            >
              <Icon name="calendar" className="h-5 w-5" />
              شروع رزرو نوبت
              <Icon
                name="arrow"
                className="h-4 w-4 transition group-hover:-translate-x-1"
              />
            </a>
            <button
              onClick={() => navigate("doctors")}
              data-cursor="hover"
              className="flex items-center gap-2 rounded-2xl border border-slate-300 bg-white/80 px-6 py-3.5 text-sm font-semibold text-slate-700 backdrop-blur transition hover:border-cyan-400 hover:text-cyan-700 sm:px-7 sm:py-4 sm:text-base"
            >
              <Icon name="stethoscope" className="h-5 w-5 text-cyan-600" />
              مشاهده پزشکان
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 sm:mt-8 sm:gap-x-6 sm:gap-y-3 sm:text-sm"
          >
            <span className="flex items-center gap-2">
              <Icon name="shield" className="h-4 w-4 text-cyan-600" /> امن و
              محرمانه
            </span>
            <span className="flex items-center gap-2">
              <Icon name="clock" className="h-4 w-4 text-cyan-600" /> شبانه‌روزی
            </span>
            <span className="flex items-center gap-2">
              <span className="font-bold text-amber-500">★ ۴٫۹</span> رضایت
              بیماران
            </span>
          </motion.div>
        </div>

        {/* Functional quick-booking widget */}
        <motion.div
          initial={{ opacity: 0, y: 40, rotateY: -12 }}
          animate={{ opacity: 1, y: 0, rotateY: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="w-full min-w-0 lg:col-span-5"
          style={{ perspective: 1200 }}
        >
          <LiveBoard navigate={navigate} />
        </motion.div>
      </div>

      {/* scroll cue — hidden on mobile (no space) */}
      <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 sm:block">
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          className="flex flex-col items-center gap-2 text-slate-400"
        >
          <span className="text-xs">برای ادامه اسکرول کنید</span>
          <span className="flex h-9 w-5 justify-center rounded-full border border-slate-300 pt-1.5">
            <span className="h-2 w-1 rounded-full bg-cyan-500" />
          </span>
        </motion.div>
      </div>
    </section>
  );
}
