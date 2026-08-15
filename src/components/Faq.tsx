"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { faqs } from "../data";
import SectionHeading from "./SectionHeading";
import Icon from "./Icon";

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="سوالات متداول"
          title="پاسخ پرسش‌های شما"
          desc="هر سوالی دارید، احتمالاً اینجا پاسخ آن را پیدا می‌کنید."
        />

        <div className="mt-12 space-y-3">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ delay: (i % 6) * 0.05 }}
                className={`overflow-hidden rounded-2xl glass transition-all ${
                  isOpen ? "ring-1 ring-cyan-300" : ""
                }`}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  data-cursor="hover"
                  className="flex w-full items-center justify-between gap-4 p-5 text-right"
                >
                  <span className="text-base font-bold text-slate-900">
                    {f.q}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${
                      isOpen
                        ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <Icon name="arrow" className="h-4 w-4 rotate-90" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-sm leading-relaxed text-slate-600">
                        {f.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* contact prompt */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 flex flex-col items-center justify-between gap-4 rounded-3xl bg-gradient-to-l from-cyan-50 to-blue-50 p-6 text-center ring-1 ring-inset ring-cyan-100 sm:flex-row sm:text-right"
        >
          <div>
            <h3 className="text-lg font-black text-slate-900">
              پاسخ سوال خود را پیدا نکردید؟
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              تیم پشتیبانی ما آماده پاسخ‌گویی به شماست.
            </p>
          </div>
          <a
            href="#booking"
            data-cursor="hover"
            className="flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/30 transition hover:scale-105"
          >
            <Icon name="phone" className="h-4 w-4" />
            تماس با پشتیبانی
          </a>
        </motion.div>
      </div>
    </section>
  );
}
