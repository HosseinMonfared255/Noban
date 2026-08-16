"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import type { Doctor } from "../lib/api";
import { getDoctors, getSpecialties } from "../lib/api";
import type { Nav } from "../nav";
import Icon from "../components/Icon";
import { useAppointments } from "../store/appointments";

/* ---------- schedule helpers ---------- */
const DAY_NAMES = [
  "شنبه",
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنجشنبه",
  "جمعه",
];
const TIMES = ["۰۹:۰۰", "۰۹:۳۰", "۱۰:۰۰", "۱۰:۳۰", "۱۱:۰۰", "۱۶:۰۰", "۱۶:۳۰", "۱۷:۰۰", "۱۷:۳۰", "۱۸:۰۰"];
const toFa = (s: string | number) =>
  String(s).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}
function startSaturday(): Date {
  const t = new Date();
  const d = t.getDay();
  const add = (6 - d + 7) % 7;
  const s = new Date(t);
  s.setDate(t.getDate() + add);
  return s;
}
const fmtDate = (d: Date) =>
  new Intl.DateTimeFormat("fa-IR", { day: "numeric", month: "long" }).format(d);

type SlotT = { time: string; booked: boolean };
type DayT = {
  name: string;
  date: string;
  status: "closed" | "full" | "open";
  slots: SlotT[];
};
function buildSchedule(doctor: Doctor): DayT[] {
  const start = startSaturday();
  return DAY_NAMES.map((name, i) => {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const dateStr = fmtDate(date);
    if (name === "جمعه" || hashStr(doctor.name + "c" + i) % 6 === 0)
      return { name, date: dateStr, status: "closed", slots: [] };
    const full = hashStr(doctor.name + "f" + i) % 4 === 1;
    const slots = TIMES.map((time, k) => ({
      time,
      booked: full || hashStr(doctor.name + i + time + k) % 3 === 0,
    }));
    return {
      name,
      date: dateStr,
      status: slots.every((s) => s.booked) ? "full" : "open",
      slots,
    };
  });
}

const STEPS = ["تخصص و پزشک", "روز و ساعت", "اطلاعات بیمار", "پرداخت"];

const variants = {
  enter: (d: number) => ({ opacity: 0, x: d > 0 ? 56 : -56 }),
  center: { opacity: 1, x: 0 },
  exit: (d: number) => ({ opacity: 0, x: d > 0 ? -56 : 56 }),
};

export default function BookingFlow({ navigate }: { navigate: Nav }) {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);

  const [specialty, setSpecialty] = useState("همه");
  const [doctor, setDoctor] = useState<Doctor | null>(null);

  const [selectedDay, setSelectedDay] = useState(0);
  const [slot, setSlot] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [insurance, setInsurance] = useState("بیمه پایه");
  const [desc, setDesc] = useState("");

  const [pay, setPay] = useState<"idle" | "processing" | "done">("idle");

  const [allDocs, setAllDocs] = useState<Doctor[]>([]);
  const [allSpecsData, setAllSpecsData] = useState<string[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [docsResult, specsResult] = await Promise.all([
          getDoctors(),
          getSpecialties()
        ]);
        if (Array.isArray(docsResult)) {
          setAllDocs(docsResult);
          const specs = Array.from(new Set(docsResult.map((d: Doctor) => d.specialty)));
          setAllSpecsData(specs);
        }
      } catch (e) {
        console.error("Failed to load doctors/specialties", e);
      }
    }
    loadData();
  }, []);

  const allSpecs = useMemo(
    () => ["همه", ...allSpecsData],
    [allSpecsData]
  );
  const filtered = useMemo(
    () =>
      specialty === "همه"
        ? allDocs
        : allDocs.filter((d) => d.specialty === specialty),
    [specialty, allDocs]
  );
  const schedule = useMemo(
    () => (doctor ? buildSchedule(doctor) : []),
    [doctor]
  );

  const selectDoctor = (d: Doctor) => {
    setDoctor(d);
    setSlot("");
    setSelectedDay(0);
  };

  const go = (delta: number) => {
    setDir(delta);
    setStep((s) => Math.max(0, Math.min(3, s + delta)));
  };
  const jumpTo = (i: number) => {
    setDir(i < step ? -1 : 1);
    setStep(i);
  };

  const phoneOk = phone.replace(/\D/g, "").length >= 10;
  const canNext =
    step === 0
      ? !!doctor
      : step === 1
      ? !!slot
      : step === 2
      ? !!name.trim() && phoneOk
      : false;

  const reset = () => {
    setStep(0);
    setDoctor(null);
    setSpecialty("همه");
    setSlot("");
    setName("");
    setPhone("");
    setDesc("");
    setPay("idle");
  };

  const doPay = () => {
    setPay("processing");
    setTimeout(() => setPay("done"), 1600);
  };

  // Fire a success toast once payment completes AND save appointment
  const addAppointment = useAppointments((s) => s.add);
  const toasted = useRef(false);
  useEffect(() => {
    if (pay === "done" && !toasted.current && doctor) {
      toasted.current = true;
      const day = schedule[selectedDay];
      addAppointment({
        doctorName: doctor.name,
        doctorPhoto: doctor.photo,
        specialty: doctor.specialty,
        location: doctor.location,
        fee: doctor.fee,
        dayName: day?.name ?? "",
        date: day?.date ?? "",
        slot,
        patientName: name,
        patientPhone: phone,
        insurance,
        trackingCode: "", // Will be generated by the store
      });
      toast.success("نوبت شما با موفقیت ثبت شد!", {
        description: `${doctor.name} — ${day?.name ?? ""} ساعت ${slot}`,
        duration: 5000,
        icon: "✅",
      });
    }
    if (pay !== "done") toasted.current = false;
  }, [pay, doctor, schedule, selectedDay, slot, name, phone, insurance, addAppointment]);

  const progress = (step / (STEPS.length - 1)) * 100;

  return (
    <section id="booking" className="relative py-24">
      <div className="pointer-events-none absolute left-1/2 top-10 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-200/25 blur-3xl" />
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* heading */}
        <div className="mb-10 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-1.5 text-sm font-semibold text-cyan-700">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
            رزرو نوبت در ۴ گام ساده
          </span>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            نوبت خود را سریع و آسان رزرو کنید
          </h2>
          <p className="mt-3 text-base text-slate-500">
            بدون معطلی، مرحله به مرحله پیش بروید و در چند ثانیه نوبت بگیرید.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] glass p-6 sm:p-9">
          {/* ---------- stepper ---------- */}
          <div className="relative mx-auto mb-10 max-w-2xl">
            {/* line */}
            <div className="absolute top-5 right-0 left-0 h-1 rounded-full bg-slate-200" />
            <motion.div
              className="absolute top-5 right-0 h-1 rounded-full bg-gradient-to-l from-cyan-400 to-blue-600"
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            />
            <div className="relative flex justify-between">
              {STEPS.map((label, i) => {
                const done = i < step;
                const active = i === step;
                return (
                  <button
                    key={label}
                    onClick={() => i < step && jumpTo(i)}
                    data-cursor={i < step ? "hover" : undefined}
                    className="flex w-1/4 flex-col items-center gap-2"
                  >
                    <motion.span
                      animate={{
                        scale: active ? 1.12 : 1,
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 18 }}
                      className={`grid h-10 w-10 place-items-center rounded-full text-sm font-black ring-4 ring-white transition-colors ${
                        done
                          ? "bg-gradient-to-br from-emerald-400 to-teal-600 text-white"
                          : active
                          ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/40"
                          : "bg-white text-slate-400 ring-slate-200"
                      }`}
                    >
                      {done ? <Icon name="check" className="h-5 w-5" /> : toFa(i + 1)}
                    </motion.span>
                    <span
                      className={`text-center text-[11px] font-bold sm:text-xs ${
                        active ? "text-cyan-700" : done ? "text-slate-700" : "text-slate-400"
                      }`}
                    >
                      {label}
                    </span>
                    {active && (
                      <motion.span
                        layoutId="stepGlow"
                        className="absolute -bottom-1 h-1 w-10 rounded-full bg-cyan-500"
                        style={{ marginTop: "2.2rem" }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ---------- step content ---------- */}
          <div className="relative min-h-[20rem]">
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={step + (pay === "done" ? "-done" : "")}
                custom={dir}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                {/* STEP 1 */}
                {step === 0 && (
                  <div>
                    <div className="no-scrollbar mb-5 flex gap-2 overflow-x-auto pb-1">
                      {allSpecs.map((s) => (
                        <button
                          key={s}
                          onClick={() => setSpecialty(s)}
                          data-cursor="hover"
                          className={`shrink-0 rounded-xl border px-4 py-2 text-sm font-bold transition ${
                            specialty === s
                              ? "border-transparent bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow"
                              : "border-slate-200 bg-white text-slate-600 hover:border-cyan-300"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                    <div className="grid max-h-72 grid-cols-1 gap-2.5 overflow-y-auto pr-1 sm:grid-cols-2">
                      {filtered.map((d) => {
                        const sel = doctor?.name === d.name;
                        return (
                          <button
                            key={d.name}
                            onClick={() => selectDoctor(d)}
                            data-cursor="hover"
                            className={`flex items-center gap-3 rounded-2xl border p-2.5 text-right transition ${
                              sel
                                ? "border-cyan-500 bg-cyan-50 ring-1 ring-cyan-300"
                                : "border-slate-200 bg-white hover:border-cyan-300"
                            }`}
                          >
                            <img
                              src={d.photo}
                              alt={d.name}
                              loading="lazy"
                              className="h-12 w-12 rounded-xl object-cover object-top"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-bold text-slate-800">
                                {d.name}
                              </div>
                              <div className="text-xs text-cyan-700">{d.specialty}</div>
                            </div>
                            <div className="flex flex-col items-end gap-0.5 text-[11px] text-slate-500">
                              <span className="flex items-center gap-0.5 font-bold text-amber-600">
                                <Icon name="star" className="h-3 w-3 fill-amber-500" />
                                {toFa(d.rating.toLocaleString("fa-IR"))}
                              </span>
                              <span>{toFa(d.fee.toLocaleString("fa-IR"))} ت</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* STEP 2 */}
                {step === 1 && doctor && (
                  <div>
                    <div className="mb-3 flex flex-wrap gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <span className="h-3 w-3 rounded bg-emerald-400" /> آزاد
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="h-3 w-3 rounded bg-rose-300" /> تکمیل
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="h-3 w-3 rounded bg-slate-300" /> تعطیل
                      </span>
                    </div>
                    <div className="no-scrollbar flex gap-2.5 overflow-x-auto pb-1">
                      {schedule.map((d, i) => {
                        const disabled = d.status !== "open";
                        const sel = i === selectedDay;
                        return (
                          <button
                            key={i}
                            disabled={disabled}
                            onClick={() => {
                              setSelectedDay(i);
                              setSlot("");
                            }}
                            data-cursor={disabled ? undefined : "hover"}
                            className={`flex w-20 shrink-0 flex-col items-center rounded-2xl border px-2 py-2.5 transition ${
                              d.status === "closed"
                                ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                                : d.status === "full"
                                ? "cursor-not-allowed border-rose-200 bg-rose-50 text-rose-400"
                                : sel
                                ? "border-transparent bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow"
                                : "border-slate-200 bg-white text-slate-700 hover:border-cyan-300"
                            }`}
                          >
                            <span className="text-xs font-bold">{d.name}</span>
                            <span className="mt-0.5 text-[10px] opacity-70">{d.date}</span>
                            <span className="mt-1 text-[9px] font-semibold">
                              {d.status === "closed" ? "تعطیل" : d.status === "full" ? "تکمیل" : "آزاد"}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {schedule[selectedDay]?.status === "open" && (
                      <div className="mt-4 grid grid-cols-3 gap-2.5 sm:grid-cols-5">
                        {schedule[selectedDay].slots.map((s) => (
                          <button
                            key={s.time}
                            disabled={s.booked}
                            onClick={() => setSlot(s.time)}
                            data-cursor={s.booked ? undefined : "hover"}
                            className={`rounded-xl border py-2.5 text-sm font-bold transition ${
                              s.booked
                                ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400 line-through"
                                : slot === s.time
                                ? "border-cyan-500 bg-cyan-50 text-cyan-700 ring-1 ring-cyan-300"
                                : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            }`}
                          >
                            {toFa(s.time)}
                          </button>
                        ))}
                      </div>
                    )}
                    {schedule[selectedDay]?.status !== "open" && (
                      <p className="mt-4 rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-400">
                        این روز قابل رزرو نیست؛ روز دیگری انتخاب کنید.
                      </p>
                    )}
                  </div>
                )}

                {/* STEP 3 */}
                {step === 2 && (
                  <div className="mx-auto max-w-lg space-y-3.5">
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-medium text-slate-600">
                        نام و نام خانوادگی
                      </span>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="مثلاً نگار حسینی"
                        className="input"
                        data-cursor="text"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-medium text-slate-600">
                        شماره تماس
                      </span>
                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        inputMode="tel"
                        placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                        className="input"
                        data-cursor="text"
                      />
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="block">
                        <span className="mb-1.5 block text-xs font-medium text-slate-600">
                          نوع بیمه
                        </span>
                        <select
                          value={insurance}
                          onChange={(e) => setInsurance(e.target.value)}
                          className="input appearance-none"
                        >
                          <option className="bg-white">بیمه پایه</option>
                          <option className="bg-white">بیمه تکمیلی</option>
                          <option className="bg-white">آزاد / بدون بیمه</option>
                        </select>
                      </label>
                      <label className="block">
                        <span className="mb-1.5 block text-xs font-medium text-slate-600">
                          شماره ملی (اختیاری)
                        </span>
                        <input
                          className="input"
                          placeholder="۰۰۱۲۳۴۵۶۷۸"
                          data-cursor="text"
                        />
                      </label>
                    </div>
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-medium text-slate-600">
                        شرح مختصر علائم
                      </span>
                      <textarea
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                        rows={3}
                        placeholder="علائم و دلیل مراجعه را بنویسید…"
                        className="input resize-none"
                        data-cursor="text"
                      />
                    </label>
                  </div>
                )}

                {/* STEP 4 */}
                {step === 3 &&
                  (pay === "done" ? (
                    <div className="flex flex-col items-center py-4 text-center">
                      <motion.div
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 12 }}
                        className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 shadow-xl shadow-emerald-500/40"
                      >
                        <Icon name="check" className="h-10 w-10 text-white" />
                      </motion.div>
                      <h3 className="mt-5 text-2xl font-black text-slate-900">
                        پرداخت موفق و نوبت ثبت شد!
                      </h3>
                      <p className="mt-2 max-w-md text-sm text-slate-600">
                        جزئیات کامل رزرو (پزشک، روز، ساعت و کد پیگیری) در{" "}
                        <span className="font-bold text-cyan-700">پروفایل کاربری</span>{" "}
                        شما قابل مشاهده است.
                      </p>
                      <div className="mt-3 rounded-lg border border-dashed border-cyan-300 bg-cyan-50 px-5 py-1.5 text-base font-black tracking-widest text-cyan-700">
                        کد رهگیری: {toFa(62019)}
                      </div>
                      <div className="mt-6 flex flex-wrap justify-center gap-3">
                        <button
                          onClick={() => navigate("doctor", undefined, doctor?.name)}
                          data-cursor="hover"
                          className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/30"
                        >
                          مشاهده پروفایل پزشک
                        </button>
                        <button
                          onClick={reset}
                          data-cursor="hover"
                          className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 hover:border-cyan-300 hover:text-cyan-700"
                        >
                          رزرو نوبت جدید
                        </button>
                      </div>
                    </div>
                  ) : pay === "processing" ? (
                    <div className="flex flex-col items-center py-12 text-center">
                      <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-200 border-t-cyan-600" />
                      <p className="mt-5 font-bold text-slate-700">در حال انجام پرداخت…</p>
                    </div>
                  ) : (
                    <div className="mx-auto max-w-lg">
                      <div className="rounded-2xl bg-cyan-50/70 p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={doctor?.photo}
                            alt=""
                            className="h-12 w-12 rounded-xl object-cover object-top"
                          />
                          <div>
                            <div className="font-bold text-slate-800">{doctor?.name}</div>
                            <div className="text-xs text-cyan-700">{doctor?.specialty}</div>
                          </div>
                        </div>
                        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                          <div className="rounded-lg bg-white/70 py-2">
                            <div className="text-slate-400">روز</div>
                            <div className="font-bold text-slate-700">
                              {schedule[selectedDay]?.name}
                            </div>
                          </div>
                          <div className="rounded-lg bg-white/70 py-2">
                            <div className="text-slate-400">ساعت</div>
                            <div className="font-bold text-slate-700">{toFa(slot)}</div>
                          </div>
                          <div className="rounded-lg bg-white/70 py-2">
                            <div className="text-slate-400">بیمه</div>
                            <div className="font-bold text-slate-700">{insurance}</div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                        <span className="text-sm text-slate-500">
                          مبلغ قابل پرداخت:{" "}
                          <span className="text-lg font-black text-slate-900">
                            {toFa((doctor?.fee ?? 0).toLocaleString("fa-IR"))}
                          </span>{" "}
                          تومان
                        </span>
                        <button
                          onClick={doPay}
                          data-cursor="hover"
                          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/30"
                        >
                          <Icon name="check" className="h-4 w-4" />
                          پرداخت و ثبت نوبت
                        </button>
                      </div>
                    </div>
                  ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ---------- nav ---------- */}
          {!(step === 3 && pay !== "idle") && (
            <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5">
              <button
                onClick={() => go(-1)}
                disabled={step === 0}
                data-cursor={step === 0 ? undefined : "hover"}
                className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                  step === 0
                    ? "cursor-not-allowed text-slate-300"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon name="arrow" className="h-4 w-4" />
                مرحله قبل
              </button>
              {step < 3 && (
                <button
                  onClick={() => canNext && go(1)}
                  disabled={!canNext}
                  data-cursor={canNext ? "hover" : undefined}
                  className={`flex items-center gap-1.5 rounded-xl px-6 py-2.5 text-sm font-bold transition ${
                    canNext
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30"
                      : "cursor-not-allowed bg-slate-100 text-slate-400"
                  }`}
                >
                  مرحله بعد
                  <Icon name="arrow" className="h-4 w-4 rotate-180" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
