"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Icon from "@/components/Icon";

/**
 * not-found.tsx سراسری — وقتی کاربر به مسیر ناموجود می‌رود (۴۰۴).
 * این یکی از ویژگی‌های بومی App Router است.
 */
export default function NotFound() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      {/* پس‌زمینه محیطی */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 right-0 h-[28rem] w-[28rem] rounded-full bg-cyan-300/15 blur-[80px] dark:bg-cyan-500/5" />
        <div className="absolute bottom-0 left-1/4 h-[24rem] w-[24rem] rounded-full bg-rose-300/10 blur-[80px] dark:bg-rose-500/5" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        {/* عدد ۴۰۴ */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="relative mb-6"
        >
          <h1 className="bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-500 bg-clip-text text-[8rem] font-black leading-none text-transparent sm:text-[12rem]">
            ۴۰۴
          </h1>
          <div className="absolute inset-0 -z-10 mx-auto h-32 w-32 rounded-full bg-cyan-400/20 blur-3xl sm:h-48 sm:w-48" />
        </motion.div>

        <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 sm:text-3xl">
          صفحه مورد نظر پیدا نشد
        </h2>
        <p className="mt-3 max-w-md text-sm text-slate-500 dark:text-slate-400">
          متأسفیم! صفحه‌ای که به دنبال آن هستید وجود ندارد یا منتقل شده است.
          ممکن است آدرس را اشتباه وارد کرده باشید.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            data-cursor="hover"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/30 transition hover:scale-105"
          >
            <Icon name="grid" className="h-4 w-4" />
            بازگشت به خانه
          </Link>
          <Link
            href="/doctors"
            data-cursor="hover"
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/70 px-6 py-3 text-sm font-bold text-slate-700 backdrop-blur transition hover:border-cyan-300 hover:text-cyan-700 dark:border-slate-700 dark:bg-slate-800/70"
          >
            <Icon name="stethoscope" className="h-4 w-4" />
            مشاهده پزشکان
          </Link>
        </div>

        {/* لینک‌های سریع */}
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {[
            { href: "/login", label: "ورود" },
            { href: "/contact", label: "پشتیبانی" },
            { href: "/profile", label: "پروفایل" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              data-cursor="hover"
              className="rounded-lg border border-slate-200 bg-white/50 px-3 py-1.5 text-xs font-bold text-slate-500 transition hover:border-cyan-300 hover:text-cyan-700 dark:border-slate-700 dark:bg-slate-800/50"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
