"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Icon from "@/components/Icon";

/**
 * layout.tsx مشترک برای تمام پنل‌ها (مدیر، پزشک، منشی).
 *
 * ویژگی‌های بومی App Router:
 * - layout مشترک که در تمام صفحات پنل اعمال می‌شود
 * - نوار بالایی با لوگو و دکمه‌های navegation
 * - نوار کناری (sidebar) در دسکتاپ
 * - منوی کشویی در موبایل
 */

const PANEL_ITEMS = [
  { href: "/panel/doctor", label: "پنل پزشک", icon: "chart", grad: "from-cyan-500 to-blue-600" },
  { href: "/panel/secretary", label: "پنل منشی", icon: "user", grad: "from-teal-500 to-emerald-600" },
  { href: "/panel/admin", label: "پنل مدیر سیستم", icon: "shield", grad: "from-slate-700 to-slate-900" },
];

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activePanel = PANEL_ITEMS.find((p) => p.href === pathname) ?? PANEL_ITEMS[0];

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* پس‌زمینه محیطی */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 right-0 h-[28rem] w-[28rem] rounded-full bg-cyan-300/15 blur-[80px] dark:bg-cyan-500/5" />
      </div>

      {/* نوار بالایی */}
      <header className="fixed inset-x-0 top-0 z-50">
        <div className={`bg-gradient-to-l ${activePanel.grad} text-white shadow-lg`}>
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
            {/* لوگو */}
            <Link href="/" data-cursor="hover" className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/20 backdrop-blur">
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-white">
                  <path
                    fill="currentColor"
                    d="M10.5 2h3a1 1 0 0 1 1 1V8h5a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-5v8a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1v-8h-5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h5V3a1 1 0 0 1 1-1z"
                  />
                </svg>
              </span>
              <div className="text-right leading-tight">
                <div className="text-base font-extrabold">نوبان</div>
                <div className="text-[10px] text-white/80">{activePanel.label}</div>
              </div>
            </Link>

            {/* دکمه‌های دسکتاپ */}
            <div className="hidden items-center gap-2 lg:flex">
              {PANEL_ITEMS.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    data-cursor="hover"
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold backdrop-blur transition ${
                      active
                        ? "bg-white/25"
                        : "bg-white/10 hover:bg-white/20"
                    }`}
                  >
                    <Icon name={item.icon} className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* دکمه بازگشت به سایت */}
            <Link
              href="/"
              data-cursor="hover"
              className="flex items-center gap-1.5 rounded-lg bg-white/20 px-3 py-2 text-xs font-bold backdrop-blur transition hover:bg-white/30"
            >
              <Icon name="logout" className="h-4 w-4" />
              <span className="hidden sm:inline">بازگشت به سایت</span>
            </Link>

            {/* دکمه منوی موبایل */}
            <button
              onClick={() => setSidebarOpen((o) => !o)}
              data-cursor="hover"
              className="grid h-9 w-9 place-items-center rounded-lg bg-white/20 backdrop-blur lg:hidden"
              aria-label="منو"
            >
              <Icon name={sidebarOpen ? "close" : "menu"} className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* منوی کشویی موبایل */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          >
            <motion.nav
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="glass absolute bottom-0 left-0 right-0 max-h-[60vh] overflow-y-auto rounded-t-3xl p-4"
            >
              <div className="mb-3 text-sm font-black text-slate-900 dark:text-slate-100">
                انتخاب پنل
              </div>
              <div className="space-y-2">
                {PANEL_ITEMS.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      data-cursor="hover"
                      className={`flex w-full items-center gap-3 rounded-xl p-3 text-right transition ${
                        active
                          ? "bg-cyan-50 dark:bg-cyan-900/20"
                          : "hover:bg-slate-50 dark:hover:bg-slate-700/30"
                      }`}
                    >
                      <span className={`grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br ${item.grad} text-white`}>
                        <Icon name={item.icon} className="h-4 w-4" />
                      </span>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* محتوای صفحه */}
      <main className="min-h-screen pt-20">{children}</main>
    </div>
  );
}
