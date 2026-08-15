"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Icon from "@/components/Icon";

/**
 * not-found.tsx برای مسیر /doctors/[slug]
 * وقتی پزشک با slug مشخص شده پیدا نشود.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 pt-28">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30">
          <Icon name="stethoscope" className="h-10 w-10" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
          پزشک مورد نظر پیدا نشد
        </h1>
        <p className="mt-3 max-w-md text-sm text-slate-500 dark:text-slate-400">
          ممکن است نام پزشک تغییر کرده باشد یا از لیست خارج شده باشد.
          لطفاً از لیست پزشکان استفاده کنید.
        </p>
        <Link
          href="/doctors"
          data-cursor="hover"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/30 transition hover:scale-105"
        >
          <Icon name="list" className="h-4 w-4" />
          مشاهده لیست پزشکان
        </Link>
      </motion.div>
    </div>
  );
}
