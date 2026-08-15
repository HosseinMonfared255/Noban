"use client";

import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCompare } from "../store/compare";
import { doctors, type Doctor } from "../data";
import type { Nav } from "../nav";
import Icon from "./Icon";
import { useFocusTrap } from "../utils/useFocusTrap";

const toFa = (s: string | number) =>
  String(s).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex">
      {[0, 1, 2, 3, 4].map((i) => (
        <Icon
          key={i}
          name="star"
          className={`h-3.5 w-3.5 ${
            i < Math.round(value)
              ? "fill-amber-500 text-amber-500"
              : "fill-slate-200 text-slate-200 dark:fill-slate-600 dark:text-slate-600"
          }`}
        />
      ))}
    </span>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="contents">
      <div className="border-t border-slate-100 bg-slate-50/50 px-3 py-3 text-xs font-bold text-slate-500 dark:border-slate-700 dark:bg-slate-800/30">
        {label}
      </div>
      {children}
    </div>
  );
}

export default function CompareModal({
  open,
  onClose,
  navigate,
}: {
  open: boolean;
  onClose: () => void;
  navigate: Nav;
}) {
  const ids = useCompare((s) => s.ids);
  const clear = useCompare((s) => s.clear);
  const selected: Doctor[] = doctors.filter((d) => ids.includes(d.name));
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(panelRef, open && selected.length >= 2);

  return (
    <AnimatePresence>
      {open && selected.length >= 2 && (
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
            aria-label="مقایسه پزشکان"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="glass w-full max-w-4xl overflow-hidden rounded-3xl shadow-2xl"
          >
            {/* header */}
            <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                  <Icon name="grid" className="h-5 w-5" />
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                  مقایسه پزشکان
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    clear();
                    onClose();
                  }}
                  data-cursor="hover"
                  className="rounded-lg px-3 py-1.5 text-xs font-bold text-slate-500 transition hover:text-rose-500"
                >
                  پاک کردن
                </button>
                <button
                  onClick={onClose}
                  data-cursor="hover"
                  className="grid h-8 w-8 place-items-center rounded-lg bg-white/70 text-slate-500 dark:bg-slate-800/70"
                  aria-label="بستن"
                >
                  <Icon name="close" className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* comparison table */}
            <div className="max-h-[70vh] overflow-auto">
              <div
                className="grid"
                style={{
                  gridTemplateColumns: `140px repeat(${selected.length}, minmax(0, 1fr))`,
                }}
              >
                {/* header row: doctor photos + names */}
                <div className="p-3" />
                {selected.map((d) => (
                  <div key={d.name} className="p-3 text-center">
                    <div className="relative mx-auto h-16 w-16">
                      <img
                        src={d.photo}
                        alt={d.name}
                        className="h-16 w-16 rounded-2xl object-cover object-top ring-2 ring-white shadow-lg dark:ring-slate-700"
                      />
                    </div>
                    <div className="mt-2 text-sm font-black text-slate-900 dark:text-slate-100">
                      {d.name}
                    </div>
                    <div className="text-[11px] text-cyan-600">{d.specialty}</div>
                  </div>
                ))}

                {/* rating */}
                <Row label="امتیاز">
                  {selected.map((d) => (
                    <div
                      key={d.name}
                      className="flex flex-col items-center gap-1 border-t border-slate-100 px-3 py-3 dark:border-slate-700"
                    >
                      <Stars value={d.rating} />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        {toFa(d.rating.toLocaleString("fa-IR"))} از ۵
                      </span>
                    </div>
                  ))}
                </Row>

                {/* experience */}
                <Row label="تجربه">
                  {selected.map((d) => (
                    <div
                      key={d.name}
                      className="border-t border-slate-100 px-3 py-3 text-center text-sm font-bold text-slate-700 dark:border-slate-700 dark:text-slate-200"
                    >
                      {toFa(d.experience)} سال
                    </div>
                  ))}
                </Row>

                {/* fee */}
                <Row label="تعرفه ویزیت">
                  {selected.map((d) => (
                    <div
                      key={d.name}
                      className="border-t border-slate-100 px-3 py-3 text-center dark:border-slate-700"
                    >
                      <span className="text-sm font-black text-slate-900 dark:text-slate-100">
                        {toFa(d.fee.toLocaleString("fa-IR"))}
                      </span>
                      <span className="text-xs text-slate-400"> ت</span>
                    </div>
                  ))}
                </Row>

                {/* location */}
                <Row label="مطب">
                  {selected.map((d) => (
                    <div
                      key={d.name}
                      className="border-t border-slate-100 px-3 py-3 text-center text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300"
                    >
                      {d.location}
                    </div>
                  ))}
                </Row>

                {/* next slot */}
                <Row label="نوبت بعد">
                  {selected.map((d) => (
                    <div
                      key={d.name}
                      className="border-t border-slate-100 px-3 py-3 text-center dark:border-slate-700"
                    >
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {d.next}
                      </span>
                    </div>
                  ))}
                </Row>

                {/* reviews count */}
                <Row label="تعداد نظرات">
                  {selected.map((d) => (
                    <div
                      key={d.name}
                      className="border-t border-slate-100 px-3 py-3 text-center text-sm font-bold text-slate-600 dark:border-slate-700 dark:text-slate-300"
                    >
                      {toFa(d.reviews.toLocaleString("fa-IR"))} نظر
                    </div>
                  ))}
                </Row>

                {/* actions */}
                <Row label="اقدام">
                  {selected.map((d) => (
                    <div
                      key={d.name}
                      className="flex flex-col items-center gap-1.5 border-t border-slate-100 px-3 py-3 dark:border-slate-700"
                    >
                      <button
                        onClick={() => {
                          onClose();
                          navigate("doctor", undefined, d.name);
                        }}
                        data-cursor="hover"
                        className="w-full rounded-lg border border-slate-200 bg-white py-1.5 text-[11px] font-bold text-slate-600 transition hover:border-cyan-300 hover:text-cyan-700 dark:border-slate-600 dark:bg-slate-800"
                      >
                        پروفایل
                      </button>
                      <button
                        onClick={() => {
                          onClose();
                          navigate("home", "#booking");
                        }}
                        data-cursor="hover"
                        className="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 py-1.5 text-[11px] font-bold text-white"
                      >
                        رزرو نوبت
                      </button>
                    </div>
                  ))}
                </Row>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
