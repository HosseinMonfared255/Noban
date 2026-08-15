"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { doctors } from "../data";
import Icon from "./Icon";
import FavoriteButton from "./FavoriteButton";
import type { Nav } from "../nav";
import { useHorizontalScroll } from "../utils/useHorizontalScroll";

const toFa = (s: string | number) =>
  String(s).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);

export default function Doctors({ navigate }: { navigate: Nav }) {
  // 6 doctors in a randomized order (stable for the session)
  const six = useMemo(
    () => [...doctors].sort(() => Math.random() - 0.5).slice(0, 6),
    []
  );
  const scroller = useHorizontalScroll<HTMLDivElement>();

  return (
    <section id="doctors" className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-1.5 text-sm font-semibold text-cyan-700">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
            پزشکان منتخب
          </span>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            چند پزشک برتر را ببینید
          </h2>
          <p className="mt-3 text-base leading-relaxed text-slate-500">
            کارت‌ها را به‌صورت افقی بکشید و پزشک دلخواهتان را انتخاب کنید.
          </p>
        </div>

        <div ref={scroller} className="no-scrollbar mt-8 flex snap-x gap-5 overflow-y-hidden overflow-x-auto pb-3">
          {six.map((d, i) => (
            <motion.div
              key={d.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (i % 3) * 0.06 }}
              className="group w-64 shrink-0 snap-start overflow-hidden rounded-3xl glass"
            >
              <div className="relative h-44 overflow-hidden">
                <img
                  src={d.photo}
                  alt={d.name}
                  loading="lazy"
                  className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/30 to-transparent" />
                <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/85 px-2.5 py-1 text-xs font-bold text-amber-600 shadow-sm backdrop-blur">
                  <Icon name="star" className="h-3.5 w-3.5 fill-amber-500" />
                  {toFa(d.rating.toLocaleString("fa-IR"))}
                </div>
                <FavoriteButton
                  name={d.name}
                  className="absolute left-3 top-3 h-9 w-9"
                />
                <span className="absolute bottom-3 right-3 rounded-full bg-cyan-600 px-2.5 py-1 text-[11px] font-bold text-white shadow">
                  {d.specialty}
                </span>
              </div>
              <div className="p-4">
                <h3 className="text-base font-bold text-slate-900">{d.name}</h3>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Icon name="stethoscope" className="h-3.5 w-3.5 text-cyan-600" />
                    {toFa(d.experience)} سال تجربه
                  </span>
                  <span className="flex items-center gap-1 font-medium text-emerald-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {d.next}
                  </span>
                </div>
                <button
                  onClick={() => navigate("doctor", undefined, d.name)}
                  data-cursor="hover"
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-2.5 text-sm font-bold text-white transition hover:shadow-lg hover:shadow-cyan-500/30"
                >
                  <Icon name="user" className="h-4 w-4" />
                  مشاهده پروفایل
                </button>
              </div>
            </motion.div>
          ))}

          {/* view-all tail card */}
          <button
            onClick={() => navigate("doctors")}
            data-cursor="hover"
            className="grid w-40 shrink-0 snap-start place-items-center rounded-3xl border-2 border-dashed border-cyan-300 bg-cyan-50/50 text-center transition hover:bg-cyan-50"
          >
            <div className="p-5">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30">
                <Icon name="arrow" className="h-6 w-6" />
              </span>
              <div className="mt-3 text-sm font-black text-slate-800">
                مشاهده همه پزشکان
              </div>
              <div className="mt-1 text-xs text-cyan-600">
                {toFa(doctors.length.toLocaleString("fa-IR"))} پزشک متخصص
              </div>
            </div>
          </button>
        </div>
      </div>
    </section>
  );
}
