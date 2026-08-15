"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import type { Nav } from "../nav";
import Icon from "../components/Icon";
import RescheduleModal from "../components/RescheduleModal";
import { useAppointments, type AppointmentStatus, type Appointment } from "../store/appointments";

const toFa = (s: string | number) =>
  String(s).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);

const TABS: { key: AppointmentStatus | "all"; label: string; icon: string }[] = [
  { key: "upcoming", label: "نوبت‌های پیش‌رو", icon: "calendar" },
  { key: "completed", label: "تکمیل‌شده", icon: "check" },
  { key: "cancelled", label: "لغوشده", icon: "close" },
  { key: "all", label: "همه", icon: "list" },
];

const STATUS_STYLE: Record<AppointmentStatus, { label: string; cls: string }> = {
  upcoming: { label: "پیش‌رو", cls: "bg-cyan-50 text-cyan-700" },
  completed: { label: "تکمیل‌شده", cls: "bg-emerald-50 text-emerald-700" },
  cancelled: { label: "لغوشده", cls: "bg-rose-50 text-rose-600" },
};

export default function AppointmentsPage({ navigate }: { navigate: Nav }) {
  const items = useAppointments((s) => s.items);
  const cancel = useAppointments((s) => s.cancel);
  const reschedule = useAppointments((s) => s.reschedule);
  const [tab, setTab] = useState<AppointmentStatus | "all">("upcoming");
  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(null);

  const filtered = useMemo(
    () => (tab === "all" ? items : items.filter((x) => x.status === tab)),
    [items, tab]
  );

  const counts = useMemo(
    () => ({
      upcoming: items.filter((x) => x.status === "upcoming").length,
      completed: items.filter((x) => x.status === "completed").length,
      cancelled: items.filter((x) => x.status === "cancelled").length,
      all: items.length,
    }),
    [items]
  );

  return (
    <div className="min-h-screen pb-10 pt-28">
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 right-10 h-72 w-72 rounded-full bg-cyan-200/30 blur-3xl" />
          <div className="absolute top-10 left-0 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate("home")}
            data-cursor="hover"
            className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/70 px-4 py-1.5 text-sm font-medium text-slate-600 backdrop-blur transition hover:border-cyan-300 hover:text-cyan-700 dark:border-slate-700 dark:bg-slate-800/70"
          >
            <Icon name="arrow" className="h-4 w-4 rotate-180" />
            بازگشت به خانه
          </button>

          <div className="flex items-center gap-3">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30">
              <Icon name="calendar" className="h-7 w-7" />
            </span>
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl font-black tracking-tight text-slate-900 dark:text-slate-100 sm:text-5xl"
              >
                نوبت‌های من
              </motion.h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                مدیریت رزروهای پزشکی خود را در یک جا داشته باشید.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats summary */}
      <section className="mx-auto mt-8 max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              data-cursor="hover"
              className={`rounded-2xl border p-4 text-right transition ${
                tab === t.key
                  ? "border-cyan-500 bg-cyan-50/70 ring-1 ring-cyan-300 dark:bg-cyan-900/20"
                  : "border-slate-200 bg-white/70 hover:border-cyan-300 dark:border-slate-700 dark:bg-slate-800/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                  {toFa(counts[t.key])}
                </span>
                <Icon
                  name={t.icon}
                  className={`h-5 w-5 ${
                    tab === t.key ? "text-cyan-600" : "text-slate-400"
                  }`}
                />
              </div>
              <div className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                {t.label}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Appointments list */}
      <section className="mx-auto mt-8 max-w-5xl px-4 sm:px-6 lg:px-8">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl glass py-24 text-center">
            <div className="grid h-20 w-20 place-items-center rounded-2xl bg-cyan-50 text-cyan-300 dark:bg-cyan-900/30">
              <Icon name="calendar" className="h-10 w-10" />
            </div>
            <h3 className="mt-5 text-xl font-black text-slate-800 dark:text-slate-100">
              {tab === "upcoming"
                ? "هنوز نوبتی رزرو نکرده‌اید"
                : tab === "all"
                ? "هیچ نوبتی ثبت نشده است"
                : "موردی در این بخش وجود ندارد"}
            </h3>
            <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
              {tab === "upcoming"
                ? "همین حالا اولین نوبت خود را رزرو کنید و اینجا آن را مدیریت کنید."
                : "نوبت‌های گذشته در این بخش نمایش داده می‌شوند."}
            </p>
            {tab === "upcoming" && (
              <button
                onClick={() => navigate("home", "#booking")}
                data-cursor="hover"
                className="mt-6 flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/30 transition hover:scale-105"
              >
                <Icon name="calendar" className="h-4 w-4" />
                رزرو نوبت جدید
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((apt) => {
                const st = STATUS_STYLE[apt.status];
                return (
                  <motion.div
                    key={apt.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, height: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 26 }}
                    className={`overflow-hidden rounded-3xl glass ${
                      apt.status === "cancelled" ? "opacity-60" : ""
                    }`}
                  >
                    <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                      {/* Doctor info */}
                      <div className="flex flex-1 items-center gap-3">
                        <img
                          src={apt.doctorPhoto}
                          alt={apt.doctorName}
                          className="h-14 w-14 rounded-2xl object-cover object-top ring-2 ring-white shadow dark:ring-slate-700"
                        />
                        <div>
                          <div className="font-black text-slate-900 dark:text-slate-100">
                            {apt.doctorName}
                          </div>
                          <div className="text-xs text-cyan-600">
                            {apt.specialty}
                          </div>
                          <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
                            <Icon name="location" className="h-3 w-3" />
                            {apt.location}
                          </div>
                        </div>
                      </div>

                      {/* Appointment details */}
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="text-center">
                          <div className="text-[10px] text-slate-400">روز</div>
                          <div className="text-sm font-bold text-slate-700 dark:text-slate-200">
                            {apt.dayName}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {apt.date}
                          </div>
                        </div>
                        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
                        <div className="text-center">
                          <div className="text-[10px] text-slate-400">ساعت</div>
                          <div className="text-sm font-black text-cyan-700 dark:text-cyan-400">
                            {toFa(apt.slot)}
                          </div>
                        </div>
                        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
                        <div className="text-center">
                          <div className="text-[10px] text-slate-400">کد رهگیری</div>
                          <div className="rounded-md border border-dashed border-cyan-300 bg-cyan-50/70 px-2 py-0.5 text-xs font-black tracking-widest text-cyan-700 dark:bg-cyan-900/20">
                            {toFa(apt.trackingCode)}
                          </div>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${st.cls}`}
                        >
                          {st.label}
                        </span>
                      </div>
                    </div>

                    {/* Footer actions */}
                    {apt.status === "upcoming" && (
                      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-5 py-3 dark:border-slate-700">
                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <Icon name="user" className="h-3.5 w-3.5" />
                            {apt.patientName || "بدون نام"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Icon name="wallet" className="h-3.5 w-3.5" />
                            {toFa(apt.fee.toLocaleString("fa-IR"))} ت
                          </span>
                          <span className="flex items-center gap-1">
                            <Icon name="shield" className="h-3.5 w-3.5" />
                            {apt.insurance}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              navigate("doctor", undefined, apt.doctorName);
                            }}
                            data-cursor="hover"
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:border-cyan-300 hover:text-cyan-700 dark:border-slate-600 dark:bg-slate-800"
                          >
                            مشاهده پزشک
                          </button>
                          <button
                            onClick={() => setRescheduleTarget(apt)}
                            data-cursor="hover"
                            className="flex items-center gap-1 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-600 transition hover:bg-amber-100 dark:bg-amber-900/20"
                          >
                            <Icon name="calendar" className="h-3.5 w-3.5" />
                            جابه‌جایی
                          </button>
                          <button
                            onClick={() => {
                              cancel(apt.id);
                              toast.success("نوبت لغو شد", {
                                description: `${apt.doctorName} — کد ${toFa(apt.trackingCode)}`,
                                icon: "❌",
                              });
                            }}
                            data-cursor="hover"
                            className="flex items-center gap-1 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600 transition hover:bg-rose-100 dark:bg-rose-900/20"
                          >
                            <Icon name="close" className="h-3.5 w-3.5" />
                            لغو نوبت
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </section>

      <RescheduleModal
        open={!!rescheduleTarget}
        appointment={rescheduleTarget}
        onConfirm={(id, dayName, date, slot) => reschedule(id, dayName, date, slot)}
        onClose={() => setRescheduleTarget(null)}
      />
    </div>
  );
}
