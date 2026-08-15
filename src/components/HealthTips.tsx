"use client";

import { motion } from "framer-motion";
import { healthTips } from "../data";
import SectionHeading from "./SectionHeading";
import Icon from "./Icon";
import TiltCard from "./TiltCard";
import type { Nav } from "../nav";

const toFa = (s: string | number) =>
  String(s).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);

export default function HealthTips({ navigate }: { navigate: Nav }) {
  return (
    <section id="tips" className="relative py-24">
      {/* ambient glow */}
      <div className="pointer-events-none absolute left-0 top-1/4 h-72 w-72 rounded-full bg-violet-200/20 blur-3xl" />
      <div className="pointer-events-none absolute right-0 bottom-1/4 h-72 w-72 rounded-full bg-cyan-200/20 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="مجله سلامت"
          title="نکات سلامتی برای زندگی بهتر"
          desc="مقالات تخصصی پزشکان نوبان برای مراقبت بهتر از خود و خانواده."
        />

        <div className="perspective mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {healthTips.map((tip, i) => (
            <motion.div
              key={tip.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: (i % 3) * 0.08 }}
            >
              <TiltCard
                intensity={9}
                glare
                onClick={() => navigate("article", undefined, String(tip.id))}
                className="group h-full overflow-hidden rounded-3xl glass"
              >
                {/* cover banner */}
                <div
                  className={`relative h-32 overflow-hidden bg-gradient-to-br ${tip.color}`}
                >
                  <div className="absolute inset-0 grid place-items-center">
                    <motion.span
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      className="text-5xl drop-shadow-lg"
                      style={{ transform: "translateZ(30px)" }}
                    >
                      {tip.emoji}
                    </motion.span>
                  </div>
                  {/* pattern overlay */}
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
                      backgroundSize: "30px 30px",
                    }}
                  />
                  <span className="absolute right-3 top-3 rounded-full bg-white/85 px-3 py-1 text-[11px] font-bold text-slate-700 backdrop-blur">
                    {tip.category}
                  </span>
                </div>

                {/* body */}
                <div className="p-5" style={{ transform: "translateZ(20px)" }}>
                  <h3 className="text-base font-black leading-snug text-slate-900">
                    {tip.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">
                    {tip.excerpt}
                  </p>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Icon name="clock" className="h-3.5 w-3.5" />
                      {toFa(tip.readTime)} مطالعه
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold text-cyan-700 transition group-hover:gap-2">
                      ادامه مطلب
                      <Icon name="arrow" className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
