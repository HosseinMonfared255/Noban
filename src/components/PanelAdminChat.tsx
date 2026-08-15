"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Icon from "../components/Icon";

const toFa = (s: string | number) => String(s).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);
const ADMIN_PHONE = "021-91000000";
const ADMIN_REPLIES = ["پیام شما دریافت شد، در بررسی آن هستم.", "بله، حتماً. کاری که خواستید انجام می‌شود.", "ممنون از اطلاع‌رسانی، در اسرع وقت پیگیری می‌کنم.", "لطفاً جزئیات بیشتری بفرستید.", "راهنمایی‌تان کردم، در صورت نیاز در خدمتم."];

type Msg = { id: number; from: "me" | "admin"; type: "text" | "image" | "voice"; content: string };

export default function PanelAdminChat() {
  const [phase, setPhase] = useState<"idle" | "requesting" | "chat">("idle");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [recording, setRecording] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const idRef = useRef(1);
  const imgRef = useRef<HTMLInputElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const pushMe = (type: Msg["type"], content: string) => {
    const id = idRef.current++;
    setMsgs((m) => [...m, { id, from: "me", type, content }]);
    setTimeout(() => {
      setMsgs((m) => [...m, { id: idRef.current++, from: "admin", type: "text", content: ADMIN_REPLIES[Math.floor(Math.random() * ADMIN_REPLIES.length)] }]);
    }, 1100);
  };

  const requestChat = () => {
    setPhase("requesting");
    setTimeout(() => {
      setPhase("chat");
      setMsgs([{ id: idRef.current++, from: "admin", type: "text", content: "سلام 👋 درخواست شما تأیید شد و نشست چت برقرار است. چطور می‌توانم کمک کنم؟" }]);
    }, 5000);
  };
  const sendText = () => { if (!text.trim()) return; pushMe("text", text.trim()); setText(""); };
  const onImg = (file?: File) => { if (!file) return; const r = new FileReader(); r.onload = () => pushMe("image", r.result as string); r.readAsDataURL(file); };

  const startRec = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = () => { const url = URL.createObjectURL(new Blob(chunksRef.current, { type: "audio/webm" })); pushMe("voice", url); stream.getTracks().forEach((t) => t.stop()); };
      mr.start(); recRef.current = mr; setRecording(true);
    } catch { alert("دسترسی به میکروفون مقدور نیست."); }
  };
  const stopRec = () => { recRef.current?.stop(); setRecording(false); };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-slate-900">ارتباط مستقیم با مدیر سیستم</h1>
        <p className="text-sm text-slate-500">گفت‌وگوی مستقیم با مدیر؛ ارسال متن، ویس و تصویر.</p>
      </div>

      <div className="rounded-3xl glass p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white"><Icon name="user" className="h-6 w-6" /></span>
            <div><div className="font-bold text-slate-900">مدیر سیستم</div><a href={`tel:${ADMIN_PHONE}`} data-cursor="hover" className="text-sm font-bold text-cyan-700">{toFa(ADMIN_PHONE)}</a></div>
          </div>
          {phase === "idle" && <button onClick={requestChat} data-cursor="hover" className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/25"><Icon name="phone" className="h-4 w-4" />درخواست نشست چت</button>}
          {phase === "requesting" && <span className="flex items-center gap-2 rounded-xl bg-cyan-50 px-3 py-2 text-xs font-bold text-cyan-700"><span className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-200 border-t-cyan-600" />در حال اتصال…</span>}
        </div>

        {phase === "requesting" && (
          <div className="mt-4 flex h-[26rem] flex-col items-center justify-center gap-4 rounded-2xl border border-slate-200 bg-white/60 text-center">
            <div className="relative grid h-16 w-16 place-items-center">
              <div className="absolute inset-0 animate-spin rounded-full border-4 border-cyan-200 border-t-cyan-600" />
              <span className="text-2xl">📞</span>
            </div>
            <div>
              <div className="font-bold text-slate-800">در حال برقراری ارتباط با مدیر…</div>
              <div className="mt-1 text-sm text-slate-500">منتظر تأیید درخواست شما بمانید</div>
            </div>
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => <motion.span key={i} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} className="h-1.5 w-1.5 rounded-full bg-cyan-500" />)}
            </div>
          </div>
        )}

        {phase === "chat" && (
          <div className="mt-4 flex h-[26rem] flex-col rounded-2xl border border-slate-200 bg-white/60">
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {msgs.map((m) => (
                <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex ${m.from === "me" ? "justify-start" : "justify-end"}`}>
                  <div className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm shadow-sm ${m.from === "me" ? "rounded-bl-none bg-gradient-to-r from-cyan-500 to-blue-600 text-white" : "rounded-br-none bg-white text-slate-700"}`}>
                    {m.type === "text" && <span>{m.content}</span>}
                    {m.type === "image" && <img src={m.content} alt="" className="max-h-44 rounded-lg" />}
                    {m.type === "voice" && <audio controls src={m.content} className="h-9 max-w-[14rem]" />}
                  </div>
                </motion.div>
              ))}
              <div ref={endRef} />
            </div>
            {/* input bar */}
            <div className="flex items-center gap-2 border-t border-slate-200 p-2.5">
              <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendText()} placeholder="پیام بنویسید…" className="input flex-1" data-cursor="text" />
              <button onClick={() => imgRef.current?.click()} data-cursor="hover" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-cyan-600 hover:border-cyan-300" aria-label="ارسال تصویر"><Icon name="spark" className="h-5 w-5" /></button>
              <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={(e) => onImg(e.target.files?.[0])} />
              {recording ? (
                <button onClick={stopRec} data-cursor="hover" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rose-500 text-white" aria-label="توقف ضبط"><span className="h-3 w-3 rounded-sm bg-white" /></button>
              ) : (
                <button onClick={startRec} data-cursor="hover" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-cyan-600 hover:border-cyan-300" aria-label="ضبط ویس"><Icon name="phone" className="h-5 w-5" /></button>
              )}
              <button onClick={sendText} data-cursor="hover" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white" aria-label="ارسال"><Icon name="arrow" className="h-5 w-5 rotate-180" /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
