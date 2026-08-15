"use client";

import { useEffect } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";

/**
 * error.tsx سراسری — مرز خطا (Error Boundary) برای تمام مسیرها.
 * اگر در هر صفحه‌ای خطای رندر رخ دهد، این نمایش داده می‌شود.
 * این یکی از ویژگی‌های بومی App Router است.
 *
 * نکته: باید "use client" داشته باشد.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // لاگ کردن خطا (در محیط تولید به سرویس مانیتورینگ ارسال می‌شود)
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      {/* پس‌زمینه */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 right-0 h-[28rem] w-[28rem] rounded-full bg-rose-300/15 blur-[80px] dark:bg-rose-500/5" />
        <div className="absolute bottom-0 left-1/4 h-[24rem] w-[24rem] rounded-full bg-amber-300/10 blur-[80px] dark:bg-amber-500/5" />
      </div>

      <div className="text-center">
        {/* آیکون خطا */}
        <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-rose-400 to-red-600 shadow-xl shadow-rose-500/30">
          <svg
            viewBox="0 0 24 24"
            className="h-10 w-10 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>

        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 sm:text-3xl">
          خطایی رخ داد
        </h1>
        <p className="mt-3 max-w-md text-sm text-slate-500 dark:text-slate-400">
          متأسفانه در بارگذاری این صفحه مشکلی پیش آمد. لطفاً دوباره تلاش کنید
          یا به صفحه اصلی بازگردید.
        </p>

        {error.digest && (
          <p className="mt-2 text-xs text-slate-400">
            کد خطا: {error.digest}
          </p>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={reset}
            data-cursor="hover"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/30 transition hover:scale-105"
          >
            <Icon name="arrow" className="h-4 w-4 rotate-180" />
            تلاش مجدد
          </button>
          <Link
            href="/"
            data-cursor="hover"
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/70 px-6 py-3 text-sm font-bold text-slate-700 backdrop-blur transition hover:border-cyan-300 hover:text-cyan-700 dark:border-slate-700 dark:bg-slate-800/70"
          >
            <Icon name="grid" className="h-4 w-4" />
            بازگشت به خانه
          </Link>
        </div>
      </div>
    </div>
  );
}
