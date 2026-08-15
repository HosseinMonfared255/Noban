"use client";

import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { doctors } from "../data";
import type { Nav } from "../nav";
import Icon from "../components/Icon";
import PanelWeekly from "../components/PanelWeekly";
import PanelSecretary from "../components/PanelSecretary";
import PanelAdminChat from "../components/PanelAdminChat";
import PanelSupport from "../components/PanelSupport";

const toFa = (s: string | number) =>
  String(s).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);
const faNum = (n: number) => n.toLocaleString("fa-IR");

type Tab = "dashboard" | "weekly" | "clinic" | "secretary" | "patients" | "reviews" | "finance" | "support" | "admin" | "profile";

export type Profile = {
  name: string;
  specialty: string;
  phone: string;
  email: string;
  about: string;
  experience: number;
  fee: number;
  location: string;
  photo: string;
  username: string;
  password: string;
  banner: string;
};

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "dashboard", label: "داشبورد", icon: "chart" },
  { id: "weekly", label: "برنامه هفتگی", icon: "calendar" },
  { id: "clinic", label: "مدیریت مطب", icon: "location" },
  { id: "secretary", label: "منشی", icon: "user" },
  { id: "patients", label: "بیماران", icon: "user" },
  { id: "reviews", label: "نظرات", icon: "star" },
  { id: "finance", label: "مالی", icon: "wallet" },
  { id: "support", label: "پشتیبانی", icon: "phone" },
  { id: "admin", label: "ارتباط با مدیر", icon: "mail" },
  { id: "profile", label: "پروفایل", icon: "user" },
];

/* ---------------- mock data ---------------- */
const todayPatients = [
  { name: "نگار حسینی", time: "۰۹:۰۰", service: "ویزیت قلب", status: "done" },
  { name: "محمد رستمی", time: "۱۰:۳۰", service: "اکو قلب", status: "waiting" },
  { name: "زهرا کاظمی", time: "۱۲:۰۰", service: "ویزیت قلب", status: "waiting" },
  { name: "سینا ملکی", time: "۱۶:۰۰", service: "نظارت فشار", status: "waiting" },
  { name: "پریسا اکبری", time: "۱۷:۳۰", service: "ویزیت قلب", status: "waiting" },
];

const patientsData = [
  { name: "نگار حسینی", visits: 8, rating: 5, last: "امروز" },
  { name: "محمد رستمی", visits: 5, rating: 5, last: "امروز" },
  { name: "زهرا کاظمی", visits: 12, rating: 4, last: "امروز" },
  { name: "سینا ملکی", visits: 3, rating: 5, last: "امروز" },
  { name: "آرش کریمی", visits: 6, rating: 4, last: "۳ روز پیش" },
  { name: "مریم صادقی", visits: 9, rating: 5, last: "۱ هفته پیش" },
  { name: "بهرام نوری", visits: 2, rating: 3, last: "۲ هفته پیش" },
  { name: "الهام رضایی", visits: 4, rating: 5, last: "۱ ماه پیش" },
];

type Review = {
  id: number;
  name: string;
  rating: number;
  text: string;
  status: "approved" | "pending" | "rejected";
  reply?: string;
};
const initialReviews: Review[] = [
  { id: 1, name: "نگار حسینی", rating: 5, text: "بسیار دقیق و صبور بودند؛ ممنونم.", status: "approved", reply: "از لطف شما سپاسگزارم 🙏" },
  { id: 2, name: "محمد رستمی", rating: 5, text: "تشخیص عالی و توضیحات کامل.", status: "pending" },
  { id: 3, name: "زهرا کاظمی", rating: 4, text: "ویزیت خوب بود ولی کمی منتظر ماندم.", status: "pending" },
  { id: 4, name: "سینا ملکی", rating: 2, text: "محتوای نامناسب.", status: "rejected" },
];

const initialPayments = [
  { id: "۱۰۲۴", date: "۱۴ تیر", patient: "نگار حسینی", amount: 320000, status: "تسویه" },
  { id: "۱۰۲۳", date: "۱۴ تیر", patient: "محمد رستمی", amount: 320000, status: "تسویه" },
  { id: "۱۰۲۲", date: "۱۳ تیر", patient: "زهرا کاظمی", amount: 320000, status: "در انتظار" },
  { id: "۱۰۲۱", date: "۱۳ تیر", patient: "آرش کریمی", amount: 320000, status: "تسویه" },
  { id: "۱۰۲۰", date: "۱۲ تیر", patient: "مریم صادقی", amount: 320000, status: "تسویه" },
];

const revenueByPeriod = {
  day: { total: 1850000, chart: [{ label: "ش", value: 180 }, { label: "ی", value: 240 }, { label: "د", value: 150 }, { label: "س", value: 300 }, { label: "چ", value: 270 }, { label: "پ", value: 320 }, { label: "ج", value: 90 }] },
  month: { total: 48200000, chart: [{ label: "فرو", value: 32 }, { label: "ارد", value: 28 }, { label: "خرد", value: 41 }, { label: "تیر", value: 48 }, { label: "مرد", value: 39 }, { label: "شهر", value: 44 }] },
  year: { total: 580000000, chart: [{ label: "۱۴۰۱", value: 360 }, { label: "۱۴۰۲", value: 420 }, { label: "۱۴۰۳", value: 510 }, { label: "۱۴۰۴", value: 580 }] },
};

/* clinics */
export type Clinic = {
  id: number;
  name: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
  photos: string[];
  secretary: string;
  secretaryManaged: boolean;
};
const G = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=500&w=700`;
const initialClinics: Clinic[] = [
  { id: 1, name: "مطب ولیعصر", address: "تهران، خیابان ولیعصر، بالاتر از پارک‌وی، پلاک ۱۲۳", phone: "021-91002314", lat: 35.775, lng: 51.414, photos: [G(7108324), G(8459996), G(6809658)], secretary: "محمدی", secretaryManaged: true },
  { id: 2, name: "مطب سعادت‌آباد", address: "تهران، سعادت‌آباد، بلوار دریا، پلاک ۸۸", phone: "021-91005678", lat: 35.792, lng: 51.376, photos: [G(4269274), G(6627866)], secretary: "احمدی", secretaryManaged: false },
];

/* bank cards */
export type BankCard = { id: number; bank: string; number: string; holder: string; expiry: string };
const bankStyle: Record<string, string> = {
  "بانک ملت": "from-amber-500 to-rose-600",
  "بانک صادرات": "from-blue-600 to-indigo-700",
  "بانک ملی": "from-emerald-500 to-teal-700",
  "بانک پاسارگاد": "from-sky-500 to-blue-700",
  "بانک سپه": "from-slate-600 to-slate-800",
};
const gradFor = (b: string) => bankStyle[b] ?? "from-cyan-500 to-blue-700";
const initialCards: BankCard[] = [
  { id: 1, bank: "بانک ملت", number: "6219861901234567", holder: "سارا محمدی", expiry: "08/27" },
  { id: 2, bank: "بانک صادرات", number: "6037691123456789", holder: "سارا محمدی", expiry: "11/26" },
];

function exportCSV(filename: string, rows: (string | number)[][]) {
  const bom = "\uFEFF";
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function mapSrc(lat: number, lng: number) {
  return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.012}%2C${lat - 0.01}%2C${lng + 0.012}%2C${lat + 0.01}&layer=mapnik&marker=${lat}%2C${lng}`;
}

/* ---------------- UI bits ---------------- */
function Stars({ value, className = "h-3.5 w-3.5" }: { value: number; className?: string }) {
  return (
    <span className="inline-flex">
      {[0, 1, 2, 3, 4].map((i) => (
        <Icon key={i} name="star" className={`${className} ${i < value ? "fill-amber-500 text-amber-500" : "fill-slate-200 text-slate-200"}`} />
      ))}
    </span>
  );
}

function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex h-44 items-end gap-2">
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
          <span className="text-[10px] font-bold text-slate-400">{faNum(d.value)}</span>
          <div className="flex w-full flex-1 items-end">
            <motion.div initial={{ height: 0 }} animate={{ height: `${(d.value / max) * 100}%` }} transition={{ duration: 0.5 }} className="w-full rounded-t-lg bg-gradient-to-t from-cyan-500 to-blue-400" style={{ minHeight: 4 }} />
          </div>
          <span className="text-[10px] text-slate-500">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-3xl glass p-4 sm:p-5 ${className}`}>{children}</div>;
}

function Overlay({ children, onClose, dismissable = true }: { children: React.ReactNode; onClose: () => void; dismissable?: boolean }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={dismissable ? onClose : undefined} className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} onClick={(e) => e.stopPropagation()} className="glass max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl p-6">
        {children}
      </motion.div>
    </motion.div>
  );
}

/* 3D bank card */
function BankCard3D({ card, onEdit, onDelete }: { card: BankCard; onEdit: () => void; onDelete: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [t, setT] = useState({ rx: 0, ry: 0, gx: 50, gy: 50 });
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    setT({ rx: -(py - 0.5) * 18, ry: (px - 0.5) * 22, gx: px * 100, gy: py * 100 });
  };
  const reset = () => setT({ rx: 0, ry: 0, gx: 50, gy: 50 });
  const groups = card.number.replace(/\D/g, "").padEnd(16, "•").replace(/(.{4})/g, "$1 ").trim();
  return (
    <div style={{ perspective: 1100 }} className="group">
      <div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={reset}
        style={{ transform: `rotateX(${t.rx}deg) rotateY(${t.ry}deg)`, transformStyle: "preserve-3d" }}
        className="relative aspect-[1.586] w-full rounded-2xl p-5 text-white shadow-2xl shadow-black/30 transition-transform duration-150"
      >
        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradFor(card.bank)}`} />
        <div className="absolute inset-0 rounded-2xl opacity-70" style={{ background: `radial-gradient(circle at ${t.gx}% ${t.gy}%, rgba(255,255,255,.35), transparent 55%)` }} />
        {/* actions */}
        <div className="absolute left-3 top-3 z-10 flex gap-1.5 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100" style={{ transform: "translateZ(40px)" }}>
          <button onClick={onEdit} data-cursor="hover" className="grid h-7 w-7 place-items-center rounded-lg bg-white/25 backdrop-blur hover:bg-white/40"><Icon name="edit" className="h-3.5 w-3.5" /></button>
          <button onClick={onDelete} data-cursor="hover" className="grid h-7 w-7 place-items-center rounded-lg bg-white/25 backdrop-blur hover:bg-rose-500/70"><Icon name="trash" className="h-3.5 w-3.5" /></button>
        </div>
        {/* content */}
        <div className="relative flex h-full flex-col justify-between" style={{ transform: "translateZ(30px)" }}>
          <div className="flex items-start justify-between">
            <div className="h-8 w-11 rounded-md bg-gradient-to-br from-amber-200 to-yellow-500 shadow-inner">
              <div className="m-1 h-full rounded-sm border-t border-b border-amber-700/30" />
            </div>
            <span className="text-sm font-bold drop-shadow">{card.bank}</span>
          </div>
          <div className="text-base font-bold tabular-nums drop-shadow sm:text-lg" style={{ letterSpacing: "0.08em" }}>{toFa(groups)}</div>
          <div className="flex items-end justify-between text-xs">
            <div>
              <div className="text-[9px] opacity-70">دارنده کارت</div>
              <div className="font-bold">{card.holder}</div>
            </div>
            <div className="text-left">
              <div className="text-[9px] opacity-70">انقضا</div>
              <div className="font-bold tabular-nums">{toFa(card.expiry)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- modals ---------------- */
function ClinicModal({ initial, onSave, onClose }: { initial: Clinic | null; onSave: (c: Clinic) => void; onClose: () => void }) {
  const [f, setF] = useState<Clinic>(initial ?? { id: 0, name: "", address: "", phone: "", lat: 35.775, lng: 51.414, photos: [], secretary: "", secretaryManaged: false });
  const fileRef = useRef<HTMLInputElement>(null);
  const set = (k: keyof Clinic, v: any) => setF((p) => ({ ...p, [k]: v }));

  const onFiles = (files: FileList | null) => {
    if (!files) return;
    const room = 4 - f.photos.length;
    Array.from(files).slice(0, room).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => setF((p) => ({ ...p, photos: [...p.photos, reader.result as string].slice(0, 4) }));
      reader.readAsDataURL(file);
    });
  };

  return (
    <Overlay onClose={onClose}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-slate-900">{initial ? "ویرایش مطب" : "افزودن مطب"}</h3>
        <button onClick={onClose} data-cursor="hover" className="grid h-8 w-8 place-items-center rounded-lg bg-white/70 text-slate-500"><Icon name="close" className="h-4 w-4" /></button>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field label="نام مطب"><input value={f.name} onChange={(e) => set("name", e.target.value)} className="input" data-cursor="text" /></Field>
        <Field label="فامیل منشی مطب"><input value={f.secretary} onChange={(e) => set("secretary", e.target.value)} className="input" data-cursor="text" /></Field>
        <Field label="شماره تلفن مطب"><input value={f.phone} onChange={(e) => set("phone", e.target.value)} className="input" data-cursor="text" /></Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="عرض جغرافیایی"><input type="number" step="0.001" value={f.lat} onChange={(e) => set("lat", +e.target.value)} className="input" data-cursor="text" /></Field>
          <Field label="طول جغرافیایی"><input type="number" step="0.001" value={f.lng} onChange={(e) => set("lng", +e.target.value)} className="input" data-cursor="text" /></Field>
        </div>
      </div>
      <Field label="آدرس مطب" className="mt-3"><textarea value={f.address} onChange={(e) => set("address", e.target.value)} rows={2} className="input resize-none" data-cursor="text" /></Field>

      {/* photos */}
      <div className="mt-3">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-600">عکس‌های مطب (حداکثر ۴)</span>
          <span className="text-[11px] text-slate-400">{faNum(f.photos.length)}/۴</span>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {f.photos.map((p, i) => (
            <div key={i} className="relative aspect-square overflow-hidden rounded-xl">
              <img src={p} alt="" className="h-full w-full object-cover" />
              <button onClick={() => set("photos", f.photos.filter((_, k) => k !== i))} data-cursor="hover" className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-lg bg-black/50 text-white"><Icon name="trash" className="h-3 w-3" /></button>
            </div>
          ))}
          {f.photos.length < 4 && (
            <button onClick={() => fileRef.current?.click()} data-cursor="hover" className="grid aspect-square place-items-center rounded-xl border-2 border-dashed border-slate-300 text-slate-400 hover:border-cyan-400 hover:text-cyan-600">
              <Icon name="plus" className="h-6 w-6" />
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
      </div>

      {/* secretary management toggle */}
      <button onClick={() => set("secretaryManaged", !f.secretaryManaged)} data-cursor="hover" className="mt-3 flex w-full items-center justify-between rounded-2xl border border-slate-100 bg-white/60 p-3 text-right">
        <div><div className="flex items-center gap-2 text-sm font-bold text-slate-800"><Icon name="user" className="h-4 w-4 text-cyan-600" />مدیریت مطب توسط منشی</div><div className="text-[11px] text-slate-400">{f.secretaryManaged ? "منشی اجازه‌ی مدیریت مطب را دارد" : "منشی دسترسی مدیریت ندارد"}</div></div>
        <span className={`relative h-7 w-12 shrink-0 rounded-full transition ${f.secretaryManaged ? "bg-emerald-500" : "bg-slate-300"}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${f.secretaryManaged ? "left-1" : "right-1"}`} /></span>
      </button>

      {/* map preview */}
      <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200">
        <iframe title="map" src={mapSrc(f.lat, f.lng)} className="h-36 w-full border-0" loading="lazy" />
      </div>

      <button onClick={() => f.name.trim() && onSave(f)} data-cursor="hover" className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/30">
        <Icon name="check" className="h-4 w-4" /> ذخیره مطب
      </button>
    </Overlay>
  );
}

function CardModal({ initial, onSave, onClose }: { initial: BankCard | null; onSave: (c: BankCard) => void; onClose: () => void }) {
  const [f, setF] = useState<BankCard>(initial ?? { id: 0, bank: "بانک ملت", number: "", holder: "", expiry: "" });
  const banks = Object.keys(bankStyle);
  return (
    <Overlay onClose={onClose}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-slate-900">{initial ? "ویرایش کارت" : "افزودن کارت"}</h3>
        <button onClick={onClose} data-cursor="hover" className="grid h-8 w-8 place-items-center rounded-lg bg-white/70 text-slate-500"><Icon name="close" className="h-4 w-4" /></button>
      </div>
      <div className="mt-4 space-y-3">
        <Field label="بانک">
          <div className="relative">
            <select value={f.bank} onChange={(e) => setF((p) => ({ ...p, bank: e.target.value }))} className="input appearance-none">
              {banks.map((b) => <option key={b} className="bg-white">{b}</option>)}
              <option className="bg-white">بانک دیگر</option>
            </select>
            <Icon name="arrow" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-slate-400" />
          </div>
        </Field>
        <Field label="شماره کارت (۱۶ رقم)"><input inputMode="numeric" maxLength={16} value={f.number} onChange={(e) => setF((p) => ({ ...p, number: e.target.value.replace(/\D/g, "") }))} className="input tracking-widest" data-cursor="text" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="نام دارنده"><input value={f.holder} onChange={(e) => setF((p) => ({ ...p, holder: e.target.value }))} className="input" data-cursor="text" /></Field>
          <Field label="تاریخ انقضا (MM/YY)"><input value={f.expiry} onChange={(e) => setF((p) => ({ ...p, expiry: e.target.value }))} placeholder="08/27" className="input" data-cursor="text" /></Field>
        </div>
      </div>
      {/* live preview */}
      <div className="mt-4">
        <BankCard3D card={f.number ? f : { ...f, number: f.number.padEnd(16, "0") }} onEdit={() => {}} onDelete={() => {}} />
      </div>
      <button onClick={() => f.number.length >= 16 && f.holder.trim() && onSave(f)} data-cursor="hover" className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/30">
        <Icon name="check" className="h-4 w-4" /> ذخیره کارت
      </button>
    </Overlay>
  );
}

function ProfileModal({ initial, onSave, onClose }: { initial: Profile; onSave: (p: Profile) => void; onClose: () => void }) {
  const [f, setF] = useState<Profile>(initial);
  const fileRef = useRef<HTMLInputElement>(null);
  const set = (k: keyof Profile, v: any) => setF((p) => ({ ...p, [k]: v }));
  const onFile = (file?: File) => {
    if (!file) return;
    const r = new FileReader();
    r.onload = () => set("photo", r.result as string);
    r.readAsDataURL(file);
  };
  const bannerRef = useRef<HTMLInputElement>(null);
  const onBanner = (file?: File) => {
    if (!file) return;
    const r = new FileReader();
    r.onload = () => set("banner", r.result as string);
    r.readAsDataURL(file);
  };
  return (
    <Overlay onClose={onClose}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-slate-900">ویرایش پروفایل</h3>
        <button onClick={onClose} data-cursor="hover" className="grid h-8 w-8 place-items-center rounded-lg bg-white/70 text-slate-500"><Icon name="close" className="h-4 w-4" /></button>
      </div>
      <div className="mt-4 flex items-center gap-4">
        {f.photo ? <img src={f.photo} alt="" className="h-16 w-16 rounded-2xl object-cover object-top" /> : <div className="grid h-16 w-16 place-items-center rounded-2xl bg-cyan-50 text-cyan-600"><Icon name="user" className="h-7 w-7" /></div>}
        <button onClick={() => fileRef.current?.click()} data-cursor="hover" className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:border-cyan-300 hover:text-cyan-700">تغییر عکس</button>
        {f.photo && <button onClick={() => set("photo", "")} data-cursor="hover" className="text-xs font-bold text-rose-600">حذف عکس</button>}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
      </div>
      <div className="mt-4">
        <div className="mb-1.5 text-xs font-medium text-slate-600">تصویر بنر داشبورد (۱۶:۹)</div>
        <div className="relative aspect-video overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
          {f.banner ? <img src={f.banner} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-slate-300"><Icon name="spark" className="h-8 w-8" /></div>}
        </div>
        <div className="mt-2 flex gap-2">
          <button onClick={() => bannerRef.current?.click()} data-cursor="hover" className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:border-cyan-300 hover:text-cyan-700">تغییر بنر</button>
          {f.banner && <button onClick={() => set("banner", "")} data-cursor="hover" className="text-xs font-bold text-rose-600">حذف بنر</button>}
          <input ref={bannerRef} type="file" accept="image/*" className="hidden" onChange={(e) => onBanner(e.target.files?.[0])} />
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field label="نام و نام خانوادگی"><input value={f.name} onChange={(e) => set("name", e.target.value)} className="input" data-cursor="text" /></Field>
        <Field label="تخصص"><input value={f.specialty} onChange={(e) => set("specialty", e.target.value)} className="input" data-cursor="text" /></Field>
        <Field label="شماره تلفن"><input value={f.phone} onChange={(e) => set("phone", e.target.value)} className="input" data-cursor="text" /></Field>
        <Field label="ایمیل"><input value={f.email} onChange={(e) => set("email", e.target.value)} className="input" data-cursor="text" /></Field>
        <Field label="سابقه کار (سال)"><input type="number" value={f.experience} onChange={(e) => set("experience", +e.target.value)} className="input" data-cursor="text" /></Field>
        <Field label="هزینه ویزیت (تومان)"><input type="number" value={f.fee} onChange={(e) => set("fee", +e.target.value)} className="input" data-cursor="text" /></Field>
      </div>
      <div className="mt-3 rounded-2xl bg-slate-50 p-3">
        <div className="mb-2 text-xs font-bold text-slate-500">نام کاربری و رمز عبور</div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="نام کاربری"><input value={f.username} onChange={(e) => set("username", e.target.value)} className="input" data-cursor="text" /></Field>
          <Field label="رمز عبور"><input value={f.password} onChange={(e) => set("password", e.target.value)} className="input" data-cursor="text" /></Field>
        </div>
      </div>
      <Field label="آدرس مطب" className="mt-3"><input value={f.location} onChange={(e) => set("location", e.target.value)} className="input" data-cursor="text" /></Field>
      <Field label="درباره پزشک" className="mt-3"><textarea value={f.about} onChange={(e) => set("about", e.target.value)} rows={3} className="input resize-none" data-cursor="text" /></Field>
      <button onClick={() => onSave(f)} data-cursor="hover" className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/30"><Icon name="check" className="h-4 w-4" />ذخیره تغییرات</button>
    </Overlay>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-medium text-slate-600">{label}</span>
      {children}
    </label>
  );
}

/* ---------------- main ---------------- */
export default function DoctorPanel({ navigate }: { navigate: Nav }) {
  const me = doctors[0];
  const [tab, setTab] = useState<Tab>("dashboard");

  const [period, setPeriod] = useState<"day" | "month" | "year">("day");

  const [reviewsEnabled, setReviewsEnabled] = useState(true);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [replyId, setReplyId] = useState<number | null>(null);
  const [draft, setDraft] = useState("");

  const [payments] = useState(initialPayments);

  // clinics
  const [clinics, setClinics] = useState<Clinic[]>(initialClinics);
  const [clinicView, setClinicView] = useState<number | null>(null); // clinic id detail
  const [clinicEdit, setClinicEdit] = useState<{ open: boolean; initial: Clinic | null }>({ open: false, initial: null });

  // cards
  const [cards, setCards] = useState<BankCard[]>(initialCards);
  const [cardEdit, setCardEdit] = useState<{ open: boolean; initial: BankCard | null }>({ open: false, initial: null });

  // profile
  const initialProfile: Profile = { name: me.name, specialty: me.specialty, phone: me.phone, email: "s.mohammadi@noban.ir", about: me.about, experience: me.experience, fee: me.fee, location: me.location, photo: me.photo, username: "dr.mohammadi", password: "secret123", banner: "https://images.pexels.com/photos/7108324/pexels-photo-7108324.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=600&w=1067" };
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [deleted, setDeleted] = useState(false);
  const [profileEdit, setProfileEdit] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const saveProfile = (p: Profile) => { setProfile(p); setDeleted(false); setProfileEdit(false); };
  const doDelete = () => { setProfile({ name: "", specialty: "", phone: "", email: "", about: "", experience: 0, fee: 0, location: "", photo: "", username: "", password: "", banner: "" }); setDeleted(true); setConfirmDelete(false); };
  const restoreProfile = () => { setProfile(initialProfile); setDeleted(false); };

  // settlement
  const [settle, setSettle] = useState<{ open: boolean; amount: string; card: string; done: boolean }>({ open: false, amount: "", card: initialCards[0].bank, done: false });

  const totalRevenue = useMemo(() => payments.filter((p) => p.status === "تسویه").reduce((s, p) => s + p.amount, 0), [payments]);

  /* reviews handlers */
  const setReviewStatus = (id: number, status: Review["status"]) => setReviews((r) => r.map((x) => (x.id === id ? { ...x, status } : x)));
  const saveReply = (id: number) => { if (!draft.trim()) return; setReviews((r) => r.map((x) => (x.id === id ? { ...x, reply: draft.trim() } : x))); setReplyId(null); setDraft(""); };
  const deleteReply = (id: number) => setReviews((r) => r.map((x) => (x.id === id ? { ...x, reply: undefined } : x)));

  /* clinic handlers */
  const saveClinic = (c: Clinic) => {
    setClinics((prev) => (c.id ? prev.map((x) => (x.id === c.id ? c : x)) : [...prev, { ...c, id: Date.now() }]));
    setClinicEdit({ open: false, initial: null });
  };
  const deleteClinic = (id: number) => { setClinics((prev) => prev.filter((x) => x.id !== id)); setClinicView(null); };

  /* card handlers */
  const saveCard = (c: BankCard) => {
    setCards((prev) => (c.id ? prev.map((x) => (x.id === c.id ? c : x)) : [...prev, { ...c, id: Date.now() }]));
    setCardEdit({ open: false, initial: null });
  };
  const deleteCard = (id: number) => setCards((prev) => prev.filter((x) => x.id !== id));

  const requestSettle = () => { setSettle((s) => ({ ...s, done: true })); setTimeout(() => setSettle({ open: false, amount: "", card: cards[0]?.bank ?? "", done: false }), 1800); };

  const activeClinic = clinics.find((c) => c.id === clinicView) || null;

  return (
    <div className="min-h-screen pb-12 pt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* mobile sticky tabs */}
        <div className="sticky top-[4.5rem] z-30 mb-5 lg:hidden">
          <div className="no-scrollbar flex gap-2 overflow-x-auto rounded-2xl glass p-2">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => { setTab(t.id); setClinicView(null); }} data-cursor="hover" className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${tab === t.id ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white" : "text-slate-600"}`}><Icon name={t.icon} className="h-4 w-4" />{t.label}</button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
          {/* sidebar */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl glass p-4">
              <div className="flex items-center gap-3">
                {profile.photo ? <img src={profile.photo} alt={profile.name} className="h-12 w-12 rounded-2xl object-cover object-top" /> : <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-50 text-cyan-600"><Icon name="user" className="h-6 w-6" /></div>}
                <div className="min-w-0"><div className="truncate font-bold text-slate-900">{profile.name || "بدون نام"}</div><div className="text-xs text-cyan-700">{profile.specialty || "—"}</div></div>
              </div>
            </div>
            <nav className="mt-3 hidden gap-1.5 rounded-3xl glass p-2 lg:flex lg:flex-col">
              {TABS.map((t) => (
                <button key={t.id} onClick={() => { setTab(t.id); setClinicView(null); }} data-cursor="hover" className={`flex items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-bold transition ${tab === t.id ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25" : "text-slate-600 hover:bg-slate-100"}`}>
                  <Icon name={t.icon} className="h-5 w-5" />{t.label}
                </button>
              ))}
              <button onClick={() => navigate("home")} data-cursor="hover" className="mt-1 flex items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-bold text-slate-500 transition hover:bg-slate-100"><Icon name="logout" className="h-5 w-5" />بازگشت به سایت</button>
            </nav>
            {/* mobile tabs rendered as sticky bar above the grid */}
          </aside>

          {/* content */}
          <section>
            <AnimatePresence mode="wait">
              <motion.div key={tab + (clinicView ?? "")} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>

                {/* ===== DASHBOARD ===== */}
                {tab === "dashboard" && (
                  <div className="space-y-5">
                    {profile.banner && (
                      <div className="relative overflow-hidden rounded-3xl shadow-lg shadow-cyan-500/10">
                        <img src={profile.banner} alt="" className="aspect-[16/9] w-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                        <div className="absolute bottom-4 right-5 flex items-center gap-3">
                          {profile.photo ? <img src={profile.photo} alt="" className="h-12 w-12 rounded-2xl object-cover object-top ring-2 ring-white/80" /> : <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/30 text-white"><Icon name="user" className="h-6 w-6" /></div>}
                          <div className="text-white drop-shadow"><div className="text-lg font-black sm:text-2xl">سلام، {profile.name || "پزشک"} 👋</div><div className="text-xs text-white/85 sm:text-sm">خوش آمدید به پنل پزشک</div></div>
                        </div>
                      </div>
                    )}
                    <div><h1 className="text-2xl font-black text-slate-900">داشبورد</h1><p className="text-sm text-slate-500">خلاصه‌ی وضعیت امروز شما</p></div>
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                      {[{ label: "نوبت‌های امروز", value: faNum(todayPatients.length), icon: "calendar", tone: "text-cyan-600 bg-cyan-50" }, { label: "درآمد امروز", value: toFa("۱٬۸۵۰٬۰۰۰") + " ت", icon: "wallet", tone: "text-emerald-600 bg-emerald-50" }, { label: "بیماران جدید", value: faNum(7), icon: "user", tone: "text-violet-600 bg-violet-50" }, { label: "میانگین امتیاز", value: toFa("۴٫۸"), icon: "star", tone: "text-amber-600 bg-amber-50" }].map((s) => (
                        <Panel key={s.label}><div className={`mb-3 inline-flex rounded-xl p-2 ${s.tone}`}><Icon name={s.icon} className="h-5 w-5" /></div><div className="text-lg font-black leading-tight text-slate-900 sm:text-xl">{s.value}</div><div className="text-xs text-slate-500">{s.label}</div></Panel>
                      ))}
                    </div>
                    <div className="grid gap-5 lg:grid-cols-2">
                      <Panel>
                        <div className="mb-4 flex items-center justify-between"><h3 className="font-bold text-slate-900">بیماران رزروشده‌ی امروز</h3><span className="rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-bold text-cyan-700">{faNum(todayPatients.length)} نفر</span></div>
                        <div className="space-y-2.5">
                          {todayPatients.map((p) => (
                            <div key={p.name} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white/60 p-3">
                              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan-50 text-sm font-bold text-cyan-700">{toFa(p.time)}</span>
                              <div className="min-w-0 flex-1"><div className="truncate text-sm font-bold text-slate-800">{p.name}</div><div className="text-xs text-slate-500">{p.service}</div></div>
                              <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${p.status === "done" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>{p.status === "done" ? "ویزیت شد" : "در انتظار"}</span>
                            </div>
                          ))}
                        </div>
                      </Panel>
                      <Panel>
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h3 className="font-bold text-slate-900">درآمد</h3>
                          <div className="flex rounded-xl border border-slate-200 bg-white p-1 text-xs font-bold">
                            {(["day", "month", "year"] as const).map((p) => (<button key={p} onClick={() => setPeriod(p)} data-cursor="hover" className={`rounded-lg px-3 py-1.5 transition ${period === p ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white" : "text-slate-500"}`}>{p === "day" ? "روز" : p === "month" ? "ماه" : "سال"}</button>))}
                          </div>
                        </div>
                        <div className="mb-1 text-xs text-slate-500">درآمد {period === "day" ? "امروز" : period === "month" ? "این ماه" : "این سال"}</div>
                        <div className="mb-4 text-2xl font-black text-slate-900">{toFa(revenueByPeriod[period].total.toLocaleString("fa-IR"))} <span className="text-sm font-medium text-slate-400">تومان</span></div>
                        <BarChart data={revenueByPeriod[period].chart} />
                      </Panel>
                    </div>
                  </div>
                )}

                {/* ===== CLINIC ===== */}
                {tab === "clinic" && (
                  activeClinic ? (
                    <div className="space-y-5">
                      <button onClick={() => setClinicView(null)} data-cursor="hover" className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/70 px-4 py-1.5 text-sm font-medium text-slate-600 hover:border-cyan-300 hover:text-cyan-700"><Icon name="arrow" className="h-4 w-4 rotate-180" />بازگشت به لیست مطب‌ها</button>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h1 className="text-2xl font-black text-slate-900">{activeClinic.name}</h1>
                        <div className="flex gap-2">
                          <button onClick={() => setClinicEdit({ open: true, initial: activeClinic })} data-cursor="hover" className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:border-cyan-300 hover:text-cyan-700"><Icon name="edit" className="h-4 w-4" />ویرایش</button>
                          <button onClick={() => deleteClinic(activeClinic.id)} data-cursor="hover" className="flex items-center gap-1.5 rounded-xl bg-rose-50 px-4 py-2 text-sm font-bold text-rose-600 hover:bg-rose-100"><Icon name="trash" className="h-4 w-4" />حذف</button>
                        </div>
                      </div>
                      <div className="grid gap-5 lg:grid-cols-2">
                        <div className="space-y-4">
                          <Panel><h3 className="mb-2 flex items-center gap-2 font-bold text-slate-900"><Icon name="location" className="h-4 w-4 text-cyan-600" />آدرس</h3><p className="text-sm leading-relaxed text-slate-600">{activeClinic.address}</p></Panel>
                          <Panel><h3 className="mb-2 flex items-center gap-2 font-bold text-slate-900"><Icon name="phone" className="h-4 w-4 text-cyan-600" />شماره تلفن</h3><a href={`tel:${activeClinic.phone}`} data-cursor="hover" className="text-lg font-black text-cyan-700">{toFa(activeClinic.phone)}</a>
                            <div className="mt-3 border-t border-slate-100 pt-3"><div className="text-xs text-slate-500">منشی مطب</div><div className="font-bold text-slate-800">{activeClinic.secretary || "—"}</div></div>
                          </Panel>
                          <button onClick={() => setClinics((prev) => prev.map((c) => c.id === activeClinic.id ? { ...c, secretaryManaged: !c.secretaryManaged } : c))} data-cursor="hover" className="flex items-center justify-between rounded-3xl glass p-5 text-right">
                            <div><div className="flex items-center gap-2 font-bold text-slate-900"><Icon name="user" className="h-5 w-5 text-cyan-600" />مدیریت مطب توسط منشی</div><div className="mt-1 text-xs text-slate-500">{activeClinic.secretaryManaged ? "منشی می‌تواند وضعیت مطب و صف را مدیریت کند" : "دسترسی مدیریت مطب برای منشی غیرفعال است"}</div></div>
                            <span className={`relative h-7 w-12 shrink-0 rounded-full transition ${activeClinic.secretaryManaged ? "bg-emerald-500" : "bg-slate-300"}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${activeClinic.secretaryManaged ? "left-1" : "right-1"}`} /></span>
                          </button>
                        </div>
                        <div className="space-y-4">
                          <Panel><h3 className="mb-3 font-bold text-slate-900">نقشه</h3><div className="overflow-hidden rounded-2xl border border-slate-200"><iframe title="map" src={mapSrc(activeClinic.lat, activeClinic.lng)} className="h-56 w-full border-0" loading="lazy" /></div></Panel>
                          <Panel><h3 className="mb-3 font-bold text-slate-900">عکس‌های مطب ({faNum(activeClinic.photos.length)})</h3>
                            {activeClinic.photos.length ? (
                              <div className="grid grid-cols-2 gap-2">{activeClinic.photos.map((p, i) => <img key={i} src={p} alt="" className="aspect-video w-full rounded-xl object-cover" />)}</div>
                            ) : <p className="text-sm text-slate-400">عکسی ثبت نشده است.</p>}
                          </Panel>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-black text-slate-900">مدیریت مطب</h1><p className="text-sm text-slate-500">مطب‌های ثبت‌شده‌ی شما</p></div>
                        <button onClick={() => setClinicEdit({ open: true, initial: null })} data-cursor="hover" className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/25"><Icon name="plus" className="h-4 w-4" />افزودن مطب</button>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {clinics.map((c) => (
                          <button key={c.id} onClick={() => setClinicView(c.id)} data-cursor="hover" className="group overflow-hidden rounded-3xl glass text-right transition hover:shadow-xl hover:shadow-cyan-500/10">
                            <div className="relative h-36 overflow-hidden">
                              <img src={c.photos[0] || G(7108324)} alt={c.name} className="h-full w-full object-cover transition group-hover:scale-105" />
                              <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent" />
                              <div className="absolute bottom-3 right-3 text-lg font-black text-slate-900">{c.name}</div>
                            </div>
                            <div className="space-y-2 p-4 text-xs text-slate-500">
                              <div className="flex items-center gap-2"><Icon name="location" className="h-4 w-4 text-cyan-600" /><span className="line-clamp-1">{c.address}</span></div>
                              <div className="flex items-center justify-between"><span className="flex items-center gap-2"><Icon name="phone" className="h-4 w-4 text-cyan-600" />{toFa(c.phone)}</span><span className="flex items-center gap-1.5"><Icon name="user" className="h-4 w-4 text-cyan-600" />منشی: {c.secretary || "—"}</span></div>
                            </div>
                          </button>
                        ))}
                        {clinics.length === 0 && <Panel className="sm:col-span-2 text-center text-sm text-slate-400">هنوز مطبی ثبت نشده است.</Panel>}
                      </div>
                    </div>
                  )
                )}

                {/* ===== PATIENTS ===== */}
                {tab === "patients" && (
                  <div className="space-y-5">
                    <div><h1 className="text-2xl font-black text-slate-900">بیماران</h1><p className="text-sm text-slate-500">لیست بیمارانی که تاکنون ویزیت شده‌اند</p></div>
                    <Panel className="overflow-hidden p-0">
                      <div className="hidden grid-cols-[2fr_1fr_1fr_1fr] gap-2 border-b border-slate-100 bg-white/60 px-5 py-3 text-xs font-bold text-slate-500 sm:grid"><span>بیمار</span><span className="text-center">تعداد رزرو</span><span className="text-center">امتیاز ثبت‌شده</span><span className="text-center">آخرین ویزیت</span></div>
                      <div className="divide-y divide-slate-100">
                        {patientsData.map((p) => (
                          <div key={p.name} className="px-5 py-3 transition hover:bg-cyan-50/40">
                            {/* mobile card */}
                            <div className="flex items-center gap-3 sm:hidden">
                              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-sm font-bold text-white">{p.name.charAt(0)}</span>
                              <div className="min-w-0 flex-1">
                                <div className="truncate text-sm font-bold text-slate-800">{p.name}</div>
                                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px]">
                                  <span className="rounded-md bg-cyan-50 px-1.5 py-0.5 font-bold text-cyan-700">{faNum(p.visits)} رزرو</span>
                                  <Stars value={p.rating} className="h-3 w-3" />
                                  <span className="text-slate-400">{p.last}</span>
                                </div>
                              </div>
                            </div>
                            {/* desktop row */}
                            <div className="hidden grid-cols-[2fr_1fr_1fr_1fr] items-center gap-2 sm:grid">
                              <div className="flex items-center gap-2.5"><span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-xs font-bold text-white">{p.name.charAt(0)}</span><span className="text-sm font-bold text-slate-800">{p.name}</span></div>
                              <span className="text-center text-sm font-bold text-cyan-700">{faNum(p.visits)}</span>
                              <span className="flex justify-center"><Stars value={p.rating} /></span>
                              <span className="text-center text-xs text-slate-500">{p.last}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Panel>
                  </div>
                )}

                {/* ===== REVIEWS ===== */}
                {tab === "reviews" && (
                  <div className="space-y-5">
                    <div><h1 className="text-2xl font-black text-slate-900">نظرات</h1><p className="text-sm text-slate-500">مدیریت نظرات کاربران در صفحه‌ی دکتر</p></div>
                    <Panel className="flex items-center justify-between">
                      <div><div className="font-bold text-slate-900">نظرات در صفحه‌ی دکتر</div><div className="text-xs text-slate-500">{reviewsEnabled ? "نظرات برای بیماران نمایش داده می‌شود" : "بخش نظرات غیرفعال است"}</div></div>
                      <button onClick={() => setReviewsEnabled((v) => !v)} data-cursor="hover" className={`relative h-8 w-14 rounded-full transition ${reviewsEnabled ? "bg-emerald-500" : "bg-slate-300"}`}><motion.span layout transition={{ type: "spring", stiffness: 500, damping: 30 }} className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow ${reviewsEnabled ? "left-1" : "right-1"}`} /></button>
                    </Panel>
                    <div className="space-y-3">
                      {reviews.map((r) => (
                        <Panel key={r.id}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2.5"><span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-xs font-bold text-white">{r.name.charAt(0)}</span><div><div className="text-sm font-bold text-slate-800">{r.name}</div><Stars value={r.rating} className="h-3 w-3" /></div></div>
                            <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${r.status === "approved" ? "bg-emerald-50 text-emerald-600" : r.status === "rejected" ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"}`}>{r.status === "approved" ? "تأیید شده" : r.status === "rejected" ? "رد شده" : "در انتظار"}</span>
                          </div>
                          <p className="mt-3 text-sm leading-relaxed text-slate-600">{r.text}</p>
                          {r.reply && replyId !== r.id && (
                            <div className="mt-3 rounded-2xl bg-cyan-50/70 p-3"><div className="mb-1 text-[11px] font-bold text-cyan-700">پاسخ شما</div><p className="text-sm text-slate-700">{r.reply}</p>
                              <div className="mt-2 flex gap-2"><button onClick={() => { setReplyId(r.id); setDraft(r.reply ?? ""); }} data-cursor="hover" className="flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:text-cyan-700"><Icon name="edit" className="h-3.5 w-3.5" />ویرایش</button><button onClick={() => deleteReply(r.id)} data-cursor="hover" className="flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-50"><Icon name="trash" className="h-3.5 w-3.5" />حذف</button></div>
                            </div>
                          )}
                          {replyId === r.id && (
                            <div className="mt-3"><textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={2} placeholder="پاسخ خود را بنویسید…" className="input resize-none" data-cursor="text" />
                              <div className="mt-2 flex gap-2"><button onClick={() => saveReply(r.id)} data-cursor="hover" className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-bold text-white">ذخیره پاسخ</button><button onClick={() => { setReplyId(null); setDraft(""); }} data-cursor="hover" className="rounded-lg bg-white px-4 py-2 text-xs font-bold text-slate-500">انصراف</button></div>
                            </div>
                          )}
                          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                            {r.status !== "approved" && <button onClick={() => setReviewStatus(r.id, "approved")} data-cursor="hover" className="flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600"><Icon name="check" className="h-3.5 w-3.5" />تأیید</button>}
                            {r.status !== "rejected" && <button onClick={() => setReviewStatus(r.id, "rejected")} data-cursor="hover" className="flex items-center gap-1 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600"><Icon name="close" className="h-3.5 w-3.5" />رد</button>}
                            {!r.reply && replyId !== r.id && <button onClick={() => { setReplyId(r.id); setDraft(""); }} data-cursor="hover" className="flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600"><Icon name="edit" className="h-3.5 w-3.5" />پاسخ</button>}
                          </div>
                        </Panel>
                      ))}
                    </div>
                  </div>
                )}

                {/* ===== FINANCE ===== */}
                {tab === "finance" && (
                  <div className="space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div><h1 className="text-2xl font-black text-slate-900">مالی</h1><p className="text-sm text-slate-500">مدیریت درآمد، کارت‌ها و تسویه‌حساب</p></div>
                      <div className="flex gap-2">
                        <button onClick={() => setSettle({ open: true, amount: "", card: cards[0]?.bank ?? "", done: false })} data-cursor="hover" className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/25"><Icon name="wallet" className="h-4 w-4" />درخواست تسویه</button>
                        <button onClick={() => exportCSV("payments.csv", [["کد", "تاریخ", "بیمار", "مبلغ (تومان)", "وضعیت"], ...payments.map((p) => [p.id, p.date, p.patient, p.amount, p.status])])} data-cursor="hover" className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 hover:border-cyan-300 hover:text-cyan-700"><Icon name="download" className="h-4 w-4" />خروجی اکسل</button>
                      </div>
                    </div>

                    <Panel><div className="text-xs text-slate-500">درآمد کل (تسویه‌شده)</div><div className="mt-1 text-3xl font-black text-slate-900">{toFa(totalRevenue.toLocaleString("fa-IR"))} <span className="text-sm font-medium text-slate-400">تومان</span></div></Panel>

                    {/* cards section */}
                    <div className="rounded-3xl glass p-5">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="flex items-center gap-2 font-bold text-slate-900"><Icon name="wallet" className="h-5 w-5 text-cyan-600" />کارت‌های بانکی</h3>
                        <button onClick={() => setCardEdit({ open: true, initial: null })} data-cursor="hover" className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:border-cyan-300 hover:text-cyan-700"><Icon name="plus" className="h-4 w-4" />افزودن کارت</button>
                      </div>
                      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                        {cards.map((c) => <BankCard3D key={c.id} card={c} onEdit={() => setCardEdit({ open: true, initial: c })} onDelete={() => deleteCard(c.id)} />)}
                        {cards.length === 0 && <p className="text-sm text-slate-400">کارتی ثبت نشده است.</p>}
                      </div>
                    </div>

                    {/* payments */}
                    <Panel className="overflow-hidden p-0">
                      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3"><h3 className="font-bold text-slate-900">لیست پرداخت‌ها</h3><span className="text-xs text-slate-500">{faNum(payments.length)} تراکنش</span></div>
                      <div className="hidden grid-cols-[1fr_1.4fr_1fr_1fr] gap-2 border-b border-slate-100 bg-white/60 px-5 py-3 text-xs font-bold text-slate-500 sm:grid"><span>کد</span><span>بیمار</span><span className="text-center">مبلغ</span><span className="text-center">وضعیت</span></div>
                      <div className="divide-y divide-slate-100">
                        {payments.map((p) => (
                          <div key={p.id} className="px-5 py-3 transition hover:bg-cyan-50/40">
                            {/* mobile card */}
                            <div className="flex items-center justify-between gap-3 sm:hidden">
                              <div className="min-w-0">
                                <div className="truncate text-sm font-bold text-slate-800">{p.patient}</div>
                                <div className="text-[11px] text-slate-400">#{toFa(p.id)} · {p.date}</div>
                              </div>
                              <div className="shrink-0 text-left">
                                <div className="text-sm font-bold text-slate-700">{toFa(p.amount.toLocaleString("fa-IR"))} ت</div>
                                <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${p.status === "تسویه" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>{p.status}</span>
                              </div>
                            </div>
                            {/* desktop row */}
                            <div className="hidden grid-cols-[1fr_1.4fr_1fr_1fr] items-center gap-2 sm:grid">
                              <span className="text-xs font-bold text-slate-500">#{toFa(p.id)}</span><span className="text-sm font-bold text-slate-800">{p.patient}</span><span className="text-center text-sm font-bold text-slate-700">{toFa(p.amount.toLocaleString("fa-IR"))}</span>
                              <span className="text-center"><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${p.status === "تسویه" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>{p.status}</span></span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Panel>
                  </div>
                )}

                {/* ===== WEEKLY ===== */}
                {tab === "weekly" && <PanelWeekly />}

                {/* ===== SECRETARY ===== */}
                {tab === "secretary" && <PanelSecretary clinics={clinics.map((c) => ({ id: c.id, name: c.name, photo: c.photos[0] }))} />}

                {/* ===== ADMIN CHAT ===== */}
                {tab === "admin" && <PanelAdminChat />}

                {/* ===== SUPPORT ===== */}
                {tab === "support" && <PanelSupport />}

                {/* ===== PROFILE ===== */}
                {tab === "profile" && (
                  deleted ? (
                    <div className="flex flex-col items-center py-20 text-center">
                      <div className="grid h-20 w-20 place-items-center rounded-full bg-rose-50 text-rose-400"><Icon name="trash" className="h-9 w-9" /></div>
                      <h2 className="mt-4 text-xl font-black text-slate-900">پروفایل شما حذف شد</h2>
                      <p className="mt-1 text-sm text-slate-500">می‌توانید پروفایل را به حالت اولیه بازیابی کنید.</p>
                      <button onClick={restoreProfile} data-cursor="hover" className="mt-5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/30">بازیابی پروفایل</button>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <Panel>
                        <div className="flex flex-col items-center gap-4 sm:flex-row">
                          {profile.photo ? <img src={profile.photo} alt={profile.name} className="h-24 w-24 rounded-3xl object-cover object-top ring-4 ring-white shadow" /> : <div className="grid h-24 w-24 place-items-center rounded-3xl bg-cyan-50 text-cyan-600"><Icon name="user" className="h-10 w-10" /></div>}
                          <div className="flex-1 text-center sm:text-right">
                            <h1 className="text-2xl font-black text-slate-900">{profile.name || "بدون نام"}</h1>
                            <div className="text-cyan-700">{profile.specialty || "—"}</div>
                            <p className="mt-2 max-w-md text-sm text-slate-500">{profile.about || "—"}</p>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => setProfileEdit(true)} data-cursor="hover" className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:border-cyan-300 hover:text-cyan-700"><Icon name="edit" className="h-4 w-4" />ویرایش</button>
                            <button onClick={() => setConfirmDelete(true)} data-cursor="hover" className="flex items-center gap-1.5 rounded-xl bg-rose-50 px-4 py-2 text-sm font-bold text-rose-600 hover:bg-rose-100"><Icon name="trash" className="h-4 w-4" />حذف پروفایل</button>
                          </div>
                        </div>
                      </Panel>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Panel><div className="mb-2 inline-flex rounded-xl bg-cyan-50 p-2 text-cyan-600"><Icon name="phone" className="h-5 w-5" /></div><div className="text-xs text-slate-500">شماره تلفن</div><a href={`tel:${profile.phone}`} data-cursor="hover" className="font-bold text-slate-900">{profile.phone ? toFa(profile.phone) : "—"}</a></Panel>
                        <Panel><div className="mb-2 inline-flex rounded-xl bg-cyan-50 p-2 text-cyan-600"><Icon name="mail" className="h-5 w-5" /></div><div className="text-xs text-slate-500">ایمیل</div><div className="font-bold text-slate-900">{profile.email || "—"}</div></Panel>
                        <Panel><div className="mb-2 inline-flex rounded-xl bg-cyan-50 p-2 text-cyan-600"><Icon name="stethoscope" className="h-5 w-5" /></div><div className="text-xs text-slate-500">سابقه کار</div><div className="font-bold text-slate-900">{profile.experience ? toFa(profile.experience) + " سال" : "—"}</div></Panel>
                        <Panel><div className="mb-2 inline-flex rounded-xl bg-cyan-50 p-2 text-cyan-600"><Icon name="wallet" className="h-5 w-5" /></div><div className="text-xs text-slate-500">هزینه ویزیت</div><div className="font-bold text-slate-900">{profile.fee ? toFa(profile.fee.toLocaleString("fa-IR")) + " ت" : "—"}</div></Panel>
                        <Panel className="sm:col-span-2"><div className="mb-2 inline-flex rounded-xl bg-cyan-50 p-2 text-cyan-600"><Icon name="location" className="h-5 w-5" /></div><div className="text-xs text-slate-500">آدرس مطب</div><div className="font-bold text-slate-900">{profile.location || "—"}</div></Panel>
                      </div>
                    </div>
                  )
                )}
              </motion.div>
            </AnimatePresence>
          </section>
        </div>
      </div>

      {/* modals */}
      <AnimatePresence>
        {clinicEdit.open && <ClinicModal key="cm" initial={clinicEdit.initial} onSave={saveClinic} onClose={() => setClinicEdit({ open: false, initial: null })} />}
        {cardEdit.open && <CardModal key="cardm" initial={cardEdit.initial} onSave={saveCard} onClose={() => setCardEdit({ open: false, initial: null })} />}
        {profileEdit && <ProfileModal key="pm" initial={profile} onSave={saveProfile} onClose={() => setProfileEdit(false)} />}
        {confirmDelete && (
          <Overlay key="del" onClose={() => setConfirmDelete(false)}>
            <div className="text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-rose-50 text-rose-500"><Icon name="trash" className="h-8 w-8" /></div>
              <h3 className="mt-4 text-lg font-black text-slate-900">حذف پروفایل؟</h3>
              <p className="mt-1 text-sm text-slate-500">با حذف، مشخصات و عکس پروفایل پاک می‌شود. این عمل قابل بازیابی است.</p>
              <div className="mt-5 flex gap-2">
                <button onClick={doDelete} data-cursor="hover" className="flex-1 rounded-xl bg-rose-500 py-2.5 text-sm font-bold text-white">بله، حذف کن</button>
                <button onClick={() => setConfirmDelete(false)} data-cursor="hover" className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-bold text-slate-600">انصراف</button>
              </div>
            </div>
          </Overlay>
        )}
      </AnimatePresence>

      {/* settlement */}
      <AnimatePresence>
        {settle.open && (
          <motion.div key="settle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !settle.done && setSettle((s) => ({ ...s, open: false }))} className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} onClick={(e) => e.stopPropagation()} className="glass w-full max-w-md rounded-3xl p-6">
              {settle.done ? (
                <div className="flex flex-col items-center py-6 text-center">
                  <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 200, damping: 12 }} className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 shadow-xl shadow-emerald-500/40"><Icon name="check" className="h-8 w-8 text-white" /></motion.div>
                  <h3 className="mt-4 text-lg font-black text-slate-900">درخواست ارسال شد</h3><p className="mt-1 text-sm text-slate-500">درخواست تسویه‌ی شما برای مدیر ارسال شد.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between"><h3 className="text-lg font-black text-slate-900">درخواست تسویه‌حساب</h3><button onClick={() => setSettle((s) => ({ ...s, open: false }))} data-cursor="hover" className="grid h-8 w-8 place-items-center rounded-lg bg-white/70 text-slate-500"><Icon name="close" className="h-4 w-4" /></button></div>
                  <div className="mt-4 space-y-3">
                    <Field label="مبلغ تسویه (تومان)"><input value={settle.amount} onChange={(e) => setSettle((s) => ({ ...s, amount: e.target.value }))} inputMode="numeric" placeholder="مثلاً ۱۰۰۰۰۰۰" className="input" data-cursor="text" /></Field>
                    <Field label="کارت مقصد"><div className="relative"><select value={settle.card} onChange={(e) => setSettle((s) => ({ ...s, card: e.target.value }))} className="input appearance-none">{cards.map((c) => <option key={c.id} className="bg-white">{c.bank} •••• {toFa(c.number.slice(-4))}</option>)}{cards.length === 0 && <option className="bg-white">کارتی وجود ندارد</option>}</select><Icon name="arrow" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-slate-400" /></div></Field>
                  </div>
                  <button onClick={requestSettle} data-cursor="hover" className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/30"><Icon name="check" className="h-4 w-4" />ثبت درخواست برای مدیر</button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
