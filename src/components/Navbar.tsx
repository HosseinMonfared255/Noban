"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { navLinks } from "../data";
import Icon from "./Icon";
import ThemeToggle from "./ThemeToggle";
import SearchOverlay from "./SearchOverlay";
import NotificationBell from "./NotificationBell";
import type { Nav, PageName } from "../nav";
import { useScrolling } from "../utils/useScrolling";
import { useFavorites } from "../store/favorites";
import { useAppointments } from "../store/appointments";
import { useAuth } from "../store/auth";

function Logo({ navigate }: { navigate: Nav }) {
  return (
    <button
      onClick={() => navigate("home")}
      data-cursor="hover"
      className="flex items-center gap-2.5"
    >
      <motion.div
        whileHover={{ rotateY: 180 }}
        transition={{ duration: 0.6 }}
        style={{ transformStyle: "preserve-3d" }}
        className="relative grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/40"
      >
        <span className="absolute inset-0 rounded-2xl bg-white/15" />
        <svg viewBox="0 0 24 24" className="relative h-6 w-6 text-white">
          <path
            fill="currentColor"
            d="M10.5 2h3a1 1 0 0 1 1 1V8h5a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-5v8a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1v-8h-5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h5V3a1 1 0 0 1 1-1z"
          />
        </svg>
      </motion.div>
      <div className="leading-tight text-right">
        <div className="text-lg font-extrabold tracking-tight text-slate-900">
          نوبان
        </div>
        <div className="text-[10px] font-medium tracking-widest text-cyan-600">
          NOBAN
        </div>
      </div>
    </button>
  );
}

export default function Navbar({
  navigate,
  page,
}: {
  navigate: Nav;
  page: PageName;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [panelsOpen, setPanelsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const scrolling = useScrolling();
  const favCount = useFavorites((s) => s.ids.length);
  const aptCount = useAppointments(
    (s) => s.items.reduce((n, x) => (x.status === "upcoming" ? n + 1 : n), 0)
  );
  const user = useAuth((s) => s.user);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Global "/" shortcut to open search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;
      if (e.key === "/" && !isTyping) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    if (href === "#doctors") navigate("doctors");
    else navigate("home", href);
  };

  const isActive = (label: string) =>
    (page === "doctors" && label === "پزشکان") ||
    (page === "home" && label === "خانه");

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={`mt-3 flex items-center justify-between rounded-2xl px-4 py-2.5 transition-all duration-300 ${
            scrolled || page === "doctors"
              ? scrolling
                ? "glass"
                : "glass-lens"
              : "bg-transparent"
          }`}
        >
          <Logo navigate={navigate} />

          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((l) => (
              <button
                key={l.href}
                onClick={() => go(l.href)}
                className={`rounded-xl px-3.5 py-2 text-sm font-medium transition hover:bg-cyan-50 hover:text-cyan-700 ${
                  isActive(l.label)
                    ? "text-cyan-700"
                    : "text-slate-600"
                }`}
                data-cursor="hover"
              >
                {l.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div
              className="relative hidden sm:block"
              onMouseEnter={() => setPanelsOpen(true)}
              onMouseLeave={() => setPanelsOpen(false)}
            >
            <button
              onClick={() => setPanelsOpen((o) => !o)}
              data-cursor="hover"
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/70 px-4 py-2.5 text-sm font-bold text-slate-700 backdrop-blur transition hover:border-cyan-300 hover:text-cyan-700"
            >
              <Icon name="grid" className="h-4 w-4 text-cyan-600" />
              پنل‌ها
              <Icon name="arrow" className={`h-3.5 w-3.5 rotate-90 text-slate-400 transition ${panelsOpen ? "-rotate-90" : ""}`} />
            </button>
            <AnimatePresence>
              {panelsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-full z-50 w-52 pt-2"
                >
                  <div className="overflow-hidden rounded-2xl glass p-2">
                    {[
                      { p: "panel" as const, icon: "chart", label: "پنل پزشک", desc: "مدیریت پزشک" },
                      { p: "secretary" as const, icon: "user", label: "پنل منشی", desc: "مدیریت مطب و نوبت‌ها" },
                      { p: "admin" as const, icon: "shield", label: "پنل مدیر سیستم", desc: "مدیریت کل سامانه" },
                    ].map((it) => (
                      <button
                        key={it.p}
                        onClick={() => { navigate(it.p); setPanelsOpen(false); }}
                        data-cursor="hover"
                        className="flex w-full items-center gap-3 rounded-xl p-2.5 text-right transition hover:bg-cyan-50"
                      >
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-white"><Icon name={it.icon} className="h-4 w-4" /></span>
                        <span><span className="block text-sm font-bold text-slate-800">{it.label}</span><span className="block text-[11px] text-slate-400">{it.desc}</span></span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
            {/* Search trigger */}
            <button
              onClick={() => setSearchOpen(true)}
              data-cursor="hover"
              aria-label="جستجو"
              className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white/70 text-slate-600 backdrop-blur transition hover:border-cyan-300 hover:text-cyan-700 dark:border-slate-700 dark:bg-slate-800/70 sm:hidden"
            >
              <Icon name="search" className="h-5 w-5" />
            </button>
            <button
              onClick={() => setSearchOpen(true)}
              data-cursor="hover"
              className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white/70 px-3 py-2.5 text-sm font-medium text-slate-400 backdrop-blur transition hover:border-cyan-300 dark:border-slate-700 dark:bg-slate-800/70 md:flex"
            >
              <Icon name="search" className="h-4 w-4 text-cyan-600" />
              <span>جستجوی پزشک...</span>
              <kbd className="mr-2 rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-400 dark:border-slate-600 dark:bg-slate-700">/</kbd>
            </button>
            <ThemeToggle />
            <NotificationBell navigate={navigate} className="hidden sm:block" />
            <button
              onClick={() => navigate("appointments")}
              data-cursor="hover"
              className="relative hidden items-center gap-2 rounded-xl border border-slate-200 bg-white/70 px-3 py-2.5 text-sm font-bold text-slate-700 backdrop-blur transition hover:border-cyan-300 hover:text-cyan-700 sm:flex dark:border-slate-700 dark:bg-slate-800/70"
              aria-label="نوبت‌های من"
            >
              <Icon name="calendar" className="h-4 w-4 text-cyan-600" />
              {aptCount > 0 && (
                <motion.span
                  key={aptCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                  className="absolute -left-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 px-1 text-[10px] font-black text-white shadow-md"
                >
                  {aptCount.toLocaleString("fa-IR")}
                </motion.span>
              )}
            </button>
            <button
              onClick={() => navigate("favorites")}
              data-cursor="hover"
              className="relative hidden items-center gap-2 rounded-xl border border-slate-200 bg-white/70 px-3 py-2.5 text-sm font-bold text-slate-700 backdrop-blur transition hover:border-rose-300 hover:text-rose-600 sm:flex"
              aria-label="علاقه‌مندی‌ها"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-rose-500" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              {favCount > 0 && (
                <motion.span
                  key={favCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                  className="absolute -left-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-gradient-to-br from-rose-500 to-red-600 px-1 text-[10px] font-black text-white shadow-md"
                >
                  {favCount.toLocaleString("fa-IR")}
                </motion.span>
              )}
            </button>
            {user ? (
              <button
                onClick={() => navigate("profile")}
                data-cursor="hover"
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/70 py-1.5 pl-3 pr-1.5 text-sm font-bold text-slate-700 backdrop-blur transition hover:border-cyan-300 hover:text-cyan-700 sm:flex dark:border-slate-700 dark:bg-slate-800/70"
                aria-label="پروفایل کاربری"
              >
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-xs font-black text-white">
                  {(user.firstName[0] ?? "") + (user.lastName[0] ?? "")}
                </span>
                <span className="hidden md:inline max-w-[80px] truncate">
                  {user.firstName}
                </span>
              </button>
            ) : (
              <button
                onClick={() => navigate("login")}
                data-cursor="hover"
                className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white/70 px-4 py-2.5 text-sm font-bold text-slate-700 backdrop-blur transition hover:border-cyan-300 hover:text-cyan-700 sm:flex"
              >
                <Icon name="user" className="h-4 w-4 text-cyan-600" />
                ورود
              </button>
            )}
            <button
              onClick={() => navigate("home", "#booking")}
              data-cursor="hover"
              className="hidden items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/30 transition hover:shadow-cyan-500/50 sm:flex"
            >
              <Icon name="calendar" className="h-4 w-4" />
              رزرو نوبت
            </button>
            <button
              onClick={() => setOpen((o) => !o)}
              data-cursor="hover"
              className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white/70 text-slate-700 lg:hidden"
              aria-label="منو"
            >
              <Icon name={open ? "close" : "menu"} className="h-5 w-5" />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 overflow-hidden rounded-2xl glass px-2 py-2 lg:hidden"
            >
              {navLinks.map((l) => (
                <button
                  key={l.href}
                  onClick={() => go(l.href)}
                  className="block w-full rounded-xl px-4 py-3 text-right text-sm font-medium text-slate-600 hover:bg-cyan-50 hover:text-cyan-700"
                >
                  {l.label}
                </button>
              ))}
              <button
                onClick={() => { setOpen(false); navigate("panel"); }}
                className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-bold text-slate-700"
              >
                پنل پزشک
              </button>
              <button
                onClick={() => { setOpen(false); navigate("secretary"); }}
                className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-bold text-slate-700"
              >
                پنل منشی
              </button>
              <button
                onClick={() => { setOpen(false); navigate("admin"); }}
                className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-bold text-slate-700"
              >
                پنل مدیر سیستم
              </button>
              <button
                onClick={() => { setOpen(false); navigate("favorites"); }}
                className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-bold text-slate-700"
              >
                علاقه‌مندی‌ها{favCount > 0 ? ` (${favCount.toLocaleString("fa-IR")})` : ""}
              </button>
              <button
                onClick={() => { setOpen(false); navigate("appointments"); }}
                className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-bold text-slate-700"
              >
                نوبت‌های من{aptCount > 0 ? ` (${aptCount.toLocaleString("fa-IR")})` : ""}
              </button>
              {user ? (
                <>
                  <button
                    onClick={() => { setOpen(false); navigate("profile"); }}
                    className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-bold text-slate-700"
                  >
                    پروفایل ({user.firstName})
                  </button>
                  <button
                    onClick={() => {
                      setOpen(false);
                      useAuth.getState().logout();
                      navigate("home");
                    }}
                    className="mt-1 block w-full rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-center text-sm font-bold text-rose-600"
                  >
                    خروج از حساب
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { setOpen(false); navigate("login"); }}
                  className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-bold text-slate-700"
                >
                  ورود / ثبت‌نام
                </button>
              )}
              <button
                onClick={() => go("#booking")}
                className="mt-1 block w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 text-center text-sm font-bold text-white"
              >
                رزرو نوبت
              </button>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>

      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        navigate={navigate}
      />
    </motion.header>
  );
}
