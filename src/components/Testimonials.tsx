"use client";

import { motion } from "framer-motion";
import { testimonials } from "../data";
import SectionHeading from "./SectionHeading";
import Icon from "./Icon";

export default function Testimonials() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="نظرات کاربران"
          title="بیماران ما چه می‌گویند؟"
          desc="رضایت شما، موفقیت ماست. تجربه‌ی واقعی کاربران نوبان را بخوانید."
        />

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.blockquote
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              className="relative rounded-3xl glass p-7"
            >
              <div className="mb-4 flex gap-1 text-amber-500">
                {Array.from({ length: 5 }).map((_, k) => (
                  <Icon key={k} name="star" className="h-4 w-4 fill-amber-500" />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-slate-700">«{t.text}»</p>
              <footer className="mt-6 flex items-center gap-3">
                <span
                  className={`grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br ${t.color} font-bold text-white shadow-md`}
                >
                  {t.avatar}
                </span>
                <div>
                  <div className="text-sm font-bold text-slate-900">{t.name}</div>
                  <div className="text-xs text-slate-500">{t.role}</div>
                </div>
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
