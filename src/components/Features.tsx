"use client";

import { motion } from "framer-motion";
import { features } from "../data";
import SectionHeading from "./SectionHeading";
import TiltCard from "./TiltCard";
import Icon from "./Icon";

export default function Features() {
  return (
    <section id="features" className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="چرا نوبان؟"
          title="تجربه‌ای ساده، مطمئن و سریع"
          desc="هر آنچه برای مدیریت نوبت‌های پزشکی نیاز دارید، در یک پلتفرم یکپارچه و کاربرپسند."
        />

        <div className="perspective mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: (i % 3) * 0.08 }}
            >
              <TiltCard
                intensity={10}
                className="h-full rounded-3xl glass p-6 transition-shadow hover:shadow-2xl hover:shadow-cyan-500/15"
              >
                <div style={{ transform: "translateZ(40px)" }}>
                  <div className="mb-5 inline-flex rounded-2xl bg-gradient-to-br from-cyan-50 to-blue-50 p-3 text-cyan-600 ring-1 ring-inset ring-cyan-100">
                    <Icon name={f.icon} className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    {f.desc}
                  </p>
                </div>
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-cyan-200/30 blur-2xl"
                />
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
