"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Icon from "../components/Icon";

const toFa = (s: string | number) => String(s).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);

type Status = "در حال بررسی" | "پاسخ داده شده" | "بسته";
type Ticket = { id: number; subject: string; message: string; image?: string; voice?: string; status: Status; date: string; reply?: string };

const STATUS_STYLE: Record<Status, string> = {
  "در حال بررسی": "bg-amber-50 text-amber-600",
  "پاسخ داده شده": "bg-emerald-50 text-emerald-600",
  "بسته": "bg-slate-100 text-slate-500",
};

export default function PanelSupport() {
  const [tickets, setTickets] = useState<Ticket[]>([
    { id: 1042, subject: "عدم نمایش نمودار درآمد", message: "نمودار درآمد ماهانه در مرورگر من بارگذاری نمی‌شود.", status: "پاسخ داده شده", date: "۲ روز پیش", reply: "بررسی شد؛ مشکل از کش مرورگر بود. با پاک‌سازی کش حل می‌شود." },
    { id: 1040, subject: "ویرایش کارت بانکی", message: "امکان ویرایش شماره کارت را ندارم.", status: "بسته", date: "۵ روز پیش" },
  ]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [image, setImage] = useState<string | undefined>();
  const [voice, setVoice] = useState<string | undefined>();
  const [recording, setRecording] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  const idRef = useRef(1043);
  const imgRef = useRef<HTMLInputElement>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const onImg = (file?: File) => { if (!file) return; const r = new FileReader(); r.onload = () => setImage(r.result as string); r.readAsDataURL(file); };
  const startRec = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = () => { setVoice(URL.createObjectURL(new Blob(chunksRef.current, { type: "audio/webm" }))); stream.getTracks().forEach((t) => t.stop()); };
      mr.start(); recRef.current = mr; setRecording(true);
    } catch { alert("دسترسی به میکروفون مقدور نیست."); }
  };
  const stopRec = () => { recRef.current?.stop(); setRecording(false); };

  const submit = () => {
    if (!subject.trim() || !message.trim()) return;
    const id = idRef.current++;
    setTickets((t) => [{ id, subject: subject.trim(), message: message.trim(), image, voice, status: "در حال بررسی", date: "هم‌اکنون" }, ...t]);
    setSubject(""); setMessage(""); setImage(undefined); setVoice(undefined);
    setTimeout(() => setTickets((t) => t.map((x) => (x.id === id ? { ...x, status: "پاسخ داده شده", reply: "تیکت شما دریافت و به تیم فنی ارجاع شد. در صورت نیاز بیشتر، راهنمایی‌تان می‌کنیم." } : x))), 2600);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-slate-900">پشتیبانی فنی</h1>
        <p className="text-sm text-slate-500">تیکت ثبت کنید و وضعیت پیگیری آن را ببینید.</p>
      </div>

      {/* new ticket */}
      <div className="rounded-3xl glass p-5">
        <h3 className="mb-3 font-bold text-slate-900">ثبت تیکت جدید</h3>
        <div className="grid gap-3">
          <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="موضوع تیکت" className="input" data-cursor="text" />
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} placeholder="مشکل خود را شرح دهید…" className="input resize-none" data-cursor="text" />
          {/* attachments */}
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => imgRef.current?.click()} data-cursor="hover" className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:border-cyan-300 hover:text-cyan-700"><Icon name="spark" className="h-4 w-4" />{image ? "تصویر افزوده شد" : "افزودن تصویر"}</button>
            <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={(e) => onImg(e.target.files?.[0])} />
            {image && <><img src={image} alt="" className="h-10 w-10 rounded-lg object-cover" /><button onClick={() => setImage(undefined)} data-cursor="hover" className="text-rose-500"><Icon name="trash" className="h-4 w-4" /></button></>}
            {recording ? (
              <button onClick={stopRec} data-cursor="hover" className="flex items-center gap-1.5 rounded-xl bg-rose-500 px-3 py-2 text-xs font-bold text-white"><span className="h-2.5 w-2.5 animate-pulse rounded-full bg-white" />در حال ضبط… (توقف)</button>
            ) : voice ? (
              <button onClick={() => setVoice(undefined)} data-cursor="hover" className="flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-600"><Icon name="trash" className="h-4 w-4" />حذف ویس</button>
            ) : (
              <button onClick={startRec} data-cursor="hover" className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:border-cyan-300 hover:text-cyan-700"><Icon name="phone" className="h-4 w-4" />ضبط ویس</button>
            )}
          </div>
          <button onClick={submit} data-cursor="hover" className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/30"><Icon name="plus" className="h-4 w-4" />ثبت تیکت</button>
        </div>
      </div>

      {/* tickets list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between"><h3 className="font-bold text-slate-900">تیکت‌های شما</h3><span className="text-xs text-slate-500">{toFa(tickets.length)} تیکت</span></div>
        {tickets.map((t) => (
          <div key={t.id} className="overflow-hidden rounded-3xl glass">
            <button onClick={() => setOpen(open === t.id ? null : t.id)} data-cursor="hover" className="flex w-full items-center justify-between gap-3 p-4 text-right">
              <div className="min-w-0"><div className="truncate font-bold text-slate-900">{t.subject}</div><div className="text-[11px] text-slate-400">#{toFa(t.id)} · {t.date}</div></div>
              <div className="flex shrink-0 items-center gap-2">
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${STATUS_STYLE[t.status]}`}>{t.status}</span>
                <Icon name="arrow" className={`h-4 w-4 text-slate-400 transition ${open === t.id ? "rotate-90" : ""}`} />
              </div>
            </button>
            <AnimatePresence>
              {open === t.id && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="space-y-3 border-t border-slate-100 p-4">
                    <div><div className="mb-1 text-[11px] font-bold text-slate-400">شرح مشکل</div><p className="text-sm leading-relaxed text-slate-600">{t.message}</p></div>
                    {(t.image || t.voice) && (
                      <div className="flex flex-wrap gap-3">
                        {t.image && <img src={t.image} alt="" className="h-24 rounded-lg object-cover" />}
                        {t.voice && <audio controls src={t.voice} className="h-9" />}
                      </div>
                    )}
                    {t.reply && (
                      <div className="rounded-2xl bg-cyan-50/70 p-3"><div className="mb-1 text-[11px] font-bold text-cyan-700">پاسخ پشتیبانی</div><p className="text-sm text-slate-700">{t.reply}</p></div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
