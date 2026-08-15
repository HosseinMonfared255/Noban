"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Icon from "../components/Icon";

const toFa = (s: string | number) => String(s).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);
const SECTIONS = ["داشبورد", "برنامه هفتگی", "بیماران", "نظرات", "مالی", "پشتیبانی"];

export type SecClinic = { id: number; name: string; photo?: string };
type Secretary = {
  name: string; phone: string; email: string;
  username: string; password: string;
  permanent: boolean; expiry: string;
  fullAccess: boolean; perms: Record<string, boolean>;
};
const newSec = (): Secretary => ({ name: "", phone: "", email: "", username: "", password: "", permanent: true, expiry: "", fullAccess: true, perms: Object.fromEntries(SECTIONS.map((s) => [s, true])) });

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} onClick={(e) => e.stopPropagation()} className="glass max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl p-6">{children}</motion.div>
    </motion.div>
  );
}

export default function PanelSecretary({ clinics }: { clinics: SecClinic[] }) {
  const [secrets, setSecrets] = useState<Record<number, Secretary | undefined>>({});
  const [openId, setOpenId] = useState<number | null>(null);
  const [modal, setModal] = useState<{ id: number; sec: Secretary } | null>(null);

  const active = clinics.find((c) => c.id === openId) || null;

  const save = () => { if (!modal) return; setSecrets((p) => ({ ...p, [modal.id]: modal.sec })); setModal(null); };
  const remove = (id: number) => setSecrets((p) => ({ ...p, [id]: undefined }));

  if (active) {
    const sec = secrets[active.id];
    return (
      <div className="space-y-5">
        <button onClick={() => setOpenId(null)} data-cursor="hover" className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/70 px-4 py-1.5 text-sm font-medium text-slate-600 hover:border-cyan-300 hover:text-cyan-700"><Icon name="arrow" className="h-4 w-4 rotate-180" />بازگشت به لیست مطب‌ها</button>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-black text-slate-900">منشی مطب {active.name}</h1>
          {!sec && <button onClick={() => setModal({ id: active.id, sec: newSec() })} data-cursor="hover" className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/25"><Icon name="plus" className="h-4 w-4" />تعیین منشی</button>}
        </div>

        {sec ? (
          <div className="rounded-3xl glass p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 font-bold text-white">{sec.name.charAt(0) || "؟"}</span>
                <div><div className="font-bold text-slate-900">{sec.name || "بدون نام"}</div><div className="text-xs text-slate-500">{sec.phone || "—"}</div></div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setModal({ id: active.id, sec })} data-cursor="hover" className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 hover:border-cyan-300 hover:text-cyan-700"><Icon name="edit" className="h-4 w-4" />ویرایش</button>
                <button onClick={() => remove(active.id)} data-cursor="hover" className="flex items-center gap-1.5 rounded-xl bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-100"><Icon name="trash" className="h-4 w-4" />حذف</button>
              </div>
            </div>
            <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2">
              <Info label="نام کاربری" value={sec.username || "—"} icon="user" />
              <Info label="رمز عبور" value={"•".repeat(Math.min(8, sec.password.length || 0)) || "—"} icon="shield" />
              <Info label="اعتبار" value={sec.permanent ? "دائم" : (sec.expiry ? toFa(sec.expiry) : "مدت‌دار")} icon="clock" />
              <Info label="سطح دسترسی" value={sec.fullAccess ? "کامل" : "محدود"} icon="shield" />
            </div>
            {!sec.fullAccess && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {SECTIONS.filter((s) => sec.perms[s]).map((s) => <span key={s} className="rounded-lg bg-cyan-50 px-2 py-1 text-[11px] font-bold text-cyan-700">{s}</span>)}
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-3xl glass p-10 text-center text-sm text-slate-400">برای این مطب هنوز منشی‌ای تعیین نشده است.</div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-black text-slate-900">منشی</h1><p className="text-sm text-slate-500">برای هر مطب منشی، نام کاربری و دسترسی تعیین کنید.</p></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {clinics.map((c) => {
          const has = !!secrets[c.id];
          return (
            <button key={c.id} onClick={() => setOpenId(c.id)} data-cursor="hover" className="group overflow-hidden rounded-3xl glass text-right transition hover:shadow-xl hover:shadow-cyan-500/10">
              <div className="relative h-28 overflow-hidden">{c.photo ? <img src={c.photo} alt={c.name} className="h-full w-full object-cover transition group-hover:scale-105" /> : <div className="h-full w-full bg-gradient-to-br from-cyan-100 to-blue-100" />}<div className="absolute inset-0 bg-gradient-to-t from-white to-transparent" /><div className="absolute bottom-3 right-3 text-lg font-black text-slate-900">{c.name}</div></div>
              <div className="flex items-center justify-between p-4 text-xs"><span className={has ? "text-emerald-600" : "text-slate-400"}>{has ? "منشی تعیین‌شده" : "بدون منشی"}</span><span className="flex items-center gap-1 font-bold text-cyan-700">مدیریت <Icon name="arrow" className="h-3.5 w-3.5" /></span></div>
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {modal && (
          <Overlay onClose={() => setModal(null)}>
            <div className="flex items-center justify-between"><h3 className="text-lg font-black text-slate-900">{secrets[modal.id] ? "ویرایش منشی" : "تعیین منشی"}</h3><button onClick={() => setModal(null)} data-cursor="hover" className="grid h-8 w-8 place-items-center rounded-lg bg-white/70 text-slate-500"><Icon name="close" className="h-4 w-4" /></button></div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <F label="نام منشی"><input value={modal.sec.name} onChange={(e) => setModal({ ...modal, sec: { ...modal.sec, name: e.target.value } })} className="input" data-cursor="text" /></F>
              <F label="شماره تماس"><input value={modal.sec.phone} onChange={(e) => setModal({ ...modal, sec: { ...modal.sec, phone: e.target.value } })} className="input" data-cursor="text" /></F>
              <F label="ایمیل"><input value={modal.sec.email} onChange={(e) => setModal({ ...modal, sec: { ...modal.sec, email: e.target.value } })} className="input" data-cursor="text" /></F>
              <F label="نام کاربری"><input value={modal.sec.username} onChange={(e) => setModal({ ...modal, sec: { ...modal.sec, username: e.target.value } })} className="input" data-cursor="text" /></F>
              <F label="رمز عبور"><input value={modal.sec.password} onChange={(e) => setModal({ ...modal, sec: { ...modal.sec, password: e.target.value } })} className="input" data-cursor="text" /></F>
              <F label={modal.sec.permanent ? "" : "تاریخ انقضا"}>{!modal.sec.permanent && <input type="date" value={modal.sec.expiry} onChange={(e) => setModal({ ...modal, sec: { ...modal.sec, expiry: e.target.value } })} className="input" data-cursor="text" />}</F>
            </div>
            {/* permanent */}
            <Toggle label="اعتبار دائمی نام کاربری و رمز عبور" desc={modal.sec.permanent ? "بدون تاریخ انقضا" : "در تاریخ مقرر غیرفعال می‌شود"} on={modal.sec.permanent} onClick={() => setModal({ ...modal, sec: { ...modal.sec, permanent: !modal.sec.permanent } })} />
            {/* access */}
            <Toggle label="دسترسی کامل به پنل پزشک" desc={modal.sec.fullAccess ? "به همه‌ی بخش‌ها دسترسی دارد" : "دسترسی محدود"} on={modal.sec.fullAccess} onClick={() => setModal({ ...modal, sec: { ...modal.sec, fullAccess: !modal.sec.fullAccess } })} />
            {!modal.sec.fullAccess && (
              <div className="mt-3 rounded-2xl bg-slate-50 p-3">
                <div className="mb-2 text-xs font-bold text-slate-500">مدیریت دسترسی بخش‌ها</div>
                <div className="grid grid-cols-2 gap-2">
                  {SECTIONS.map((s) => (
                    <button key={s} onClick={() => setModal({ ...modal, sec: { ...modal.sec, perms: { ...modal.sec.perms, [s]: !modal.sec.perms[s] } } })} data-cursor="hover" className={`flex items-center justify-between rounded-xl border px-3 py-2 text-xs font-bold transition ${modal.sec.perms[s] ? "border-cyan-500 bg-cyan-50 text-cyan-700" : "border-slate-200 bg-white text-slate-400"}`}>
                      {s}
                      <span className={`relative h-4 w-7 rounded-full transition ${modal.sec.perms[s] ? "bg-emerald-500" : "bg-slate-300"}`}><span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition ${modal.sec.perms[s] ? "left-0.5" : "right-0.5"}`} /></span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <button onClick={save} data-cursor="hover" className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/30"><Icon name="check" className="h-4 w-4" />ذخیره</button>
          </Overlay>
        )}
      </AnimatePresence>
    </div>
  );
}

function Info({ label, value, icon }: { label: string; value: string; icon: string }) {
  return <div className="rounded-2xl bg-slate-50 p-3"><div className="mb-1 flex items-center gap-1.5 text-[11px] text-slate-400"><Icon name={icon} className="h-3.5 w-3.5" />{label}</div><div className="text-sm font-bold text-slate-800">{value}</div></div>;
}
function Toggle({ label, desc, on, onClick }: { label: string; desc: string; on: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} data-cursor="hover" className="mt-3 flex w-full items-center justify-between rounded-2xl border border-slate-100 bg-white/60 p-3 text-right">
      <div><div className="text-sm font-bold text-slate-800">{label}</div><div className="text-[11px] text-slate-400">{desc}</div></div>
      <span className={`relative h-7 w-12 shrink-0 rounded-full transition ${on ? "bg-emerald-500" : "bg-slate-300"}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${on ? "left-1" : "right-1"}`} /></span>
    </button>
  );
}
function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-medium text-slate-600">{label}</span>{children}</label>;
}
