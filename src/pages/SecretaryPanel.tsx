"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Nav } from "../nav";
import Icon from "../components/Icon";
import PanelWeekly from "../components/PanelWeekly";

const toFa = (s: string | number) => String(s).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);

type Tab = "board" | "appointments" | "weekly";
const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "board", label: "وضعیت آنلاین مطب", icon: "stethoscope" },
  { id: "appointments", label: "مدیریت نوبت‌ها", icon: "calendar" },
  { id: "weekly", label: "برنامه هفتگی", icon: "clock" },
];

/* ---------- seats ---------- */
type Seat = { id: number; occupied: boolean };
/* ---------- queue ---------- */
type QStatus = "waiting" | "in" | "done";
type QPatient = { id: number; name: string; time: string; status: QStatus };
/* ---------- appointments ---------- */
type Appt = { id: number; patient: string; doctor: string; day: string; time: string };
const DAYS = ["امروز", "فردا", "پس‌فردا", "یک هفته بعد"];
const TIMES = ["۰۹:۰۰", "۰۹:۳۰", "۱۰:۰۰", "۱۰:۳۰", "۱۱:۰۰", "۱۶:۰۰", "۱۶:۳۰", "۱۷:۰۰", "۱۷:۳۰", "۱۸:۰۰"];

export default function SecretaryPanel({ navigate }: { navigate: Nav }) {
  const [tab, setTab] = useState<Tab>("board");

  // seats
  const [seats, setSeats] = useState<Seat[]>(Array.from({ length: 6 }, (_, i) => ({ id: i + 1, occupied: i < 3 })));
  const toggleSeat = (id: number) => setSeats((p) => p.map((s) => (s.id === id ? { ...s, occupied: !s.occupied } : s)));
  const addSeat = () => setSeats((p) => [...p, { id: Date.now(), occupied: false }]);
  const removeSeat = () => setSeats((p) => (p.length > 0 ? p.slice(0, -1) : p));

  const filled = seats.filter((s) => s.occupied).length;
  const ratio = seats.length ? filled / seats.length : 0;
  const crowd = ratio === 0 ? { t: "باز", c: "text-emerald-600 bg-emerald-50", bar: "bg-emerald-500" }
    : ratio < 0.4 ? { t: "آزاد", c: "text-emerald-600 bg-emerald-50", bar: "bg-emerald-500" }
    : ratio < 0.75 ? { t: "متوسط", c: "text-amber-600 bg-amber-50", bar: "bg-amber-500" }
    : { t: "شلوغ", c: "text-rose-600 bg-rose-50", bar: "bg-rose-500" };

  // queue
  const [queue, setQueue] = useState<QPatient[]>([
    { id: 1, name: "نگار حسینی", time: "۰۹:۰۰", status: "done" },
    { id: 2, name: "محمد رستمی", time: "۰۹:۳۰", status: "in" },
    { id: 3, name: "زهرا کاظمی", time: "۱۰:۰۰", status: "waiting" },
    { id: 4, name: "سینا ملکی", time: "۱۰:۳۰", status: "waiting" },
    { id: 5, name: "پریسا اکبری", time: "۱۱:۰۰", status: "waiting" },
  ]);
  const promoteNext = (q: QPatient[]): QPatient[] => {
    const i = q.findIndex((x) => x.status === "waiting");
    return i === -1 ? q : q.map((x, k) => (k === i ? { ...x, status: "in" as QStatus } : x));
  };
  const finishCurrent = () => setQueue((q) => promoteNext(q.map((x) => (x.status === "in" ? { ...x, status: "done" as QStatus } : x))));
  const callNext = () => setQueue((q) => (q.some((x) => x.status === "in") ? q : promoteNext(q)));
  const removePatient = (id: number) => setQueue((q) => { const nq = q.filter((x) => x.id !== id); return nq.some((x) => x.status === "in") ? nq : promoteNext(nq); });
  const movePatient = (id: number, dir: -1 | 1) => setQueue((q) => { const i = q.findIndex((x) => x.id === id); const j = i + dir; if (i < 0 || j < 0 || j >= q.length) return q; const nq = [...q]; [nq[i], nq[j]] = [nq[j], nq[i]]; return nq; });

  const current = queue.find((q) => q.status === "in");
  const waiting = queue.filter((q) => q.status === "waiting");
  const done = queue.filter((q) => q.status === "done");

  // appointments
  const [appts, setAppts] = useState<Appt[]>([
    { id: 9001, patient: "نگار حسینی", doctor: "دکتر سارا محمدی", day: "امروز", time: "۰۹:۰۰" },
    { id: 9002, patient: "محمد رستمی", doctor: "دکتر سارا محمدی", day: "امروز", time: "۰۹:۳۰" },
    { id: 9003, patient: "زهرا کاظمی", doctor: "دکتر سارا محمدی", day: "امروز", time: "۱۰:۰۰" },
    { id: 9004, patient: "سینا ملکی", doctor: "دکتر علی رضایی", day: "فردا", time: "۱۱:۰۰" },
  ]);
  const [edit, setEdit] = useState<Appt | null>(null);
  const saveAppt = (a: Appt) => { setAppts((p) => p.map((x) => (x.id === a.id ? a : x))); setEdit(null); };

  return (
    <div className="min-h-screen pb-12 pt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* sticky mobile tabs */}
        <div className="sticky top-[4.5rem] z-30 mb-5 lg:hidden">
          <div className="no-scrollbar flex gap-2 overflow-x-auto rounded-2xl glass p-2">
            {TABS.map((t) => <button key={t.id} onClick={() => setTab(t.id)} data-cursor="hover" className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${tab === t.id ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white" : "text-slate-600"}`}><Icon name={t.icon} className="h-4 w-4" />{t.label}</button>)}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl glass p-4">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white"><Icon name="user" className="h-6 w-6" /></span>
                <div><div className="font-bold text-slate-900">منشی مطب</div><div className="text-xs text-cyan-700">پنل منشی</div></div>
              </div>
            </div>
            <nav className="mt-3 hidden gap-1.5 rounded-3xl glass p-2 lg:flex lg:flex-col">
              {TABS.map((t) => <button key={t.id} onClick={() => setTab(t.id)} data-cursor="hover" className={`flex items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-bold transition ${tab === t.id ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25" : "text-slate-600 hover:bg-slate-100"}`}><Icon name={t.icon} className="h-5 w-5" />{t.label}</button>)}
              <button onClick={() => navigate("home")} data-cursor="hover" className="mt-1 flex items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-bold text-slate-500 transition hover:bg-slate-100"><Icon name="logout" className="h-5 w-5" />بازگشت به سایت</button>
            </nav>
          </aside>

          <section>
            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>

                {/* ===== ONLINE BOARD ===== */}
                {tab === "board" && (
                  <div className="space-y-3 lg:space-y-5">
                    <div className="flex items-center justify-between">
                      <h1 className="text-lg font-black text-slate-900 sm:text-2xl">وضعیت آنلاین مطب</h1>
                      <span className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[11px] font-bold text-emerald-600"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />پخش زنده</span>
                    </div>

                    {/* status + seats compact */}
                    <div className="grid gap-3 lg:grid-cols-2">
                      <div className="overflow-hidden rounded-2xl bg-gradient-to-l from-cyan-600 to-blue-700 p-4 text-white">
                        <div className="flex items-center justify-between">
                          <div><div className="text-[11px] text-cyan-50">مطب ولیعصر</div><div className="mt-0.5 text-2xl font-black">{crowd.t}</div></div>
                          <div className="text-left"><div className="text-2xl font-black">{toFa(Math.round(ratio * 100))}٪</div><div className="text-[10px] text-cyan-50">{toFa(filled)} از {toFa(seats.length)} صندلی</div></div>
                        </div>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/20"><motion.div animate={{ width: `${ratio * 100}%` }} transition={{ type: "spring", stiffness: 120, damping: 20 }} className={`h-full rounded-full ${crowd.bar}`} /></div>
                      </div>

                      <div className="rounded-2xl glass p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-sm font-bold text-slate-900"><Icon name="stethoscope" className="h-4 w-4 text-cyan-600" />صندلی‌ها</span>
                          <div className="flex items-center gap-1">
                            <button onClick={removeSeat} data-cursor="hover" className="grid h-7 w-7 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-rose-600"><Icon name="trash" className="h-3.5 w-3.5" /></button>
                            <span className="min-w-[1.5rem] text-center text-xs font-bold text-slate-700">{toFa(seats.length)}</span>
                            <button onClick={addSeat} data-cursor="hover" className="grid h-7 w-7 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-cyan-700"><Icon name="plus" className="h-3.5 w-3.5" /></button>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {seats.map((s) => (
                            <button key={s.id} onClick={() => toggleSeat(s.id)} data-cursor="hover" className={`flex h-9 min-w-[2.5rem] items-center justify-center gap-1 rounded-lg border px-2 text-[11px] font-bold transition ${s.occupied ? "border-cyan-500 bg-cyan-50 text-cyan-700" : "border-dashed border-slate-300 bg-white text-slate-400"}`}>🪑 {s.occupied ? "پر" : "خالی"}</button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* queue board */}
                    <div className="rounded-3xl glass p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900"><Icon name="user" className="h-4 w-4 text-cyan-600" />صف بیماران</h3>
                        <span className="text-[11px] text-slate-500">{toFa(waiting.length)} در انتظار · {toFa(done.length)} ویزیت‌شده</span>
                      </div>

                      {/* current / next */}
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className={`rounded-2xl border-2 p-3 ${current ? "border-cyan-500 bg-cyan-50" : "border-dashed border-slate-200 bg-slate-50"}`}>
                          <div className="text-[11px] font-bold text-cyan-700">🔴 در حال ویزیت</div>
                          {current ? (
                            <div className="mt-1">
                              <div className="truncate text-base font-black text-slate-900">{current.name}</div>
                              <div className="text-[11px] text-slate-500">نوبت {toFa(current.time)}</div>
                              <button onClick={finishCurrent} data-cursor="hover" className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 py-2 text-xs font-bold text-white"><Icon name="check" className="h-4 w-4" />ویزیت تمام شد</button>
                            </div>
                          ) : (
                            <div className="mt-1">
                              <div className="text-sm text-slate-400">هیچ بیماری داخل نیست</div>
                              {waiting.length > 0 && <button onClick={callNext} data-cursor="hover" className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 py-2 text-xs font-bold text-white">فراخوانی بیمار بعدی</button>}
                            </div>
                          )}
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white/60 p-3">
                          <div className="text-[11px] font-bold text-amber-600">⏭️ بیمار بعدی</div>
                          {waiting[0] ? <div className="mt-1"><div className="truncate text-base font-black text-slate-900">{waiting[0].name}</div><div className="text-[11px] text-slate-500">نوبت {toFa(waiting[0].time)}</div></div> : <div className="mt-1 text-sm text-slate-400">صف خالی است</div>}
                        </div>
                      </div>

                      {/* waiting list */}
                      <div className="no-scrollbar mt-3 max-h-[30vh] space-y-2 overflow-y-auto pr-1 sm:max-h-80">
                        {waiting.map((p, i) => (
                          <div key={p.id} className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white/70 p-2.5">
                            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-600">{toFa(i + 2)}</span>
                            <div className="min-w-0 flex-1"><div className="truncate text-sm font-bold text-slate-800">{p.name}</div><div className="text-[11px] text-slate-400">نوبت {toFa(p.time)}</div></div>
                            <div className="flex shrink-0 items-center gap-1">
                              <button onClick={() => movePatient(p.id, -1)} data-cursor="hover" className="grid h-8 w-8 place-items-center rounded-lg bg-slate-50 text-slate-500 hover:bg-cyan-50 hover:text-cyan-700" aria-label="جابه‌جایی به بالا"><Icon name="arrow" className="h-4 w-4 rotate-90" /></button>
                              <button onClick={() => movePatient(p.id, 1)} data-cursor="hover" className="grid h-8 w-8 place-items-center rounded-lg bg-slate-50 text-slate-500 hover:bg-cyan-50 hover:text-cyan-700" aria-label="جابه‌جایی به پایین"><Icon name="arrow" className="h-4 w-4 -rotate-90" /></button>
                              <button onClick={() => removePatient(p.id)} data-cursor="hover" className="grid h-8 w-8 place-items-center rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100" aria-label="حذف از صف"><Icon name="trash" className="h-4 w-4" /></button>
                            </div>
                          </div>
                        ))}
                        {waiting.length === 0 && <p className="rounded-2xl bg-slate-50 p-4 text-center text-sm text-slate-400">بیماری در صف انتظار نیست.</p>}
                      </div>
                      <p className="mt-3 text-xs text-slate-400">با تأیید اتمام ویزیت بیمار فعلی، بیمار بعدی خودکار وارد می‌شود. می‌توانید بیماران را جابه‌جا یا حذف کنید.</p>
                    </div>
                  </div>
                )}

                {/* ===== APPOINTMENTS ===== */}
                {tab === "appointments" && (
                  <div className="space-y-5">
                    <div><h1 className="text-2xl font-black text-slate-900">مدیریت نوبت‌ها</h1><p className="text-sm text-slate-500">حذف، جابه‌جایی و تغییر نوبت بیماران</p></div>
                    <div className="space-y-2">
                      {appts.map((a) => (
                        <div key={a.id} className="rounded-2xl border border-slate-100 bg-white/60 p-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-3">
                              <span className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-50 text-sm font-bold text-cyan-700">{toFa(a.time)}</span>
                              <div><div className="text-sm font-bold text-slate-800">{a.patient}</div><div className="text-[11px] text-slate-400">{a.doctor} · {a.day}</div></div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button onClick={() => setEdit(a)} data-cursor="hover" className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-600 hover:border-cyan-300 hover:text-cyan-700"><Icon name="edit" className="h-3.5 w-3.5" />جابه‌جایی/تغییر</button>
                              <button onClick={() => setAppts((p) => p.filter((x) => x.id !== a.id))} data-cursor="hover" className="flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1.5 text-[11px] font-bold text-rose-600 hover:bg-rose-100"><Icon name="trash" className="h-3.5 w-3.5" />حذف</button>
                            </div>
                          </div>
                          <AnimatePresence>
                            {edit?.id === a.id && (
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                <div className="mt-3 grid gap-2 border-t border-slate-100 pt-3 sm:grid-cols-3">
                                  <input value={edit.patient} onChange={(e) => setEdit({ ...edit, patient: e.target.value })} className="input py-2 text-sm" data-cursor="text" />
                                  <div className="relative"><select value={edit.day} onChange={(e) => setEdit({ ...edit, day: e.target.value })} className="input appearance-none py-2 text-sm">{DAYS.map((d) => <option key={d} className="bg-white">{d}</option>)}</select><Icon name="arrow" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-slate-400" /></div>
                                  <div className="relative"><select value={edit.time} onChange={(e) => setEdit({ ...edit, time: e.target.value })} className="input appearance-none py-2 text-sm">{TIMES.map((t) => <option key={t} className="bg-white">{t}</option>)}</select><Icon name="arrow" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-slate-400" /></div>
                                </div>
                                <div className="mt-2 flex gap-2"><button onClick={() => saveAppt(edit)} data-cursor="hover" className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-1.5 text-xs font-bold text-white">ذخیره</button><button onClick={() => setEdit(null)} data-cursor="hover" className="rounded-lg bg-white px-4 py-1.5 text-xs font-bold text-slate-500">انصراف</button></div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ===== WEEKLY ===== */}
                {tab === "weekly" && <PanelWeekly />}
              </motion.div>
            </AnimatePresence>
          </section>
        </div>
      </div>
    </div>
  );
}
