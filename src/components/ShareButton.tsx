"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Icon from "./Icon";

/**
 * A share button with a dropdown for copy-link, WhatsApp, Telegram, and
 * native Web Share API (on supported devices).
 */
export default function ShareButton({
  title,
  text,
  className = "",
}: {
  title: string;
  text: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  const url = typeof window !== "undefined" ? window.location.href : "";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("لینک کپی شد", {
        description: "می‌توانید آن را در شبکه‌های اجتماعی به اشتراک بگذارید",
        icon: "🔗",
      });
    } catch {
      toast.error("کپی لینک ناموفق بود");
    }
    setOpen(false);
  };

  const shareWhatsApp = () => {
    const msg = encodeURIComponent(`${title}\n${text}\n${url}`);
    window.open(`https://wa.me/?text=${msg}`, "_blank");
    setOpen(false);
  };

  const shareTelegram = () => {
    const msg = encodeURIComponent(`${title}\n${text}`);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${msg}`, "_blank");
    setOpen(false);
  };

  const shareNative = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // user cancelled
      }
    } else {
      copyLink();
    }
    setOpen(false);
  };

  const hasNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setOpen((o) => !o)}
        data-cursor="hover"
        aria-label="اشتراک‌گذاری"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/70 px-4 py-2.5 text-sm font-bold text-slate-700 backdrop-blur transition hover:border-cyan-300 hover:text-cyan-700 dark:border-slate-700 dark:bg-slate-800/70"
      >
        <Icon name="spark" className="h-4 w-4 text-cyan-600" />
        اشتراک‌گذاری
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* backdrop to close on outside click */}
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 top-full z-50 mt-1 w-48 overflow-hidden rounded-2xl glass p-2 shadow-2xl"
            >
              {hasNativeShare && (
                <button
                  onClick={shareNative}
                  data-cursor="hover"
                  className="flex w-full items-center gap-2.5 rounded-xl p-2.5 text-right text-sm font-bold text-slate-700 transition hover:bg-cyan-50 dark:text-slate-200 dark:hover:bg-cyan-900/20"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
                    <Icon name="spark" className="h-4 w-4" />
                  </span>
                  اشتراک‌گذاری...
                </button>
              )}
              <button
                onClick={copyLink}
                data-cursor="hover"
                className="flex w-full items-center gap-2.5 rounded-xl p-2.5 text-right text-sm font-bold text-slate-700 transition hover:bg-cyan-50 dark:text-slate-200 dark:hover:bg-cyan-900/20"
              >
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-slate-500 to-slate-700 text-white">
                  <Icon name="list" className="h-4 w-4" />
                </span>
                کپی لینک
              </button>
              <button
                onClick={shareWhatsApp}
                data-cursor="hover"
                className="flex w-full items-center gap-2.5 rounded-xl p-2.5 text-right text-sm font-bold text-slate-700 transition hover:bg-emerald-50 dark:text-slate-200 dark:hover:bg-emerald-900/20"
              >
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-emerald-400 to-green-600 text-white">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                    <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.978-1.207zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                </span>
                واتساپ
              </button>
              <button
                onClick={shareTelegram}
                data-cursor="hover"
                className="flex w-full items-center gap-2.5 rounded-xl p-2.5 text-right text-sm font-bold text-slate-700 transition hover:bg-cyan-50 dark:text-slate-200 dark:hover:bg-cyan-900/20"
              >
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 text-white">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.061 3.345-.48.329-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.324-.437.89-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                </span>
                تلگرام
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
