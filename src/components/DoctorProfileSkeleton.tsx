"use client";

import { motion } from "framer-motion";

/**
 * A shimmering skeleton placeholder block.
 */
function Shimmer({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-slate-200/60 dark:bg-slate-700/40 ${className}`}
    >
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)",
        }}
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

/**
 * A shimmering skeleton placeholder for the doctor profile page.
 * Shown while images and the map iframe load on slow connections.
 */
export default function DoctorProfileSkeleton() {

  return (
    <div className="min-h-screen pb-16 pt-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Back button placeholder */}
        <Shimmer className="mb-5 h-9 w-44 rounded-full" />

        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl glass p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <Shimmer className="h-32 w-32 rounded-3xl sm:h-40 sm:w-40" />
            <div className="flex-1 space-y-3">
              <Shimmer className="h-5 w-20 rounded-full" />
              <Shimmer className="h-8 w-64" />
              <div className="flex gap-3">
                <Shimmer className="h-5 w-32" />
                <Shimmer className="h-5 w-20" />
              </div>
              <div className="flex flex-wrap gap-2">
                <Shimmer className="h-7 w-32 rounded-lg" />
                <Shimmer className="h-7 w-28 rounded-lg" />
                <Shimmer className="h-7 w-24 rounded-lg" />
              </div>
              <Shimmer className="h-4 w-full" />
              <Shimmer className="h-4 w-3/4" />
              <div className="flex gap-3 pt-2">
                <Shimmer className="h-11 w-36 rounded-xl" />
                <Shimmer className="h-11 w-44 rounded-xl" />
                <Shimmer className="h-11 w-11 rounded-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Contact + Map */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="space-y-4">
            <div className="rounded-3xl glass p-5">
              <Shimmer className="mb-3 h-5 w-32" />
              <Shimmer className="h-7 w-40" />
            </div>
            <div className="rounded-3xl glass p-5">
              <Shimmer className="mb-3 h-5 w-28" />
              <Shimmer className="h-4 w-full" />
              <Shimmer className="mt-2 h-4 w-5/6" />
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="rounded-3xl glass p-2">
              <Shimmer className="h-72 w-full rounded-2xl sm:h-80" />
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="mt-10">
          <Shimmer className="mb-4 h-8 w-40" />
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <Shimmer key={i} className="h-24 w-24 shrink-0 rounded-2xl" />
            ))}
          </div>
          <div className="mt-5 rounded-3xl glass p-5">
            <Shimmer className="mb-4 h-6 w-56" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <Shimmer key={i} className="h-14 rounded-xl" />
              ))}
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-12">
          <Shimmer className="mb-5 h-8 w-32" />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-3xl glass p-6">
              <Shimmer className="mx-auto h-12 w-12 rounded-full" />
              <Shimmer className="mx-auto mt-3 h-5 w-32" />
              <div className="mt-5 space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Shimmer key={i} className="h-2 w-full rounded-full" />
                ))}
              </div>
            </div>
            <div className="rounded-3xl glass p-6 lg:col-span-2">
              <Shimmer className="mb-3 h-5 w-28" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="rounded-2xl border border-slate-100 p-4 dark:border-slate-700">
                    <div className="flex items-center gap-2.5">
                      <Shimmer className="h-9 w-9 rounded-full" />
                      <div className="flex-1 space-y-1">
                        <Shimmer className="h-3 w-24" />
                        <Shimmer className="h-2 w-16" />
                      </div>
                    </div>
                    <Shimmer className="mt-2 h-3 w-full" />
                    <Shimmer className="mt-1 h-3 w-4/5" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
