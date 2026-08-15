"use client";

import { motion } from "framer-motion";
import { specialties } from "../data";
import Icon from "./Icon";
import { useHorizontalScroll } from "../utils/useHorizontalScroll";

export default function Specialties() {
  const scroller = useHorizontalScroll<HTMLDivElement>();
  const nudge = (dir: number) =>
    scroller.current?.scrollBy({ left: dir * 340, behavior: "smooth" });

  return (
    <section id="specialties" className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-1.5 text-sm font-semibold text-cyan-700">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
              تخصص‌ها
            </span>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              هر تخصصی که نیاز دارید
            </h2>
            <p className="mt-3 text-base leading-relaxed text-slate-500">
              روی تخصص موردنظر بزنید تا مستقیم به رزرو نوبت بروید.
            </p>
          </div>
          <div className="hidden gap-2 sm:flex">
            <button
              onClick={() => nudge(1)}
              data-cursor="hover"
              aria-label="قبلی"
              className="grid h-11 w-11 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-cyan-300 hover:text-cyan-700"
            >
              <Icon name="arrow" className="h-5 w-5" />
            </button>
            <button
              onClick={() => nudge(-1)}
              data-cursor="hover"
              aria-label="بعدی"
              className="grid h-11 w-11 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-cyan-300 hover:text-cyan-700"
            >
              <Icon name="arrow" className="h-5 w-5 rotate-180" />
            </button>
          </div>
        </div>

        <motion.div
          ref={scroller}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="no-scrollbar mt-8 flex snap-x gap-4 overflow-x-auto pb-3"
        >
          {specialties.map((s, i) => (
            <motion.a
              key={s.name}
              href="#booking"
              data-cursor="hover"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (i % 4) * 0.05 }}
              whileHover={{ y: -6 }}
              className="group relative flex w-44 shrink-0 snap-start flex-col items-center gap-3 overflow-hidden rounded-3xl glass p-6 text-center"
            >
              <div className="absolute inset-0 -z-10 translate-y-full bg-gradient-to-b from-cyan-100/50 to-transparent transition-transform duration-300 group-hover:translate-y-0" />
              <span className="grid h-16 w-16 place-items-center rounded-2xl bg-white text-3xl shadow-sm ring-1 ring-cyan-100 transition group-hover:scale-110">
                {s.icon}
              </span>
              <div>
                <div className="font-bold text-slate-900">{s.name}</div>
                <div className="mt-1 text-xs font-medium text-cyan-600">
                  {s.count} پزشک
                </div>
              </div>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
