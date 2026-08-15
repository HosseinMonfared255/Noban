"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { stats, type Stat } from "../data";

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const dur = 1600;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(eased * value));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {n.toLocaleString("fa-IR")}
      {suffix}
    </span>
  );
}

export default function Stats() {
  return (
    <section className="relative z-10 mx-auto -mt-4 max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 gap-4 rounded-3xl glass p-6 sm:p-8 md:grid-cols-4">
        {stats.map((s: Stat, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="text-center"
          >
            <div className="bg-gradient-to-b from-cyan-600 to-blue-700 bg-clip-text text-4xl font-black text-transparent sm:text-5xl">
              <Counter value={s.value} suffix={s.suffix} />
            </div>
            <div className="mt-1 text-sm font-medium text-slate-500">
              {s.label}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
