"use client";

import { motion } from "framer-motion";
import type { Nav, PageName } from "../nav";
import { useFavorites } from "../store/favorites";
import { useAppointments } from "../store/appointments";
import { useAuth } from "../store/auth";

/**
 * A fixed bottom navigation bar for mobile screens.
 * Shows on screens < lg (1024px). Hidden on panel/admin/secretary/login pages.
 */
const ITEMS: { page: PageName; icon: string; label: string }[] = [
  { page: "home", icon: "grid", label: "خانه" },
  { page: "doctors", icon: "stethoscope", label: "پزشکان" },
  { page: "appointments", icon: "calendar", label: "نوبت‌ها" },
  { page: "favorites", icon: "star", label: "علاقه‌مندی" },
  { page: "login", icon: "user", label: "ورود" },
];

export default function MobileBottomNav({
  page,
  navigate,
}: {
  page: PageName;
  navigate: Nav;
}) {
  const favCount = useFavorites((s) => s.ids.length);
  const aptCount = useAppointments(
    (s) => s.items.reduce((n, x) => (x.status === "upcoming" ? n + 1 : n), 0)
  );
  const user = useAuth((s) => s.user);
  const items = user
    ? [
        { page: "home" as PageName, icon: "grid", label: "خانه" },
        { page: "doctors" as PageName, icon: "stethoscope", label: "پزشکان" },
        { page: "appointments" as PageName, icon: "calendar", label: "نوبت‌ها" },
        { page: "favorites" as PageName, icon: "star", label: "علاقه‌مندی" },
        { page: "profile" as PageName, icon: "user", label: "پروفایل" },
      ]
    : [
        { page: "home" as PageName, icon: "grid", label: "خانه" },
        { page: "doctors" as PageName, icon: "stethoscope", label: "پزشکان" },
        { page: "appointments" as PageName, icon: "calendar", label: "نوبت‌ها" },
        { page: "favorites" as PageName, icon: "star", label: "علاقه‌مندی" },
        { page: "login" as PageName, icon: "user", label: "ورود" },
      ];

  // Hide on panel pages and login (login has its own full-screen layout)
  if (page === "panel" || page === "admin" || page === "secretary" || page === "login") {
    return null;
  }

  return (
    <motion.nav
      initial={{ y: 80 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden"
      aria-label="ناوبری سریع"
    >
      <div className="glass mx-2 mb-2 flex items-center justify-around rounded-2xl border-t border-slate-200/50 px-1 py-1.5 shadow-2xl dark:border-slate-700/50">
        {items.map((it) => {
          const active = page === it.page;
          const badge =
            it.page === "favorites"
              ? favCount
              : it.page === "appointments"
              ? aptCount
              : 0;
          return (
            <button
              key={it.page}
              onClick={() => navigate(it.page)}
              data-cursor="hover"
              aria-label={it.label}
              aria-current={active ? "page" : undefined}
              className={`relative flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 transition ${
                active
                  ? "text-cyan-600"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="mobileNavActive"
                  className="absolute inset-0 -z-10 rounded-xl bg-cyan-50 dark:bg-cyan-900/30"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              {/* Icon container */}
              <span className="relative">
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={active ? 2.2 : 1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {it.icon === "grid" && (
                    <>
                      <rect x="3" y="3" width="7" height="7" rx="1.5" />
                      <rect x="14" y="3" width="7" height="7" rx="1.5" />
                      <rect x="3" y="14" width="7" height="7" rx="1.5" />
                      <rect x="14" y="14" width="7" height="7" rx="1.5" />
                    </>
                  )}
                  {it.icon === "stethoscope" && (
                    <>
                      <path d="M4 3v6a4 4 0 0 0 8 0V3" />
                      <path d="M8 13v3a5 5 0 0 0 10 0v-1" />
                      <circle cx="18" cy="11" r="2" />
                    </>
                  )}
                  {it.icon === "calendar" && (
                    <>
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <path d="M16 2v4M8 2v4M3 10h18" />
                    </>
                  )}
                  {it.icon === "star" && (
                    <path d="M12 2l3 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.9 21l1.2-6.8-5-4.9 6.9-1z" />
                  )}
                  {it.icon === "user" && (
                    <>
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 21a8 8 0 0 1 16 0" />
                    </>
                  )}
                </svg>
                {badge > 0 && (
                  <span className="absolute -left-1.5 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-gradient-to-br from-rose-500 to-red-600 px-1 text-[9px] font-black text-white">
                    {badge.toLocaleString("fa-IR")}
                  </span>
                )}
              </span>
              <span className={`text-[10px] ${active ? "font-bold" : "font-medium"}`}>
                {it.label}
              </span>
            </button>
          );
        })}
      </div>
    </motion.nav>
  );
}
