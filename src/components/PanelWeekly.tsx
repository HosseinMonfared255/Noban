"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const toFa = (s: string | number) => String(s).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);

/* ---------------- Jalali calendar helpers ---------------- */
const div = (a: number, b: number) => Math.floor(a / b);
const mod = (a: number, b: number) => a - div(a, b) * b;

function jalCal(jy: number) {
  const breaks = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178];
  const bl = breaks.length;
  const gy = jy + 621;
  let leapJ = -14, jp = breaks[0], jm = 0, jump = 0;
  for (let i = 1; i < bl; i += 1) { jm = breaks[i]; jump = jm - jp; if (jy < jm) break; leapJ = leapJ + div(jump, 33) * 8 + div(mod(jump, 33), 4); jp = jm; }
  let leap = leapJ + div(div(jy - jp, 33) * 8 + mod(jy - jp, 33) + 3, 4);
  if (mod(jump, 33) === 4 && jump - leap === 5) leap -= 1;
  const leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150;
  const march = 20 + leap - leapG;
  return { leap, gy, march };
}
function g2d(gy: number, gm: number, gd: number) {
  let d = div((gy + div(gm - 8, 6) + 100100) * 1461, 4) + div(153 * mod(gm + 9, 12) + 2, 5) + gd - 34840408;
  d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752;
  return d;
}
function d2g(jdn: number) {
  let j = 4 * jdn + 139361631;
  j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;
  const i = div(mod(j, 1461), 4) * 5 + 308;
  return { gy: div(j, 1461) - 100100 + div(8 - (mod(div(i, 153), 12) + 1), 6), gm: mod(div(i, 153), 12) + 1, gd: div(mod(i, 153), 5) + 1 };
}
function j2d(jy: number, jm: number, jd: number) { const r = jalCal(jy); return g2d(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1; }
function d2j(jdn: number) {
  const gy = d2g(jdn).gy;
  let jy = gy - 621, r = jalCal(jy), k = jdn - g2d(gy, 3, r.march);
  if (k >= 0) { if (k <= 185) return { jy, jm: 1 + div(k, 31), jd: mod(k, 31) + 1 }; k -= 186; }
  else { jy -= 1; k += 179; if (r.leap === 1) k += 1; }
  return { jy, jm: 7 + div(k, 30), jd: mod(k, 30) + 1 };
}
const toJalaali = (d: Date) => d2j(g2d(d.getFullYear(), d.getMonth() + 1, d.getDate()));
const toGregorian = (jy: number, jm: number, jd: number) => d2g(j2d(jy, jm, jd));
function jMonthLength(jy: number, jm: number) { if (jm <= 6) return 31; if (jm <= 11) return 30; return jalCal(jy).leap === 0 ? 30 : 29; }

const MONTHS = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"];
const WD = ["ش", "ی", "د", "س", "چ", "پ", "ج"];
const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const isoOf = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const pWeekday = (d: Date) => (d.getDay() + 1) % 7;
const fmtDate = (d: Date) => new Intl.DateTimeFormat("fa-IR", { day: "numeric", month: "long", year: "numeric" }).format(d);

type DaySet = { closed: boolean; open: string; close: string; interval: number };
const DEF: DaySet = { closed: false, open: "09:00", close: "18:00", interval: 15 };

export default function PanelWeekly() {
  const nextSaturday = () => { const t = new Date(); return addDays(t, (6 - t.getDay() + 7) % 7); };
  const [from, setFrom] = useState<Date>(nextSaturday());
  const [to, setTo] = useState<Date>(addDays(nextSaturday(), 13));
  const [picker, setPicker] = useState<"from" | "to" | null>(null);
  const [calMonth, setCalMonth] = useState(() => { const j = toJalaali(new Date()); return { jy: j.jy, jm: j.jm }; });

  const [days, setDays] = useState<Record<string, DaySet>>({});
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [openT, setOpenT] = useState("09:00");
  const [closeT, setCloseT] = useState("18:00");
  const [interval, setInterval] = useState(15);

  const list = useMemo(() => { const arr: Date[] = []; for (let d = new Date(from); d <= to; d = addDays(d, 1)) arr.push(new Date(d)); return arr.slice(0, 60); }, [from, to]);
  const leadPad = pWeekday(from);

  const get = (d: Date): DaySet => days[isoOf(d)] ?? DEF;
  const setDay = (d: Date, patch: Partial<DaySet>) => setDays((p) => ({ ...p, [isoOf(d)]: { ...(p[isoOf(d)] ?? DEF), ...patch } }));
  const toggleSel = (d: Date) => setSel((prev) => { const n = new Set(prev); const k = isoOf(d); n.has(k) ? n.delete(k) : n.add(k); return n; });
  const apply = (patch: Partial<DaySet>, all = false) => {
    const targets = all ? list : list.filter((d) => sel.has(isoOf(d)));
    if (!all && targets.length === 0) return;
    targets.forEach((d) => setDay(d, patch));
  };
  const allSel = list.length > 0 && list.every((d) => sel.has(isoOf(d)));

  const pickDate = (jy: number, jm: number, jd: number) => {
    const g = toGregorian(jy, jm, jd); const d = new Date(g.gy, g.gm - 1, g.gd);
    if (picker === "from") { setFrom(d); if (d > to) setTo(addDays(d, 6)); }
    else { setTo(d); if (d < from) setFrom(addDays(d, -6)); }
    setPicker(null);
  };

  // calendar grid
  const firstG = toGregorian(calMonth.jy, calMonth.jm, 1);
  const firstDate = new Date(firstG.gy, firstG.gm - 1, firstG.gd);
  const pad = pWeekday(firstDate);
  const dim = jMonthLength(calMonth.jy, calMonth.jm);
  const todayJ = toJalaali(new Date());

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black text-slate-900">برنامه هفتگی</h1>
        <p className="text-sm text-slate-500">بازه را انتخاب کنید، سپس روی روزها بزنید تا ساعت کاری یا تعطیلی را تنظیم کنید.</p>
      </div>

      {/* range */}
      <div className="rounded-3xl glass p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <button onClick={() => setPicker("from")} data-cursor="hover" className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-right transition hover:border-cyan-400">
            <span className="text-xs font-medium text-slate-500">از تاریخ</span>
            <span className="font-bold text-slate-800">{toFa(fmtDate(from))}</span>
          </button>
          <button onClick={() => setPicker("to")} data-cursor="hover" className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-right transition hover:border-cyan-400">
            <span className="text-xs font-medium text-slate-500">تا تاریخ</span>
            <span className="font-bold text-slate-800">{toFa(fmtDate(to))}</span>
          </button>
        </div>
      </div>

      {/* day grid */}
      <div className="rounded-3xl glass p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-slate-900">روزهای انتخاب‌شده: {toFa(sel.size)}</h3>
          <div className="flex gap-2">
            <button onClick={() => setSel(allSel ? new Set() : new Set(list.map(isoOf)))} data-cursor="hover" className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:border-cyan-400 hover:text-cyan-700">{allSel ? "لغو همه" : "انتخاب همه"}</button>
            <button onClick={() => setSel(new Set())} data-cursor="hover" className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:border-rose-300 hover:text-rose-600">پاک کردن</button>
          </div>
        </div>

        {/* weekday header */}
        <div className="mb-1.5 grid grid-cols-7 gap-1.5">
          {WD.map((w) => <div key={w} className="text-center text-[11px] font-bold text-slate-400">{w}</div>)}
        </div>
        {/* boxes */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {Array.from({ length: leadPad }).map((_, i) => <div key={`p${i}`} />)}
          {list.map((d) => {
            const s = get(d);
            const j = toJalaali(d);
            const isSel = sel.has(isoOf(d));
            return (
              <button key={isoOf(d)} onClick={() => toggleSel(d)} data-cursor="hover" className={`flex aspect-square flex-col items-center justify-center rounded-xl border-2 p-1 transition ${s.closed ? "border-rose-300 bg-rose-50" : "border-cyan-500 bg-cyan-50"} ${isSel ? "ring-2 ring-cyan-500 ring-offset-1" : ""}`}>
                <span className="text-[9px] font-bold text-slate-400">{WD[pWeekday(d)]}</span>
                <span className="text-sm font-black text-slate-800 sm:text-base">{toFa(j.jd)}</span>
                <span className={`text-[8px] font-bold ${s.closed ? "text-rose-500" : "text-cyan-600"}`}>{s.closed ? "تعطیل" : `${toFa(s.open.slice(0, 2))}`}</span>
              </button>
            );
          })}
        </div>

        {/* legend */}
        <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded border-2 border-cyan-500 bg-cyan-50" />کاری</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded border-2 border-rose-300 bg-rose-50" />تعطیل</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded border-2 border-cyan-500 ring-2 ring-cyan-500" />انتخاب‌شده</span>
        </div>
      </div>

      {/* config */}
      <div className="rounded-3xl glass p-4">
        <div className="mb-3 text-xs font-bold text-slate-500">اعمال به {toFa(sel.size)} روز انتخاب‌شده (یا همه‌ی روزها)</div>
        <div className="grid gap-3 lg:grid-cols-[1fr_1fr_auto]">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">از</span>
            <input type="time" value={openT} onChange={(e) => setOpenT(e.target.value)} className="input w-full px-2 py-2 text-sm" data-cursor="text" />
            <span className="text-xs text-slate-500">تا</span>
            <input type="time" value={closeT} onChange={(e) => setCloseT(e.target.value)} className="input w-full px-2 py-2 text-sm" data-cursor="text" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">بازه ویزیت</span>
            {[15, 20, 30, 45, 60].map((m) => <button key={m} onClick={() => setInterval(m)} data-cursor="hover" className={`rounded-lg border px-2.5 py-1.5 text-xs font-bold ${interval === m ? "border-cyan-500 bg-cyan-50 text-cyan-700" : "border-slate-200 bg-white text-slate-500"}`}>{toFa(m)}</button>)}
            <input type="number" min={5} value={interval} onChange={(e) => setInterval(+e.target.value || 15)} className="input w-16 px-2 py-2 text-sm" data-cursor="text" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => apply({ open: openT, close: closeT, interval, closed: false })} data-cursor="hover" className="flex-1 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-3 py-2 text-xs font-bold text-white">اعمال ساعت</button>
            <button onClick={() => apply({ open: openT, close: closeT, interval, closed: false }, true)} data-cursor="hover" className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:border-cyan-400">همه</button>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
          <button onClick={() => apply({ closed: true })} data-cursor="hover" className="flex items-center gap-1.5 rounded-lg bg-rose-50 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-100">تعطیل کردن انتخاب‌شده‌ها</button>
          <button onClick={() => apply({ closed: true }, true)} data-cursor="hover" className="flex items-center gap-1.5 rounded-lg bg-rose-50 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-100">تعطیل کردن همه</button>
          <button onClick={() => apply({ closed: false })} data-cursor="hover" className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-600 hover:bg-emerald-100">باز کردن انتخاب‌شده‌ها</button>
        </div>
      </div>

      {/* calendar popup */}
      <AnimatePresence>
        {picker && (
          <motion.div key="cal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPicker(null)} className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} onClick={(e) => e.stopPropagation()} className="glass w-full max-w-xs rounded-3xl p-4">
              <div className="mb-3 flex items-center justify-between">
                <button onClick={() => setCalMonth((c) => c.jm === 1 ? { jy: c.jy - 1, jm: 12 } : { jy: c.jy, jm: c.jm - 1 })} data-cursor="hover" className="grid h-8 w-8 place-items-center rounded-lg bg-white/70 text-slate-500">›</button>
                <div className="font-bold text-slate-900">{toFa(MONTHS[calMonth.jm - 1])} {toFa(calMonth.jy)}</div>
                <button onClick={() => setCalMonth((c) => c.jm === 12 ? { jy: c.jy + 1, jm: 1 } : { jy: c.jy, jm: c.jm + 1 })} data-cursor="hover" className="grid h-8 w-8 place-items-center rounded-lg bg-white/70 text-slate-500">‹</button>
              </div>
              <div className="mb-1 grid grid-cols-7 gap-1">{WD.map((w) => <div key={w} className="text-center text-[11px] font-bold text-slate-400">{w}</div>)}</div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: pad }).map((_, i) => <div key={`p${i}`} />)}
                {Array.from({ length: dim }).map((_, i) => {
                  const jd = i + 1;
                  const isToday = todayJ.jy === calMonth.jy && todayJ.jm === calMonth.jm && todayJ.jd === jd;
                  return (
                    <button key={jd} onClick={() => pickDate(calMonth.jy, calMonth.jm, jd)} data-cursor="hover" className={`grid aspect-square place-items-center rounded-lg text-sm font-bold transition ${isToday ? "bg-cyan-600 text-white" : "bg-white text-slate-700 hover:bg-cyan-50 hover:text-cyan-700"}`}>{toFa(jd)}</button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
