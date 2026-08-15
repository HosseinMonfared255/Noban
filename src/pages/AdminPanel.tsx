"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { doctors, specialties } from "../data";
import type { Nav } from "../nav";
import Icon from "../components/Icon";

const toFa = (s: string | number) => String(s).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);
const faNum = (n: number) => n.toLocaleString("fa-IR");

type Period = "day" | "week" | "month" | "year";
const PERIODS: { k: Period; l: string }[] = [
  { k: "day", l: "روز" }, { k: "week", l: "هفته" }, { k: "month", l: "ماه" }, { k: "year", l: "سال" },
];
type Tab = "dashboard" | "doctors" | "reviews" | "users" | "finance";
const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "dashboard", label: "داشبورد", icon: "chart" },
  { id: "doctors", label: "مدیریت دکترها", icon: "stethoscope" },
  { id: "reviews", label: "مدیریت نظرات", icon: "star" },
  { id: "users", label: "مدیریت کاربران", icon: "user" },
  { id: "finance", label: "مدیریت مالی", icon: "wallet" },
];

type Clinic = { name: string; address: string; phone: string };
type AdminDoc = { id: string; name: string; specialty: string; category: string; photo: string; phone: string; email: string; username: string; password: string; online: boolean; active: boolean; revenue: number; joined: string; isNew: boolean; clinic: Clinic; secretary: string; reviewsOn: boolean };
type Patient = { id: string; name: string; phone: string; blocked: boolean; visits: number; joined: string };
type Settlement = { id: number; doctor: string; amount: number; status: "در حال اقدام" | "پرداخت شده"; date: string };
type Appt = { id: number; patient: string; doctor: string; date: string; amount: number; refunded: boolean };
type AdminReview = { id: number; doctor: string; patient: string; rating: number; text: string; status: "pending" | "approved" | "rejected" };

const initialDocs: AdminDoc[] = doctors.map((d, i) => ({
  id: d.name, name: d.name, specialty: d.specialty, category: d.specialty, photo: d.photo, phone: d.phone,
  email: `dr.${i + 1}@noban.ir`, username: `dr${i + 1}`, password: "secret123", online: i % 2 === 0, active: true,
  revenue: [38, 24, 51, 33, 19, 41, 28, 22, 36, 30, 44, 26][i] * 1_000_000, joined: i < 3 ? "امروز" : i < 7 ? "این هفته" : "ماه قبل", isNew: i < 3,
  clinic: { name: d.location, address: "تهران، " + d.location + "، پلاک ۱۲۳، طبقه ۳", phone: d.phone },
  secretary: ["محمدی", "احمدی", "رضایی", "کریمی", "صادقی", "نوری", "فرهمند", "جباری", "یوسفی", "مرادی", "کیانی", "هدایتی"][i % 12],
  reviewsOn: true,
}));

const initialPatients: Patient[] = [
  { id: "u1", name: "نگار حسینی", phone: "09121110001", blocked: false, visits: 24, joined: "۳ ماه پیش" },
  { id: "u2", name: "محمد رستمی", phone: "09121110002", blocked: false, visits: 11, joined: "۱ ماه پیش" },
  { id: "u3", name: "زهرا کاظمی", phone: "09121110003", blocked: true, visits: 8, joined: "۲ هفته پیش" },
  { id: "u4", name: "سینا ملکی", phone: "09121110004", blocked: false, visits: 16, joined: "۶ ماه پیش" },
  { id: "u5", name: "مریم صادقی", phone: "09121110005", blocked: false, visits: 5, joined: "امروز" },
];

const initialSettlements: Settlement[] = [
  { id: 501, doctor: "دکتر سارا محمدی", amount: 4_200_000, status: "در حال اقدام", date: "امروز" },
  { id: 500, doctor: "دکتر رضا کاظمی", amount: 6_100_000, status: "پرداخت شده", date: "دیروز" },
  { id: 499, doctor: "دکتر مریم احمدی", amount: 2_800_000, status: "در حال اقدام", date: "۲ روز پیش" },
];

const initialAppts: Appt[] = [
  { id: 9001, patient: "نگار حسینی", doctor: "دکتر سارا محمدی", date: "امروز ۱۶:۳۰", amount: 320000, refunded: false },
  { id: 9000, patient: "سینا ملکی", doctor: "دکتر علی رضایی", date: "فردا ۱۰:۰۰", amount: 350000, refunded: false },
  { id: 8999, patient: "زهرا کاظمی", doctor: "دکتر رضا کاظمی", date: "دیروز ۱۲:۰۰", amount: 400000, refunded: true },
];

const initialAdminReviews: AdminReview[] = [
  { id: 1, doctor: "دکتر سارا محمدی", patient: "نگار حسینی", rating: 5, text: "بسیار دقیق و صبور بودند؛ ممنونم.", status: "pending" },
  { id: 2, doctor: "دکتر سارا محمدی", patient: "محمد رستمی", rating: 4, text: "ویزیت خوبی بود، کمی منتظر ماندم.", status: "pending" },
  { id: 3, doctor: "دکتر رضا کاظمی", patient: "زهرا کاظمی", rating: 5, text: "تشخیص عالی و توضیحات کامل.", status: "pending" },
  { id: 4, doctor: "دکتر مریم احمدی", patient: "سینا ملکی", rating: 5, text: "خوش‌برخورد و حرفه‌ای.", status: "pending" },
  { id: 5, doctor: "دکتر رضا کاظمی", patient: "آرش کریمی", rating: 3, text: "کمی کند بود.", status: "approved" },
];

const revenueByPeriod: Record<Period, { total: number; chart: { label: string; value: number }[] }> = {
  day: { total: 12_500_000, chart: [{ label: "ش", value: 8 }, { label: "ی", value: 12 }, { label: "د", value: 9 }, { label: "س", value: 14 }, { label: "چ", value: 11 }, { label: "پ", value: 16 }, { label: "ج", value: 5 }] },
  week: { total: 78_000_000, chart: [{ label: "ه۱", value: 60 }, { label: "ه۲", value: 72 }, { label: "ه۳", value: 68 }, { label: "ه۴", value: 78 }] },
  month: { total: 312_000_000, chart: [{ label: "فرو", value: 220 }, { label: "ارد", value: 260 }, { label: "خرد", value: 240 }, { label: "تیر", value: 312 }, { label: "مرد", value: 290 }] },
  year: { total: 3_400_000_000, chart: [{ label: "۱۴۰۱", value: 1900 }, { label: "۱۴۰۲", value: 2400 }, { label: "۱۴۰۳", value: 2900 }, { label: "۱۴۰۴", value: 3400 }] },
};

function exportCSV(filename: string, rows: (string | number)[][]) {
  const bom = "\uFEFF";
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
}

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-3xl glass p-4 sm:p-5 ${className}`}>{children}</div>;
}
function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex h-40 items-end gap-2">
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
          <span className="text-[10px] font-bold text-slate-400">{faNum(d.value)}</span>
          <div className="flex w-full flex-1 items-end"><motion.div initial={{ height: 0 }} animate={{ height: `${(d.value / max) * 100}%` }} transition={{ duration: 0.5 }} className="w-full rounded-t-lg bg-gradient-to-t from-cyan-500 to-blue-400" style={{ minHeight: 4 }} /></div>
          <span className="text-[10px] text-slate-500">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
function PeriodToggle({ value, onChange }: { value: Period; onChange: (p: Period) => void }) {
  return (
    <div className="flex w-fit rounded-xl border border-slate-200 bg-white p-1 text-xs font-bold">
      {PERIODS.map((p) => <button key={p.k} onClick={() => onChange(p.k)} data-cursor="hover" className={`rounded-lg px-3 py-1.5 transition ${value === p.k ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white" : "text-slate-500"}`}>{p.l}</button>)}
    </div>
  );
}
function Stars({ value, className = "h-3.5 w-3.5" }: { value: number; className?: string }) {
  return <span className="inline-flex">{[0, 1, 2, 3, 4].map((i) => <Icon key={i} name="star" className={`${className} ${i < value ? "fill-amber-500 text-amber-500" : "fill-slate-200 text-slate-200"}`} />)}</span>;
}
function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} onClick={(e) => e.stopPropagation()} className="glass max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl p-6">{children}</motion.div>
    </motion.div>
  );
}
function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-medium text-slate-600">{label}</span>{children}</label>;
}

export default function AdminPanel({ navigate }: { navigate: Nav }) {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [period, setPeriod] = useState<Period>("month");
  const [docs, setDocs] = useState<AdminDoc[]>(initialDocs);
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [settlements, setSettlements] = useState<Settlement[]>(initialSettlements);
  const [appts, setAppts] = useState<Appt[]>(initialAppts);
  const [reviews, setReviews] = useState<AdminReview[]>(initialAdminReviews);

  const [selDoc, setSelDoc] = useState<string | null>(null);
  const [selUser, setSelUser] = useState<string | null>(null);
  const [finDoc, setFinDoc] = useState<string | null>(null);
  const [selReviewDoc, setSelReviewDoc] = useState<string | null>(null);
  const [docPeriod, setDocPeriod] = useState<Period>("month");

  const [addOpen, setAddOpen] = useState(false);
  const [editDoc, setEditDoc] = useState<AdminDoc | null>(null);

  const activeDoc = docs.find((d) => d.id === selDoc) || null;
  const activeUser = patients.find((u) => u.id === selUser) || null;
  const finDoctor = docs.find((d) => d.id === finDoc) || null;

  const pendingReviews = reviews.filter((r) => r.status === "pending");
  const pendingDoctors = Array.from(new Set(pendingReviews.map((r) => r.doctor)));

  const deleteDoc = (id: string) => { if (window.confirm("این دکتر حذف شود؟")) setDocs((p) => p.filter((x) => x.id !== id)); };
  const saveEditDoc = (d: AdminDoc) => { setDocs((p) => p.map((x) => x.id === d.id ? d : x)); setEditDoc(null); };

  return (
    <div className="min-h-screen pb-12 pt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* sticky mobile tabs */}
        <div className="sticky top-[4.5rem] z-30 mb-5 lg:hidden">
          <div className="no-scrollbar flex gap-2 overflow-x-auto rounded-2xl glass p-2">
            {TABS.map((t) => <button key={t.id} onClick={() => { setTab(t.id); setSelDoc(null); setSelUser(null); setFinDoc(null); setSelReviewDoc(null); }} data-cursor="hover" className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${tab === t.id ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white" : "text-slate-600"}`}><Icon name={t.icon} className="h-4 w-4" />{t.label}</button>)}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
          {/* sidebar */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl glass p-4">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 text-white"><Icon name="shield" className="h-6 w-6" /></span>
                <div><div className="font-bold text-slate-900">مدیر سیستم</div><div className="text-xs text-cyan-700">پنل مدیریت</div></div>
              </div>
            </div>
            <nav className="mt-3 hidden gap-1.5 rounded-3xl glass p-2 lg:flex lg:flex-col">
              {TABS.map((t) => <button key={t.id} onClick={() => { setTab(t.id); setSelDoc(null); setSelUser(null); setFinDoc(null); setSelReviewDoc(null); }} data-cursor="hover" className={`flex items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-bold transition ${tab === t.id ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25" : "text-slate-600 hover:bg-slate-100"}`}><Icon name={t.icon} className="h-5 w-5" />{t.label}</button>)}
              <button onClick={() => navigate("home")} data-cursor="hover" className="mt-1 flex items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-bold text-slate-500 transition hover:bg-slate-100"><Icon name="logout" className="h-5 w-5" />بازگشت به سایت</button>
            </nav>
          </aside>

          <section>
            <AnimatePresence mode="wait">
              <motion.div key={tab + (selDoc ?? "") + (selUser ?? "") + (finDoc ?? "") + (selReviewDoc ?? "")} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>

                {/* ============ DASHBOARD ============ */}
                {tab === "dashboard" && (
                  <div className="space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div><h1 className="text-2xl font-black text-slate-900">داشبورد مدیر</h1><p className="text-sm text-slate-500">نمای کلی وضعیت سامانه</p></div>
                      <span className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-600"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />وضعیت سایت: عملیاتی</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                      <Panel><div className="mb-2 flex items-center justify-between"><span className="inline-flex rounded-xl bg-cyan-50 p-2 text-cyan-600"><Icon name="user" className="h-5 w-5" /></span><span className="text-[10px] text-slate-400">{period === "day" ? "امروز" : period === "week" ? "این هفته" : period === "month" ? "این ماه" : "امسال"}</span></div><div className="text-lg font-black text-slate-900 sm:text-xl">{toFa(faNum(18420))}</div><div className="text-xs text-slate-500">بازدیدکنندگان</div></Panel>
                      <Panel><div className="mb-2 inline-flex rounded-xl bg-violet-50 p-2 text-violet-600"><Icon name="stethoscope" className="h-5 w-5" /></div><div className="text-lg font-black text-slate-900 sm:text-xl">{toFa(faNum(docs.filter((d) => d.active).length))}</div><div className="text-xs text-slate-500">پزشکان فعال</div></Panel>
                      <Panel><div className="mb-2 inline-flex rounded-xl bg-emerald-50 p-2 text-emerald-600"><Icon name="user" className="h-5 w-5" /></div><div className="text-lg font-black text-slate-900 sm:text-xl">{toFa(faNum(8210))}</div><div className="text-xs text-slate-500">کاربران فعال</div></Panel>
                      <Panel><div className="mb-2 inline-flex rounded-xl bg-amber-50 p-2 text-amber-600"><Icon name="wallet" className="h-5 w-5" /></div><div className="text-lg font-black text-slate-900 sm:text-xl">{toFa(faNum(revenueByPeriod[period].total))}</div><div className="text-xs text-slate-500">مجموع درآمد (ت)</div></Panel>
                    </div>
                    <Panel>
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h3 className="font-bold text-slate-900">تاریخچه درآمد</h3><PeriodToggle value={period} onChange={setPeriod} /></div>
                      <BarChart data={revenueByPeriod[period].chart} />
                    </Panel>
                  </div>
                )}

                {/* ============ DOCTORS ============ */}
                {tab === "doctors" && (
                  activeDoc ? (
                    <div className="space-y-5">
                      <button onClick={() => setSelDoc(null)} data-cursor="hover" className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/70 px-4 py-1.5 text-sm font-medium text-slate-600 hover:border-cyan-300 hover:text-cyan-700"><Icon name="arrow" className="h-4 w-4 rotate-180" />بازگشت به لیست</button>
                      <div className="flex flex-wrap items-center gap-4">
                        <img src={activeDoc.photo} alt="" className="h-16 w-16 rounded-2xl object-cover object-top" />
                        <div className="flex-1"><h1 className="text-2xl font-black text-slate-900">{activeDoc.name}</h1><div className="text-cyan-700">{activeDoc.specialty}</div></div>
                        <span className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${activeDoc.online ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}><span className={`h-2 w-2 rounded-full ${activeDoc.online ? "bg-emerald-500" : "bg-slate-400"}`} />{activeDoc.online ? "آنلاین" : "آفلاین"}</span>
                        <button onClick={() => setEditDoc(activeDoc)} data-cursor="hover" className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:border-cyan-300 hover:text-cyan-700"><Icon name="edit" className="h-4 w-4" />ویرایش اطلاعات</button>
                      </div>

                      {/* info cards */}
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Panel>
                          <h3 className="mb-3 flex items-center gap-2 font-bold text-slate-900"><Icon name="user" className="h-4 w-4 text-cyan-600" />اطلاعات حساب</h3>
                          <div className="space-y-2 text-sm">
                            <Row label="ایمیل" value={activeDoc.email} />
                            <Row label="تلفن" value={toFa(activeDoc.phone)} />
                            <Row label="نام کاربری" value={activeDoc.username} />
                            <Row label="رمز عبور" value={"•".repeat(6)} />
                          </div>
                        </Panel>
                        <Panel>
                          <h3 className="mb-3 flex items-center gap-2 font-bold text-slate-900"><Icon name="location" className="h-4 w-4 text-cyan-600" />مطب و منشی</h3>
                          <div className="space-y-2 text-sm">
                            <Row label="مطب" value={activeDoc.clinic.name} />
                            <Row label="آدرس" value={activeDoc.clinic.address} />
                            <Row label="تلفن مطب" value={toFa(activeDoc.clinic.phone)} />
                            <Row label="منشی" value={activeDoc.secretary || "—"} />
                          </div>
                        </Panel>
                      </div>

                      <div className="grid gap-5 lg:grid-cols-2">
                        <Panel>
                          <h3 className="mb-3 font-bold text-slate-900">تاریخچه تسویه حساب</h3>
                          <div className="space-y-2">
                            {[{ d: "امروز", a: 4_200_000, s: "در حال اقدام" }, { d: "دیروز", a: 6_100_000, s: "پرداخت شده" }, { d: "هفته پیش", a: 3_300_000, s: "پرداخت شده" }].map((r, i) => (
                              <div key={i} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white/60 p-3"><div><div className="text-sm font-bold text-slate-800">{toFa(faNum(r.a))} ت</div><div className="text-[11px] text-slate-400">{r.d}</div></div><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${r.s === "پرداخت شده" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>{r.s}</span></div>
                            ))}
                          </div>
                        </Panel>
                        <Panel>
                          <h3 className="mb-3 font-bold text-slate-900">تاریخچه فعالیت و بازدید</h3>
                          <div className="grid grid-cols-3 gap-2 text-center">
                            {[{ l: "بازدید پروفایل", v: 1240 }, { l: "نوبت‌ها", v: 318 }, { l: "نظرات", v: 214 }].map((s) => <div key={s.l} className="rounded-2xl bg-slate-50 p-3"><div className="text-lg font-black text-slate-900">{toFa(faNum(s.v))}</div><div className="text-[10px] text-slate-500">{s.l}</div></div>)}
                          </div>
                          <div className="mt-3"><BarChart data={revenueByPeriod.month.chart} /></div>
                        </Panel>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-black text-slate-900">مدیریت دکترها</h1><p className="text-sm text-slate-500">لیست پزشکان، تعریف و مدیریت</p></div>
                        <button onClick={() => setAddOpen(true)} data-cursor="hover" className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/25"><Icon name="plus" className="h-4 w-4" />تعریف دکتر جدید</button>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {docs.map((d) => (
                          <div key={d.id} className="overflow-hidden rounded-3xl glass">
                            <button onClick={() => setSelDoc(d.id)} data-cursor="hover" className="flex w-full items-center gap-3 p-4 text-right">
                              <img src={d.photo} alt="" className="h-12 w-12 rounded-2xl object-cover object-top" />
                              <div className="min-w-0 flex-1"><div className="flex items-center gap-1.5"><span className="truncate font-bold text-slate-900">{d.name}</span>{d.isNew && <span className="rounded bg-cyan-100 px-1.5 py-0.5 text-[9px] font-bold text-cyan-700">جدید</span>}</div><div className="text-xs text-cyan-700">{d.specialty}</div></div>
                              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${d.online ? "bg-emerald-500" : "bg-slate-300"}`} title={d.online ? "آنلاین" : "آفلاین"} />
                            </button>
                            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2.5">
                              <span className="text-xs text-slate-500">{toFa(faNum(d.revenue))} ت</span>
                              <div className="flex items-center gap-2">
                                <button onClick={() => setDocs((p) => p.map((x) => x.id === d.id ? { ...x, active: !x.active } : x))} data-cursor="hover" className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-bold ${d.active ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>{d.active ? "فعال" : "غیرفعال"}<span className={`relative h-4 w-7 rounded-full transition ${d.active ? "bg-emerald-500" : "bg-slate-300"}`}><span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition ${d.active ? "left-0.5" : "right-0.5"}`} /></span></button>
                                <button onClick={() => deleteDoc(d.id)} data-cursor="hover" className="grid h-7 w-7 place-items-center rounded-lg bg-rose-50 text-rose-600 transition hover:bg-rose-100" aria-label="حذف"><Icon name="trash" className="h-3.5 w-3.5" /></button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                )}

                {/* ============ REVIEWS ============ */}
                {tab === "reviews" && (
                  selReviewDoc ? (
                    <div className="space-y-5">
                      <button onClick={() => setSelReviewDoc(null)} data-cursor="hover" className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/70 px-4 py-1.5 text-sm font-medium text-slate-600 hover:border-cyan-300 hover:text-cyan-700"><Icon name="arrow" className="h-4 w-4 rotate-180" />بازگشت</button>
                      <div><h1 className="text-2xl font-black text-slate-900">{selReviewDoc}</h1><p className="text-sm text-slate-500">نظرات در انتظار تأیید</p></div>
                      <div className="space-y-3">
                        {reviews.filter((r) => r.doctor === selReviewDoc && r.status === "pending").map((r) => (
                          <Panel key={r.id}>
                            <div className="flex items-center justify-between"><div className="flex items-center gap-2.5"><span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-xs font-bold text-white">{r.patient.charAt(0)}</span><div><div className="text-sm font-bold text-slate-800">{r.patient}</div><Stars value={r.rating} className="h-3 w-3" /></div></div></div>
                            <p className="mt-3 text-sm leading-relaxed text-slate-600">{r.text}</p>
                            <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                              <button onClick={() => setReviews((p) => p.map((x) => x.id === r.id ? { ...x, status: "approved" } : x))} data-cursor="hover" className="flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600"><Icon name="check" className="h-3.5 w-3.5" />تأیید و درج نظر</button>
                              <button onClick={() => setReviews((p) => p.map((x) => x.id === r.id ? { ...x, status: "rejected" } : x))} data-cursor="hover" className="flex items-center gap-1 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600"><Icon name="close" className="h-3.5 w-3.5" />رد نظر</button>
                            </div>
                          </Panel>
                        ))}
                        {reviews.filter((r) => r.doctor === selReviewDoc && r.status === "pending").length === 0 && <Panel className="text-center text-sm text-slate-400">نظر در انتظاری برای این دکتر باقی نمانده است.</Panel>}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div><h1 className="text-2xl font-black text-slate-900">مدیریت نظرات</h1><p className="text-sm text-slate-500">تأیید/رد نظرات و فعال‌سازی بخش نظرات</p></div>
                      {/* pending doctors */}
                      <Panel>
                        <div className="mb-3 flex items-center justify-between"><h3 className="font-bold text-slate-900">نظرات در انتظار تأیید</h3><span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-600">{toFa(faNum(pendingReviews.length))} نظر</span></div>
                        {pendingDoctors.length === 0 ? (
                          <p className="text-sm text-slate-400">هیچ نظری در انتظار تأیید نیست.</p>
                        ) : (
                          <div className="grid gap-3 sm:grid-cols-2">
                            {pendingDoctors.map((dn) => {
                              const count = pendingReviews.filter((r) => r.doctor === dn).length;
                              return (
                                <button key={dn} onClick={() => setSelReviewDoc(dn)} data-cursor="hover" className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white/60 p-3 text-right transition hover:border-cyan-300">
                                  <div><div className="text-sm font-bold text-slate-800">{dn}</div><div className="text-[11px] text-slate-400">{toFa(faNum(count))} نظر در انتظار</div></div>
                                  <Icon name="arrow" className="h-4 w-4 text-slate-400" />
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </Panel>
                      {/* enable/disable per doctor */}
                      <Panel>
                        <h3 className="mb-3 font-bold text-slate-900">فعال/غیرفعال کردن نظرات برای دکترها</h3>
                        <div className="space-y-2">
                          {docs.map((d) => (
                            <div key={d.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white/60 p-3">
                              <div className="flex items-center gap-2.5"><img src={d.photo} alt="" className="h-9 w-9 rounded-full object-cover object-top" /><div className="text-sm font-bold text-slate-800">{d.name}</div></div>
                              <button onClick={() => setDocs((p) => p.map((x) => x.id === d.id ? { ...x, reviewsOn: !x.reviewsOn } : x))} data-cursor="hover" className={`relative h-7 w-12 rounded-full transition ${d.reviewsOn ? "bg-emerald-500" : "bg-slate-300"}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${d.reviewsOn ? "left-1" : "right-1"}`} /></button>
                            </div>
                          ))}
                        </div>
                      </Panel>
                    </div>
                  )
                )}

                {/* ============ USERS ============ */}
                {tab === "users" && (
                  activeUser ? (
                    <div className="space-y-5">
                      <button onClick={() => setSelUser(null)} data-cursor="hover" className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/70 px-4 py-1.5 text-sm font-medium text-slate-600 hover:border-cyan-300 hover:text-cyan-700"><Icon name="arrow" className="h-4 w-4 rotate-180" />بازگشت به لیست کاربران</button>
                      <div className="flex items-center gap-3"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 text-xl font-bold text-white">{activeUser.name.charAt(0)}</span><div><h1 className="text-2xl font-black text-slate-900">{activeUser.name}</h1><div className="text-sm text-slate-500">{toFa(activeUser.phone)} · عضو {activeUser.joined}</div></div></div>
                      <div className="grid gap-4 sm:grid-cols-3">
                        {[{ l: "بازدید از سایت", v: activeUser.visits }, { l: "نوبت‌های رزروشده", v: Math.round(activeUser.visits / 2) }, { l: "نظرات ثبت‌شده", v: Math.max(1, Math.round(activeUser.visits / 6)) }].map((s) => <Panel key={s.l} className="text-center"><div className="text-2xl font-black text-slate-900">{toFa(faNum(s.v))}</div><div className="text-xs text-slate-500">{s.l}</div></Panel>)}
                      </div>
                      <Panel>
                        <h3 className="mb-3 font-bold text-slate-900">تاریخچه رزرو و پرداخت</h3>
                        <div className="space-y-2">
                          {[{ d: "امروز ۱۶:۳۰", doc: "دکتر سارا محمدی", a: 320000, s: "پرداخت‌شده" }, { d: "دیروز ۱۰:۰۰", doc: "دکتر علی رضایی", a: 350000, s: "پرداخت‌شده" }, { d: "هفته پیش", doc: "دکتر مریم احمدی", a: 260000, s: "لغو/عودت" }].map((b, i) => (
                            <div key={i} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white/60 p-3"><div><div className="text-sm font-bold text-slate-800">{b.doc}</div><div className="text-[11px] text-slate-400">{b.d} · {toFa(faNum(b.a))} ت</div></div><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${b.s === "پرداخت‌شده" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>{b.s}</span></div>
                          ))}
                        </div>
                      </Panel>
                      <Panel>
                        <h3 className="mb-3 font-bold text-slate-900">تاریخچه نظرات برای پزشکان</h3>
                        <div className="space-y-2">
                          {[{ doc: "دکتر سارا محمدی", t: "بسیار دقیق و صبور بودند.", r: 5 }, { doc: "دکتر علی رضایی", t: "ویزیت خوبی بود.", r: 4 }].map((rv, i) => (
                            <div key={i} className="rounded-2xl border border-slate-100 bg-white/60 p-3"><div className="flex items-center justify-between"><span className="text-sm font-bold text-slate-800">{rv.doc}</span><span className="text-xs font-bold text-amber-600">★ {toFa(rv.r)}</span></div><p className="mt-1 text-sm text-slate-600">{rv.t}</p></div>
                          ))}
                        </div>
                      </Panel>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div><h1 className="text-2xl font-black text-slate-900">مدیریت کاربران</h1><p className="text-sm text-slate-500">لیست بیماران و مدیریت دسترسی</p></div>
                      <Panel className="overflow-hidden p-0">
                        <div className="hidden grid-cols-[2fr_1.4fr_1fr_1fr] gap-2 border-b border-slate-100 bg-white/60 px-5 py-3 text-xs font-bold text-slate-500 sm:grid"><span>بیمار</span><span className="text-center">تلفن</span><span className="text-center">بازدید</span><span className="text-center">وضعیت</span></div>
                        <div className="divide-y divide-slate-100">
                          {patients.map((u) => (
                            <div key={u.id} className="px-5 py-3">
                              <div className="flex items-center justify-between sm:hidden">
                                <button onClick={() => setSelUser(u.id)} data-cursor="hover" className="flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-xs font-bold text-white">{u.name.charAt(0)}</span><span className="text-sm font-bold text-slate-800">{u.name}</span></button>
                                <button onClick={() => setPatients((p) => p.map((x) => x.id === u.id ? { ...x, blocked: !x.blocked } : x))} data-cursor="hover" className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${u.blocked ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>{u.blocked ? "رفع مسدودیت" : "مسدود"}</button>
                              </div>
                              <div className="hidden grid-cols-[2fr_1.4fr_1fr_1fr] items-center gap-2 sm:grid">
                                <button onClick={() => setSelUser(u.id)} data-cursor="hover" className="flex items-center gap-2.5 text-right"><span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-xs font-bold text-white">{u.name.charAt(0)}</span><span className="text-sm font-bold text-slate-800 hover:text-cyan-700">{u.name}</span></button>
                                <span className="text-center text-sm text-slate-600">{toFa(u.phone)}</span>
                                <span className="text-center text-sm font-bold text-cyan-700">{toFa(faNum(u.visits))}</span>
                                <div className="flex justify-center"><button onClick={() => setPatients((p) => p.map((x) => x.id === u.id ? { ...x, blocked: !x.blocked } : x))} data-cursor="hover" className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${u.blocked ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"}`}>{u.blocked ? "مسدود" : "فعال"}</button></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Panel>
                    </div>
                  )
                )}

                {/* ============ FINANCE ============ */}
                {tab === "finance" && (
                  finDoctor ? (
                    <div className="space-y-5">
                      <button onClick={() => setFinDoc(null)} data-cursor="hover" className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/70 px-4 py-1.5 text-sm font-medium text-slate-600 hover:border-cyan-300 hover:text-cyan-700"><Icon name="arrow" className="h-4 w-4 rotate-180" />بازگشت به درآمد دکترها</button>
                      <div className="flex items-center gap-3"><img src={finDoctor.photo} alt="" className="h-12 w-12 rounded-2xl object-cover object-top" /><div><h1 className="text-2xl font-black text-slate-900">{finDoctor.name}</h1><div className="text-cyan-700">{finDoctor.specialty}</div></div></div>
                      <Panel><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h3 className="font-bold text-slate-900">تاریخچه درآمد دکتر</h3><PeriodToggle value={docPeriod} onChange={setDocPeriod} /></div><div className="mb-3 text-2xl font-black text-slate-900">{toFa(faNum(revenueByPeriod[docPeriod].total))} <span className="text-sm font-medium text-slate-400">تومان</span></div><BarChart data={revenueByPeriod[docPeriod].chart} /></Panel>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-black text-slate-900">مدیریت مالی</h1><p className="text-sm text-slate-500">درآمد، تسویه و عودت هزینه</p></div>
                        <button onClick={() => exportCSV("admin-finance.csv", [["بخش", "مبلغ (تومان)"], ["درآمد مدیر (" + period + ")", revenueByPeriod[period].total], ["مجموع درآمد دکترها", docs.reduce((s, d) => s + d.revenue, 0)]])} data-cursor="hover" className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 hover:border-cyan-300 hover:text-cyan-700"><Icon name="download" className="h-4 w-4" />خروجی اکسل</button>
                      </div>
                      <Panel><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h3 className="font-bold text-slate-900">درآمد کل مدیر سیستم</h3><PeriodToggle value={period} onChange={setPeriod} /></div><div className="mb-4 text-3xl font-black text-slate-900">{toFa(faNum(revenueByPeriod[period].total))} <span className="text-sm font-medium text-slate-400">تومان</span></div><BarChart data={revenueByPeriod[period].chart} /></Panel>
                      <Panel>
                        <h3 className="mb-3 font-bold text-slate-900">مجموع درآمد دکترها (برای جزئیات کلیک کنید)</h3>
                        <div className="space-y-2">
                          {docs.map((d) => (
                            <button key={d.id} onClick={() => setFinDoc(d.id)} data-cursor="hover" className="flex w-full items-center justify-between rounded-2xl border border-slate-100 bg-white/60 p-3 text-right transition hover:border-cyan-300">
                              <div className="flex items-center gap-3"><img src={d.photo} alt="" className="h-9 w-9 rounded-full object-cover object-top" /><div><div className="text-sm font-bold text-slate-800">{d.name}</div><div className="text-[11px] text-slate-400">{d.specialty}</div></div></div>
                              <div className="flex items-center gap-2"><span className="text-sm font-bold text-slate-700">{toFa(faNum(d.revenue))} ت</span><Icon name="arrow" className="h-4 w-4 text-slate-400" /></div>
                            </button>
                          ))}
                        </div>
                      </Panel>
                      <Panel>
                        <h3 className="mb-3 font-bold text-slate-900">درخواست‌های تسویه دکترها</h3>
                        <div className="space-y-2">
                          {settlements.map((s) => (
                            <div key={s.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-100 bg-white/60 p-3">
                              <div><div className="text-sm font-bold text-slate-800">{s.doctor}</div><div className="text-[11px] text-slate-400">#{toFa(s.id)} · {s.date} · {toFa(faNum(s.amount))} ت</div></div>
                              <select value={s.status} onChange={(e) => setSettlements((p) => p.map((x) => x.id === s.id ? { ...x, status: e.target.value as Settlement["status"] } : x))} className="input w-40 appearance-none py-1.5 text-xs" data-cursor="hover">
                                <option className="bg-white">در حال اقدام</option>
                                <option className="bg-white">پرداخت شده</option>
                              </select>
                            </div>
                          ))}
                        </div>
                      </Panel>
                      <Panel>
                        <h3 className="mb-1 font-bold text-slate-900">لغو نوبت و عودت هزینه</h3>
                        <p className="mb-3 text-xs text-slate-500">با لغو، مبلغ به کاربر عودت داده می‌شود.</p>
                        <div className="space-y-2">
                          {appts.map((a) => (
                            <div key={a.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-100 bg-white/60 p-3">
                              <div><div className="text-sm font-bold text-slate-800">{a.patient} ← {a.doctor}</div><div className="text-[11px] text-slate-400">{a.date} · {toFa(faNum(a.amount))} ت</div></div>
                              {a.refunded ? <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-600">عودت داده شد</span> : <button onClick={() => setAppts((p) => p.map((x) => x.id === a.id ? { ...x, refunded: true } : x))} data-cursor="hover" className="rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-bold text-white">لغو و عودت</button>}
                            </div>
                          ))}
                        </div>
                      </Panel>
                    </div>
                  )
                )}
              </motion.div>
            </AnimatePresence>
          </section>
        </div>
      </div>

      {/* add doctor */}
      <AnimatePresence>
        {addOpen && <AddDoctorModal onClose={() => setAddOpen(false)} onAdd={(d) => { setDocs((p) => [{ id: Date.now().toString(), name: d.name, specialty: d.specialty, category: d.specialty, photo: d.photo, phone: d.phone, email: d.email, username: d.username, password: "secret123", online: false, active: true, revenue: 0, joined: "هم‌اکنون", isNew: true, clinic: d.clinic, secretary: d.secretary, reviewsOn: true }, ...p]); setAddOpen(false); }} />}
      </AnimatePresence>

      {/* edit doctor */}
      <AnimatePresence>
        {editDoc && <EditDoctorModal doc={editDoc} onClose={() => setEditDoc(null)} onSave={saveEditDoc} />}
      </AnimatePresence>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-2 border-b border-slate-50 pb-2"><span className="text-xs text-slate-400">{label}</span><span className="font-bold text-slate-700">{value}</span></div>;
}

function AddDoctorModal({ onClose, onAdd }: { onClose: () => void; onAdd: (d: { name: string; specialty: string; photo: string; phone: string; email: string; username: string; clinic: Clinic; secretary: string }) => void }) {
  const [f, setF] = useState({ name: "", specialty: specialties[0].name, phone: "", email: "", username: "", clinicName: "", clinicAddr: "", clinicPhone: "", secretary: "", photo: "" });
  const set = (k: string, v: any) => setF((p) => ({ ...p, [k]: v }));
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <Overlay onClose={onClose}>
      <div className="flex items-center justify-between"><h3 className="text-lg font-black text-slate-900">تعریف دکتر جدید</h3><button onClick={onClose} data-cursor="hover" className="grid h-8 w-8 place-items-center rounded-lg bg-white/70 text-slate-500"><Icon name="close" className="h-4 w-4" /></button></div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <F label="نام دکتر"><input value={f.name} onChange={(e) => set("name", e.target.value)} className="input" data-cursor="text" /></F>
        <F label="دسته‌بندی"><div className="relative"><select value={f.specialty} onChange={(e) => set("specialty", e.target.value)} className="input appearance-none">{specialties.map((s) => <option key={s.name} className="bg-white">{s.name}</option>)}</select><Icon name="arrow" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-slate-400" /></div></F>
        <F label="شماره تلفن"><input value={f.phone} onChange={(e) => set("phone", e.target.value)} className="input" data-cursor="text" /></F>
        <F label="ایمیل"><input value={f.email} onChange={(e) => set("email", e.target.value)} className="input" data-cursor="text" /></F>
        <F label="نام کاربری"><input value={f.username} onChange={(e) => set("username", e.target.value)} className="input" data-cursor="text" /></F>
      </div>
      <div className="mt-3 flex items-center gap-3">
        {f.photo ? <img src={f.photo} alt="" className="h-12 w-12 rounded-xl object-cover" /> : <div className="grid h-12 w-12 place-items-center rounded-xl bg-cyan-50 text-cyan-600"><Icon name="user" className="h-6 w-6" /></div>}
        <button onClick={() => fileRef.current?.click()} data-cursor="hover" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:border-cyan-300">عکس پروفایل</button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (!file) return; const r = new FileReader(); r.onload = () => set("photo", r.result as string); r.readAsDataURL(file); }} />
      </div>
      <div className="mt-4 rounded-2xl bg-slate-50 p-3">
        <div className="mb-2 text-xs font-bold text-slate-500">تعریف مطب و منشی</div>
        <div className="grid gap-3 sm:grid-cols-2">
          <F label="نام مطب"><input value={f.clinicName} onChange={(e) => set("clinicName", e.target.value)} className="input" data-cursor="text" /></F>
          <F label="تلفن مطب"><input value={f.clinicPhone} onChange={(e) => set("clinicPhone", e.target.value)} className="input" data-cursor="text" /></F>
          <F label="فامیل منشی"><input value={f.secretary} onChange={(e) => set("secretary", e.target.value)} className="input" data-cursor="text" /></F>
        </div>
        <F label="آدرس مطب"><input value={f.clinicAddr} onChange={(e) => set("clinicAddr", e.target.value)} className="input mt-3" data-cursor="text" /></F>
      </div>
      <button onClick={() => f.name.trim() && onAdd({ name: f.name, specialty: f.specialty, photo: f.photo, phone: f.phone, email: f.email, username: f.username, clinic: { name: f.clinicName, address: f.clinicAddr, phone: f.clinicPhone }, secretary: f.secretary })} data-cursor="hover" className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/30"><Icon name="check" className="h-4 w-4" />ثبت دکتر</button>
    </Overlay>
  );
}

function EditDoctorModal({ doc, onClose, onSave }: { doc: AdminDoc; onClose: () => void; onSave: (d: AdminDoc) => void }) {
  const [name, setName] = useState(doc.name);
  const [specialty, setSpecialty] = useState(doc.specialty);
  const [phone, setPhone] = useState(doc.phone);
  const [email, setEmail] = useState(doc.email);
  const [username, setUsername] = useState(doc.username);
  const [password, setPassword] = useState(doc.password);
  const [clinic, setClinic] = useState<Clinic>(doc.clinic);
  const [secretary, setSecretary] = useState(doc.secretary);

  const save = () => onSave({ ...doc, name, specialty, category: specialty, phone, email, username, password, clinic, secretary });

  return (
    <Overlay onClose={onClose}>
      <div className="flex items-center justify-between"><h3 className="text-lg font-black text-slate-900">ویرایش اطلاعات دکتر</h3><button onClick={onClose} data-cursor="hover" className="grid h-8 w-8 place-items-center rounded-lg bg-white/70 text-slate-500"><Icon name="close" className="h-4 w-4" /></button></div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <F label="نام دکتر"><input value={name} onChange={(e) => setName(e.target.value)} className="input" data-cursor="text" /></F>
        <F label="دسته‌بندی"><div className="relative"><select value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="input appearance-none">{specialties.map((s) => <option key={s.name} className="bg-white">{s.name}</option>)}</select><Icon name="arrow" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-slate-400" /></div></F>
        <F label="تلفن"><input value={phone} onChange={(e) => setPhone(e.target.value)} className="input" data-cursor="text" /></F>
        <F label="ایمیل"><input value={email} onChange={(e) => setEmail(e.target.value)} className="input" data-cursor="text" /></F>
        <F label="نام کاربری"><input value={username} onChange={(e) => setUsername(e.target.value)} className="input" data-cursor="text" /></F>
        <F label="رمز عبور"><input value={password} onChange={(e) => setPassword(e.target.value)} className="input" data-cursor="text" /></F>
      </div>
      <div className="mt-4 rounded-2xl bg-slate-50 p-3">
        <div className="mb-2 text-xs font-bold text-slate-500">مطب و منشی</div>
        <div className="grid gap-3 sm:grid-cols-2">
          <F label="نام مطب"><input value={clinic.name} onChange={(e) => setClinic((c) => ({ ...c, name: e.target.value }))} className="input" data-cursor="text" /></F>
          <F label="تلفن مطب"><input value={clinic.phone} onChange={(e) => setClinic((c) => ({ ...c, phone: e.target.value }))} className="input" data-cursor="text" /></F>
          <F label="فامیل منشی"><input value={secretary} onChange={(e) => setSecretary(e.target.value)} className="input" data-cursor="text" /></F>
        </div>
        <F label="آدرس مطب"><input value={clinic.address} onChange={(e) => setClinic((c) => ({ ...c, address: e.target.value }))} className="input mt-3" data-cursor="text" /></F>
      </div>
      <button onClick={save} data-cursor="hover" className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/30"><Icon name="check" className="h-4 w-4" />ذخیره تغییرات</button>
    </Overlay>
  );
}
