"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCompare } from "../store/compare";
import { doctors } from "../data";
import Icon from "./Icon";

const toFa = (s: string | number) =>
  String(s).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);

export default function CompareBar({
  onOpen,
}: {
  onOpen: () => void;
}) {
  const ids = useCompare((s) => s.ids);
  const remove = useCompare((s) => s.remove);
  const clear = useCompare((s) => s.clear);

  const selected = doctors.filter((d) => ids.includes(d.name));

  return (
    <AnimatePresence>
      {selected.length > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="fixed bottom-4 left-1/2 z-40 w-[95%] max-w-3xl -translate-x-1/2"
        >
          <div className="glass flex flex-wrap items-center gap-3 rounded-2xl p-3 shadow-2xl">
            {/* selected count */}
            <div className="flex items-center gap-2 pl-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-sm font-black text-white">
                {toFa(selected.length)}
              </span>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                مقایسه پزشکان
              </span>
            </div>

            {/* chips */}
            <div className="flex flex-1 flex-wrap gap-2">
              {selected.map((d) => (
                <div
                  key={d.name}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/70 py-1 pr-1 pl-2 dark:border-slate-700 dark:bg-slate-800/70"
                >
                  <img
                    src={d.photo}
                    alt={d.name}
                    className="h-7 w-7 rounded-lg object-cover object-top"
                  />
                  <span className="max-w-[120px] truncate text-xs font-bold text-slate-700 dark:text-slate-200">
                    {d.name.replace("دکتر ", "")}
                  </span>
                  <button
                    onClick={() => remove(d.name)}
                    data-cursor="hover"
                    aria-label="حذف از مقایسه"
                    className="grid h-5 w-5 place-items-center rounded-full bg-slate-100 text-slate-400 transition hover:bg-rose-100 hover:text-rose-500 dark:bg-slate-700"
                  >
                    <Icon name="close" className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={clear}
                data-cursor="hover"
                className="rounded-xl px-3 py-2 text-xs font-bold text-slate-500 transition hover:text-rose-500"
              >
                پاک کردن
              </button>
              <button
                onClick={onOpen}
                disabled={selected.length < 2}
                data-cursor={selected.length >= 2 ? "hover" : undefined}
                className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition ${
                  selected.length >= 2
                    ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30 hover:scale-105"
                    : "cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-700"
                }`}
              >
                <Icon name="grid" className="h-4 w-4" />
                مقایسه {selected.length >= 2 ? `(${toFa(selected.length)})` : ""}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
