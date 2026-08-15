"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { doctors, type Doctor } from "../data";
import TiltCard from "../components/TiltCard";
import Icon from "../components/Icon";
import FavoriteButton from "../components/FavoriteButton";
import CompareButton from "../components/CompareButton";

import type { Nav } from "../nav";

type SortKey = "rating" | "experience";
type View = "grid" | "table";

const TABLE_COLS =
  "grid-cols-[2.2fr_1.3fr_0.8fr_0.8fr_1.3fr_1fr_1.4fr]";

export default function DoctorsPage({ navigate }: { navigate: Nav }) {
  const [q, setQ] = useState("");
  const [spec, setSpec] = useState("همه");
  const [sort, setSort] = useState<SortKey>("rating");
  const [view, setView] = useState<View>("grid");

  const allSpecs = useMemo(
    () => ["همه", ...Array.from(new Set(doctors.map((d) => d.specialty)))],
    []
  );

  const list = useMemo(() => {
    const needle = q.trim();
    const filtered = doctors.filter(
      (d) =>
        (spec === "همه" || d.specialty === spec) &&
        (needle === "" ||
          d.name.includes(needle) ||
          d.specialty.includes(needle))
    );
    return [...filtered].sort((a, b) =>
      sort === "rating" ? b.rating - a.rating : b.experience - a.experience
    );
  }, [q, spec, sort]);

  return (
    <div className="min-h-screen pb-10 pt-28">
      {/* header band */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 right-10 h-72 w-72 rounded-full bg-cyan-200/30 blur-3xl" />
          <div className="absolute top-10 left-0 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" />
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

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl"
          >
            لیست کامل پزشکان
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600"
          >
            از میان {doctors.length.toLocaleString("fa-IR")} پزشک متخصص، بهترین گزینه
            را پیدا کنید. جست‌وجو، فیلتر بر اساس تخصص و مرتب‌سازی در دسترس شماست.
          </motion.p>
        </div>
      </section>

      {/* toolbar */}
      <section className="sticky top-[4.75rem] z-30 mt-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="glass rounded-2xl p-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              {/* search */}
              <div className="relative flex-1">
                <Icon
                  name="search"
                  className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-cyan-600"
                />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="جست‌وجوی نام پزشک یا تخصص…"
                  className="input pr-11"
                  data-cursor="text"
                />
              </div>

              {/* sort */}
              <div className="relative md:w-52">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="input appearance-none pl-9"
                >
                  <option value="rating" className="bg-white">
                    بالاترین امتیاز
                  </option>
                  <option value="experience" className="bg-white">
                    بیشترین تجربه
                  </option>
                </select>
                <Icon
                  name="arrow"
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-slate-400"
                />
              </div>

              {/* view toggle — desktop only */}
              <div className="hidden items-center rounded-xl border border-slate-200 bg-white p-1 lg:flex">
                <button
                  onClick={() => setView("grid")}
                  data-cursor="hover"
                  aria-label="نمایش کارتی"
                  className={`grid h-9 w-9 place-items-center rounded-lg transition ${
                    view === "grid"
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow"
                      : "text-slate-500 hover:text-cyan-700"
                  }`}
                >
                  <Icon name="grid" className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setView("table")}
                  data-cursor="hover"
                  aria-label="نمایش جدولی"
                  className={`grid h-9 w-9 place-items-center rounded-lg transition ${
                    view === "table"
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow"
                      : "text-slate-500 hover:text-cyan-700"
                  }`}
                >
                  <Icon name="list" className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* specialty chips */}
            <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
              {allSpecs.map((s) => (
                <button
                  key={s}
                  onClick={() => setSpec(s)}
                  data-cursor="hover"
                  className={`shrink-0 rounded-xl border px-4 py-2 text-sm font-bold transition ${
                    spec === s
                      ? "border-transparent bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25"
                      : "border-slate-200 bg-white text-slate-600 hover:border-cyan-300"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* results */}
      <section className="mx-auto mt-8 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between">
          <p className="text-sm font-medium text-slate-500">
            {list.length.toLocaleString("fa-IR")} پزشک یافت شد
          </p>
        </div>

        {list.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl glass py-20 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-slate-100 text-slate-400">
              <Icon name="search" className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-800">
              پزشکی با این مشخصات یافت نشد
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              لطفاً عبارت یا فیلتر دیگری را امتحان کنید.
            </p>
            <button
              onClick={() => {
                setQ("");
                setSpec("همه");
              }}
              data-cursor="hover"
              className="mt-5 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:border-cyan-300 hover:text-cyan-700"
            >
              پاک کردن فیلترها
            </button>
          </div>
        ) : (
          <>
            {/* Card grid — mobile always; desktop when view === "grid" */}
            <div
              className={`perspective grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${
                view === "table" ? "lg:hidden" : ""
              }`}
            >
              {list.map((d, i) => (
                <motion.div
                  key={d.name}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.3) }}
                  className="h-full"
                >
                  <DoctorCard d={d} navigate={navigate} />
                </motion.div>
              ))}
            </div>

            {/* Table view — desktop only, when view === "table" */}
            <div className={`hidden ${view === "table" ? "lg:block" : ""}`}>
              <DoctorTable list={list} navigate={navigate} />
            </div>
          </>
        )}
      </section>

      {/* bottom CTA */}
      <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-l from-cyan-100/70 via-blue-100/50 to-transparent p-8 ring-1 ring-inset ring-cyan-200/70 sm:p-12">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cyan-300/30 blur-3xl" />
          <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h3 className="text-2xl font-black text-slate-900 sm:text-3xl">
                پزشک مدنظرتان را پیدا نکردید؟
              </h3>
              <p className="mt-2 max-w-lg text-slate-600">
                نوبان به‌زودی ده‌ها متخصص دیگر را اضافه می‌کند. همین حالا نوبت
                یکی از پزشکان فوق را رزرو کنید.
              </p>
            </div>
            <button
              onClick={() => navigate("home", "#booking")}
              data-cursor="hover"
              className="flex shrink-0 items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-7 py-4 font-bold text-white shadow-xl shadow-cyan-500/30 transition hover:scale-105"
            >
              <Icon name="calendar" className="h-5 w-5" />
              رزرو نوبت
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---------- Compact responsive doctor card ---------- */
function DoctorCard({ d, navigate }: { d: Doctor; navigate: Nav }) {
  return (
    <TiltCard
      intensity={9}
      className="group h-full overflow-hidden rounded-3xl glass"
    >
      <div className="flex h-full sm:flex-col">
        {/* photo */}
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
          <FavoriteButton
            name={d.name}
            className="absolute left-2 top-2 z-10 h-8 w-8"
          />
          <CompareButton
            name={d.name}
            className="absolute left-2 top-12 z-10 h-8 w-8"
          />
        </div>

        {/* info */}
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
            <div className="flex items-center gap-1.5">
              <Icon name="clock" className="h-3.5 w-3.5 text-cyan-600" />
              نوبت بعد: {d.next}
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
              آنلاین
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
  );
}

/* ---------- Table (row) view — desktop ---------- */
function DoctorTable({ list, navigate }: { list: Doctor[]; navigate: Nav }) {
  return (
    <div className="glass overflow-hidden rounded-3xl">
      {/* header */}
      <div
        className={`grid ${TABLE_COLS} gap-3 border-b border-slate-100 bg-white/50 px-5 py-3 text-xs font-bold text-slate-500`}
      >
        <span>پزشک</span>
        <span>تخصص</span>
        <span>امتیاز</span>
        <span>تجربه</span>
        <span>مطب</span>
        <span>ویزیت</span>
        <span className="text-left">نوبت بعد</span>
      </div>

      {/* rows */}
      <div className="divide-y divide-slate-100">
        {list.map((d) => (
          <div
            key={d.name}
            className={`grid ${TABLE_COLS} items-center gap-3 px-5 py-3 transition hover:bg-cyan-50/50`}
          >
            <button
              onClick={() => navigate("doctor", undefined, d.name)}
              data-cursor="hover"
              className="flex items-center gap-3 text-right"
            >
              <img
                src={d.photo}
                alt={d.name}
                loading="lazy"
                className="h-11 w-11 rounded-full object-cover object-top ring-2 ring-white shadow"
              />
              <span className="text-sm font-bold text-slate-800 transition hover:text-cyan-700">
                {d.name}
              </span>
            </button>
            <span className="text-sm text-slate-600">{d.specialty}</span>
            <span className="flex items-center gap-1 text-sm font-bold text-amber-600">
              <Icon name="star" className="h-3.5 w-3.5 fill-amber-500" />
              {d.rating.toLocaleString("fa-IR")}
            </span>
            <span className="text-sm text-slate-600">
              {d.experience.toLocaleString("fa-IR")} سال
            </span>
            <span className="text-sm text-slate-600">{d.location}</span>
            <span className="text-sm font-bold text-slate-800">
              {d.fee.toLocaleString("fa-IR")}{" "}
              <span className="text-xs font-normal text-slate-400">ت</span>
            </span>
            <div className="flex items-center justify-end gap-2">
              <span className="text-xs font-medium text-emerald-600">
                {d.next}
              </span>
              <button
                onClick={() => navigate("home", "#booking")}
                data-cursor="hover"
                className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-3 py-1.5 text-xs font-bold text-white transition hover:shadow-md hover:shadow-cyan-500/30"
              >
                رزرو
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
