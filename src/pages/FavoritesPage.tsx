"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { doctors, type Doctor } from "../data";
import type { Nav } from "../nav";
import Icon from "../components/Icon";
import TiltCard from "../components/TiltCard";
import FavoriteButton from "../components/FavoriteButton";
import { useFavorites } from "../store/favorites";

const toFa = (s: string | number) =>
  String(s).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);

export default function FavoritesPage({ navigate }: { navigate: Nav }) {
  const ids = useFavorites((s) => s.ids);

  const list: Doctor[] = useMemo(
    () => doctors.filter((d) => ids.includes(d.name)),
    [ids]
  );

  return (
    <div className="min-h-screen pb-10 pt-28">
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 right-10 h-72 w-72 rounded-full bg-rose-200/30 blur-3xl" />
          <div className="absolute top-10 left-0 h-72 w-72 rounded-full bg-cyan-200/30 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate("home")}
            data-cursor="hover"
            className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/70 px-4 py-1.5 text-sm font-medium text-slate-600 backdrop-blur transition hover:border-cyan-300 hover:text-cyan-700"
          >
            <Icon name="arrow" className="h-4 w-4 rotate-180" />
            بازگشت به خانه
          </button>

          <div className="flex items-center gap-3">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-rose-400 to-red-500 text-white shadow-lg shadow-rose-500/30">
              <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </span>
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl"
              >
                پزشکان علاقه‌مندی
              </motion.h1>
              <p className="mt-2 text-sm text-slate-500">
                {toFa(list.length)} پزشک ذخیره شده — برای دسترسی سریع نوبت بگیرید.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-7xl px-4 sm:px-6 lg:px-8">
        {list.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl glass py-24 text-center">
            <div className="grid h-20 w-20 place-items-center rounded-2xl bg-rose-50 text-rose-300">
              <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <h3 className="mt-5 text-xl font-black text-slate-800">
              هنوز پزشکی به علاقه‌مندی‌ها اضافه نکرده‌اید
            </h3>
            <p className="mt-2 max-w-sm text-sm text-slate-500">
              با کلیک روی قلب کنار هر پزشک، او را در این بخش ذخیره کنید تا
              سریع‌تر به پروفایلش دسترسی داشته باشید.
            </p>
            <button
              onClick={() => navigate("doctors")}
              data-cursor="hover"
              className="mt-6 flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/30 transition hover:scale-105"
            >
              <Icon name="stethoscope" className="h-4 w-4" />
              مشاهده پزشکان
            </button>
          </div>
        ) : (
          <div className="perspective grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {list.map((d, i) => (
              <motion.div
                key={d.name}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.05, 0.3) }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="h-full"
              >
                <TiltCard
                  intensity={9}
                  className="group relative h-full overflow-hidden rounded-3xl glass"
                >
                  <FavoriteButton
                    name={d.name}
                    className="absolute left-3 top-3 z-10 h-9 w-9"
                  />
                  <div className="flex h-full sm:flex-col">
                    <div className="relative w-24 shrink-0 overflow-hidden sm:w-full sm:h-40">
                      <img
                        src={d.photo}
                        alt={d.name}
                        loading="lazy"
                        className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-white/50 to-transparent" />
                      <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-white/85 px-2 py-0.5 text-[11px] font-bold text-amber-600 shadow-sm backdrop-blur">
                        <Icon name="star" className="h-3 w-3 fill-amber-500" />
                        {d.rating.toLocaleString("fa-IR")}
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col p-3.5 sm:p-4">
                      <h3 className="text-sm font-bold leading-tight text-slate-900 sm:text-base">
                        {d.name}
                      </h3>
                      <span className="mt-1.5 inline-block w-fit rounded-md bg-cyan-50 px-2 py-0.5 text-[11px] font-bold text-cyan-700">
                        {d.specialty}
                      </span>

                      <div className="mt-2.5 space-y-1.5 text-[11px] text-slate-500 sm:text-xs">
                        <div className="flex items-center gap-1.5">
                          <Icon name="stethoscope" className="h-3.5 w-3.5 text-cyan-600" />
                          {d.experience.toLocaleString("fa-IR")} سال تجربه
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Icon name="location" className="h-3.5 w-3.5 text-cyan-600" />
                          {d.location}
                        </div>
                      </div>

                      <div className="mt-auto flex items-center justify-between pt-3">
                        <span className="text-[11px] text-slate-500">
                          ویزیت:{" "}
                          <span className="text-xs font-bold text-slate-800">
                            {d.fee.toLocaleString("fa-IR")}
                          </span>{" "}
                          ت
                        </span>
                        <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600">
                          {d.next}
                        </span>
                      </div>

                      <div className="mt-2.5 grid grid-cols-2 gap-2">
                        <button
                          onClick={() => navigate("doctor", undefined, d.name)}
                          data-cursor="hover"
                          className="flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white py-2 text-xs font-bold text-slate-600 transition hover:border-cyan-300 hover:text-cyan-700"
                        >
                          <Icon name="user" className="h-3.5 w-3.5" />
                          پروفایل
                        </button>
                        <button
                          onClick={() => navigate("home", "#booking")}
                          data-cursor="hover"
                          className="flex items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-2 text-xs font-bold text-white"
                        >
                          <Icon name="calendar" className="h-3.5 w-3.5" />
                          رزرو
                        </button>
                      </div>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
