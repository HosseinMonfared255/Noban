"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Icon from "./Icon";
import { useFocusTrap } from "../utils/useFocusTrap";

const toFa = (s: string | number) =>
  String(s).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);

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

type DayT = {
  name: string;
  date: string;
  status: "closed" | "full" | "open";
  slots: { time: string; booked: boolean }[];
};

function buildSchedule(seed: string): DayT[] {
  const start = startSaturday();
  return DAY_NAMES.map((name, i) => {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const dateStr = fmtDate(date);
    if (name === "جمعه" || hashStr(seed + "c" + i) % 6 === 0)
      return { name, date: dateStr, status: "closed", slots: [] };
    const full = hashStr(seed + "f" + i) % 4 === 1;
    const slots = TIMES.map((time, k) => ({
      time,
      booked: full || hashStr(seed + i + time + k) % 3 === 0,
    }));
    return {
      name,
      date: dateStr,
      status: slots.every((s) => s.booked) ? "full" : "open",
      slots,
    };
  });
}

export default function RescheduleModal({
  open,
  appointment,
  onConfirm,
  onClose,
}: {
  open: boolean;
  appointment: {
    id: string;
    doctorName: string;
    dayName: string;
    date: string;
    slot: string;
  } | null;
  onConfirm: (id: string, dayName: string, date: string, slot: string) => void;
  onClose: () => void;
}) {
  const [schedule, setSchedule] = useState<DayT[]>([]);
  const [selectedDay, setSelectedDay] = useState(0);
  const [slot, setSlot] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(panelRef, open);

  useEffect(() => {
    if (open && appointment) {
      const sch = buildSchedule(appointment.doctorName + appointment.id);
      setSchedule(sch);
      const idx = sch.findIndex((d) => d.status === "open");
      setSelectedDay(idx >= 0 ? idx : 0);
      setSlot("");
    }
  }, [open, appointment]);

  const confirm = () => {
    if (!appointment || !slot) return;
    const day = schedule[selectedDay];
    onConfirm(appointment.id, day.name, day.date, slot);
    toast.success("نوبت جابه‌جا شد", {
      description: `${day.name} ساعت ${toFa(slot)}`,
      icon: "📅",
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {open && appointment && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[210] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          aria-hidden={!open}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="جابه‌جایی نوبت"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="glass w-full max-w-lg overflow-hidden rounded-3xl shadow-2xl"
          >
            {/* header */}
            <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
                  <Icon name="calendar" className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                    جابه‌جایی نوبت
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {appointment.doctorName}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                data-cursor="hover"
                className="grid h-8 w-8 place-items-center rounded-lg bg-white/70 text-slate-500 dark:bg-slate-800/70"
                aria-label="بستن"
              >
                <Icon name="close" className="h-4 w-4" />
              </button>
            </div>

            {/* current appointment info */}
            <div className="border-b border-slate-100 bg-cyan-50/50 p-3 text-center text-xs dark:border-slate-700 dark:bg-cyan-900/10">
              <span className="text-slate-500 dark:text-slate-400">نوبت فعلی: </span>
              <span className="font-bold text-slate-700 dark:text-slate-200">
                {appointment.dayName} · {appointment.date} ساعت {toFa(appointment.slot)}
              </span>
            </div>

            {/* day picker */}
            <div className="p-4">
              <div className="mb-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                روز جدید را انتخاب کنید
              </div>
              <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
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
                          ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 dark:border-slate-700 dark:bg-slate-800"
                          : d.status === "full"
                          ? "cursor-not-allowed border-rose-200 bg-rose-50 text-rose-400"
                          : sel
                          ? "border-transparent bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow"
                          : "border-slate-200 bg-white text-slate-700 hover:border-cyan-300 dark:border-slate-600 dark:bg-slate-800"
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

              {/* slot picker */}
              {schedule[selectedDay]?.status === "open" && (
                <>
                  <div className="mt-4 mb-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                    ساعت جدید را انتخاب کنید
                  </div>
                  <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5">
                    {schedule[selectedDay].slots.map((s) => (
                      <button
                        key={s.time}
                        disabled={s.booked}
                        onClick={() => setSlot(s.time)}
                        data-cursor={s.booked ? undefined : "hover"}
                        className={`rounded-xl border py-2.5 text-sm font-bold transition ${
                          s.booked
                            ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400 line-through dark:border-slate-700 dark:bg-slate-800"
                            : slot === s.time
                            ? "border-cyan-500 bg-cyan-50 text-cyan-700 ring-1 ring-cyan-300 dark:bg-cyan-900/20"
                            : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-900/20"
                        }`}
                      >
                        {toFa(s.time)}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {schedule[selectedDay]?.status !== "open" && (
                <p className="mt-4 rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-400 dark:bg-slate-800">
                  این روز قابل رزرو نیست؛ روز دیگری انتخاب کنید.
                </p>
              )}
            </div>

            {/* footer */}
            <div className="flex items-center justify-between border-t border-slate-100 p-4 dark:border-slate-700">
              <button
                onClick={onClose}
                data-cursor="hover"
                className="rounded-xl px-4 py-2 text-sm font-bold text-slate-500 transition hover:text-slate-700"
              >
                انصراف
              </button>
              <button
                onClick={confirm}
                disabled={!slot}
                data-cursor={slot ? "hover" : undefined}
                className={`flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-bold transition ${
                  slot
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30"
                    : "cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-700"
                }`}
              >
                <Icon name="check" className="h-4 w-4" />
                تأیید جابه‌جایی
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
