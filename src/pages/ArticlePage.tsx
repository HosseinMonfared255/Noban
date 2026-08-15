"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { healthTips } from "../data";
import type { Nav } from "../nav";
import Icon from "../components/Icon";
import ShareButton from "../components/ShareButton";

export default function ArticlePage({
  articleId,
  navigate,
}: {
  articleId: string;
  navigate: Nav;
}) {
  const tip = healthTips.find((t) => String(t.id) === articleId) ?? healthTips[0];
  const related = healthTips.filter((t) => t.id !== tip.id).slice(0, 3);

  // Scroll to top on mount / article change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [tip.id]);

  return (
    <div className="min-h-screen pb-16 pt-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <button
          onClick={() => navigate("home", "#tips")}
          data-cursor="hover"
          className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/70 px-4 py-1.5 text-sm font-medium text-slate-600 backdrop-blur transition hover:border-cyan-300 hover:text-cyan-700 dark:border-slate-700 dark:bg-slate-800/70"
        >
          <Icon name="arrow" className="h-4 w-4 rotate-180" />
          بازگشت به مجله سلامت
        </button>

        {/* Hero banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative h-56 overflow-hidden rounded-3xl bg-gradient-to-br ${tip.color} sm:h-72`}
        >
          <div className="absolute inset-0 grid place-items-center">
            <motion.span
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.1 }}
              className="text-7xl drop-shadow-lg sm:text-8xl"
            >
              {tip.emoji}
            </motion.span>
          </div>
          {/* pattern overlay */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
              backgroundSize: "30px 30px",
            }}
          />
          <span className="absolute right-4 top-4 rounded-full bg-white/85 px-3 py-1 text-xs font-bold text-slate-700 backdrop-blur">
            {tip.category}
          </span>
        </motion.div>

        {/* Title & meta */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-6"
        >
          <h1 className="text-3xl font-black leading-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
            {tip.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <Icon name="user" className="h-4 w-4 text-cyan-600" />
              {tip.author}
            </span>
            <span className="flex items-center gap-1.5">
              <Icon name="calendar" className="h-4 w-4 text-cyan-600" />
              {tip.date}
            </span>
            <span className="flex items-center gap-1.5">
              <Icon name="clock" className="h-4 w-4 text-cyan-600" />
              {tip.readTime} مطالعه
            </span>
            <span className="mr-auto">
              <ShareButton title={tip.title} text={`${tip.category} — مجله سلامت نوبان`} />
            </span>
          </div>
        </motion.div>

        {/* Excerpt */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-5 rounded-2xl bg-cyan-50/70 p-4 text-base font-medium leading-relaxed text-slate-700 dark:bg-cyan-900/20 dark:text-slate-300"
        >
          {tip.excerpt}
        </motion.p>

        {/* Content sections */}
        <div className="mt-8 space-y-8">
          {tip.content.map((sec, i) => (
            <motion.section
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex items-center gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-sm font-black text-white">
                  {(i + 1).toLocaleString("fa-IR")}
                </span>
                <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 sm:text-2xl">
                  {sec.heading}
                </h2>
              </div>
              <p className="mt-3 pr-11 text-base leading-relaxed text-slate-600 dark:text-slate-300">
                {sec.body}
              </p>
            </motion.section>
          ))}
        </div>

        {/* Share / CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 flex flex-col items-center justify-between gap-4 rounded-3xl bg-gradient-to-l from-cyan-50 to-blue-50 p-6 ring-1 ring-inset ring-cyan-100 sm:flex-row dark:from-cyan-900/20 dark:to-blue-900/20 dark:ring-cyan-800"
        >
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
              نیاز به مشاوره پزشکی دارید؟
            </h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              از متخصصان نوبان نوبت بگیرید.
            </p>
          </div>
          <button
            onClick={() => navigate("doctors")}
            data-cursor="hover"
            className="flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/30 transition hover:scale-105"
          >
            <Icon name="stethoscope" className="h-4 w-4" />
            مشاهده پزشکان
          </button>
        </motion.div>

        {/* Related articles */}
        <div className="mt-12">
          <h3 className="mb-5 text-xl font-black text-slate-900 dark:text-slate-100">
            مقالات مرتبط
          </h3>
          <div className="grid gap-4 sm:grid-cols-3">
            {related.map((r, i) => (
              <motion.button
                key={r.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                onClick={() => navigate("article", undefined, String(r.id))}
                data-cursor="hover"
                className="group overflow-hidden rounded-2xl glass text-right transition hover:shadow-lg"
              >
                <div className={`relative h-24 bg-gradient-to-br ${r.color}`}>
                  <span className="absolute inset-0 grid place-items-center text-3xl">
                    {r.emoji}
                  </span>
                </div>
                <div className="p-3">
                  <div className="text-[10px] font-bold text-cyan-600">
                    {r.category}
                  </div>
                  <div className="mt-1 line-clamp-2 text-sm font-bold text-slate-900 dark:text-slate-100">
                    {r.title}
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-400">
                    <Icon name="clock" className="h-3 w-3" />
                    {r.readTime}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
