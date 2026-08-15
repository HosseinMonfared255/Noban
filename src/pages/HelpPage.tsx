"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import type { Nav } from "../nav";
import Icon from "../components/Icon";
import { faqs, helpGuides, contactInfo, type HelpGuide } from "../data";

const toFa = (s: string | number) =>
  String(s).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);

const CATEGORIES: { key: HelpGuide["category"] | "all"; label: string; icon: string }[] = [
  { key: "all", label: "همه", icon: "list" },
  { key: "booking", label: "رزرو نوبت", icon: "calendar" },
  { key: "account", label: "حساب کاربری", icon: "user" },
  { key: "payment", label: "پرداخت", icon: "wallet" },
  { key: "general", label: "عمومی", icon: "spark" },
];

const CATEGORY_COLOR: Record<HelpGuide["category"], string> = {
  booking: "from-cyan-500 to-blue-600",
  account: "from-violet-500 to-purple-600",
  payment: "from-emerald-500 to-teal-600",
  general: "from-amber-500 to-orange-600",
};

export default function HelpPage({ navigate }: { navigate: Nav }) {
  const [category, setCategory] = useState<HelpGuide["category"] | "all">("all");
  const [openGuide, setOpenGuide] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [search, setSearch] = useState("");

  const filteredGuides = useMemo(() => {
    let list = helpGuides;
    if (category !== "all") list = list.filter((g) => g.category === category);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.steps.some((s) => s.toLowerCase().includes(q))
      );
    }
    return list;
  }, [category, search]);

  const filteredFaqs = useMemo(() => {
    if (!search.trim()) return faqs;
    const q = search.trim().toLowerCase();
    return faqs.filter(
      (f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="min-h-screen pb-10 pt-28">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate("home")}
          data-cursor="hover"
          className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/70 px-4 py-1.5 text-sm font-medium text-slate-600 backdrop-blur transition hover:border-cyan-300 hover:text-cyan-700 dark:border-slate-700 dark:bg-slate-800/70"
        >
          <Icon name="arrow" className="h-4 w-4 rotate-180" />
          بازگشت به خانه
        </button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl glass p-6 sm:p-8"
        >
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-cyan-200/30 blur-3xl" />
          <div className="relative flex items-center gap-4">
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30">
              <Icon name="phone" className="h-8 w-8" />
            </span>
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 sm:text-4xl">
                مرکز پشتیبانی
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                راهنما، سوالات متداول و اطلاعات تماس
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mt-5">
            <Icon
              name="search"
              className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-cyan-600"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجو در راهنما و سوالات..."
              className="input pr-11"
              data-cursor="text"
            />
          </div>
        </motion.div>

        {/* Category chips */}
        <div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              data-cursor="hover"
              className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-4 py-2 text-sm font-bold transition ${
                category === c.key
                  ? "border-transparent bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow"
                  : "border-slate-200 bg-white/70 text-slate-600 hover:border-cyan-300 dark:border-slate-700 dark:bg-slate-800/70"
              }`}
            >
              <Icon name={c.icon} className="h-4 w-4" />
              {c.label}
            </button>
          ))}
        </div>

        {/* Guides */}
        <section className="mt-6">
          <h2 className="mb-4 text-xl font-black text-slate-900 dark:text-slate-100">
            راهنمای استفاده
          </h2>
          {filteredGuides.length === 0 ? (
            <div className="rounded-3xl glass py-12 text-center text-sm text-slate-400">
              نتیجه‌ای یافت نشد
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {filteredGuides.map((guide, i) => {
                const open = openGuide === guide.id;
                return (
                  <motion.div
                    key={guide.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className={`overflow-hidden rounded-2xl glass transition ${
                      open ? "ring-1 ring-cyan-300" : ""
                    }`}
                  >
                    <button
                      onClick={() => setOpenGuide(open ? null : guide.id)}
                      data-cursor="hover"
                      className="flex w-full items-center gap-3 p-4 text-right"
                    >
                      <span
                        className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${CATEGORY_COLOR[guide.category]} text-white`}
                      >
                        <Icon name={guide.icon} className="h-5 w-5" />
                      </span>
                      <span className="flex-1 text-sm font-bold text-slate-900 dark:text-slate-100">
                        {guide.title}
                      </span>
                      <motion.span
                        animate={{ rotate: open ? 180 : 0 }}
                        className="text-slate-400"
                      >
                        <Icon name="arrow" className="h-4 w-4 rotate-90" />
                      </motion.span>
                    </button>
                    <AnimatePresence initial={false}>
                      {open && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <ol className="space-y-2 px-4 pb-4">
                            {guide.steps.map((step, si) => (
                              <li
                                key={si}
                                className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300"
                              >
                                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-cyan-100 text-xs font-bold text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300">
                                  {toFa(si + 1)}
                                </span>
                                <span className="pt-0.5">{step}</span>
                              </li>
                            ))}
                          </ol>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {/* FAQ */}
        <section className="mt-8">
          <h2 className="mb-4 text-xl font-black text-slate-900 dark:text-slate-100">
            سوالات متداول
          </h2>
          {filteredFaqs.length === 0 ? (
            <div className="rounded-3xl glass py-12 text-center text-sm text-slate-400">
              نتیجه‌ای یافت نشد
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFaqs.map((f, i) => {
                const open = openFaq === i;
                return (
                  <div
                    key={i}
                    className={`overflow-hidden rounded-2xl glass transition ${
                      open ? "ring-1 ring-cyan-300" : ""
                    }`}
                  >
                    <button
                      onClick={() => setOpenFaq(open ? null : i)}
                      data-cursor="hover"
                      className="flex w-full items-center justify-between gap-4 p-4 text-right"
                    >
                      <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {f.q}
                      </span>
                      <motion.span
                        animate={{ rotate: open ? 180 : 0 }}
                        className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${
                          open
                            ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white"
                            : "bg-slate-100 text-slate-500 dark:bg-slate-700"
                        }`}
                      >
                        <Icon name="arrow" className="h-3.5 w-3.5 rotate-90" />
                      </motion.span>
                    </button>
                    <AnimatePresence initial={false}>
                      {open && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <p className="px-4 pb-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                            {f.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Contact info */}
        <section className="mt-8">
          <h2 className="mb-4 text-xl font-black text-slate-900 dark:text-slate-100">
            تماس با ما
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Contact cards */}
            <div className="rounded-2xl glass p-5">
              <div className="space-y-4">
                <ContactRow
                  icon="phone"
                  label="تلفن پشتیبانی"
                  value={contactInfo.phone}
                  href={`tel:${contactInfo.phone.replace(/[^\d]/g, "")}`}
                />
                <ContactRow
                  icon="mail"
                  label="ایمیل"
                  value={contactInfo.email}
                  href={`mailto:${contactInfo.email}`}
                />
                <ContactRow
                  icon="location"
                  label="آدرس"
                  value={contactInfo.address}
                />
                <ContactRow
                  icon="clock"
                  label="ساعات کاری"
                  value={contactInfo.workingHours}
                />
              </div>
            </div>

            {/* Social media + CTA */}
            <div className="flex flex-col gap-4">
              <div className="rounded-2xl glass p-5">
                <h3 className="mb-3 text-sm font-bold text-slate-900 dark:text-slate-100">
                  ما را دنبال کنید
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {contactInfo.socialMedia.map((s) => (
                    <button
                      key={s.name}
                      onClick={() => toast.info(`در حال انتقال به ${s.name}...`)}
                      data-cursor="hover"
                      className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 bg-white/50 p-3 transition hover:border-cyan-300 dark:border-slate-700 dark:bg-slate-800/50"
                    >
                      <span className="text-2xl">{s.icon}</span>
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
                        {s.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-gradient-to-l from-cyan-500 to-blue-600 p-5 text-white">
                <h3 className="font-black">هنوز سوالی دارید؟</h3>
                <p className="mt-1 text-sm text-cyan-50">
                  تیم پشتیبانی ما آماده پاسخگویی به شماست.
                </p>
                <button
                  onClick={() => toast.info("در حال برقراری تماس...")}
                  data-cursor="hover"
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-white/20 py-2.5 text-sm font-bold backdrop-blur transition hover:bg-white/30"
                >
                  <Icon name="phone" className="h-4 w-4" />
                  تماس با پشتیبانی
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ---------- Helper components ---------- */

function ContactRow({
  icon,
  label,
  value,
  href,
}: {
  icon: string;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-center gap-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan-50 text-cyan-600 dark:bg-cyan-900/20">
        <Icon name={icon} className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <div className="text-[11px] text-slate-500 dark:text-slate-400">
          {label}
        </div>
        <div className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">
          {value}
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        data-cursor="hover"
        className="block transition hover:opacity-80"
      >
        {content}
      </a>
    );
  }
  return content;
}
