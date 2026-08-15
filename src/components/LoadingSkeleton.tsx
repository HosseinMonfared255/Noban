"use client";

import { motion } from "framer-motion";

/**
 * اسکلتون لودینگ مشترک — در تمام loading.tsx ها استفاده می‌شود.
 * شامل نوار بالایی، بدنه و نوار پایینی است.
 */
export default function LoadingSkeleton() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* پس‌زمینه محیطی */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 right-0 h-[28rem] w-[28rem] rounded-full bg-cyan-300/15 blur-[80px] dark:bg-cyan-500/5" />
        <div className="absolute bottom-0 right-1/4 h-[24rem] w-[24rem] rounded-full bg-violet-300/10 blur-[80px] dark:bg-violet-500/3" />
      </div>

      {/* نوار بالایی */}
      <div className="fixed inset-x-0 top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mt-3 flex items-center justify-between rounded-2xl glass px-4 py-2.5">
            <Shimmer className="h-8 w-28 rounded-xl" />
            <div className="hidden gap-1 lg:flex">
              {Array.from({ length: 6 }).map((_, i) => (
                <Shimmer key={i} className="h-8 w-16 rounded-lg" />
              ))}
            </div>
            <Shimmer className="h-8 w-24 rounded-lg" />
          </div>
        </div>
      </div>

      {/* بدنه */}
      <div className="mx-auto max-w-7xl px-4 pt-28 sm:px-6 lg:px-8">
        {/* عنوان بزرگ */}
        <Shimmer className="h-10 w-3/4 rounded-xl" />
        <Shimmer className="mt-4 h-4 w-full rounded-lg" />
        <Shimmer className="mt-2 h-4 w-5/6 rounded-lg" />

        {/* کارت‌ها */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Shimmer key={i} className="h-48 rounded-2xl" />
          ))}
        </div>

        {/* ویجت */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Shimmer className="h-64 rounded-3xl" />
          <Shimmer className="h-64 rounded-3xl" />
        </div>
      </div>
    </div>
  );
}

/**
 * بلوک درخشانی (shimmer) — انیمیشن موج نورانی.
 */
function Shimmer({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-lg bg-slate-200/60 dark:bg-slate-700/40 ${className}`}
    >
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
        }}
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}
