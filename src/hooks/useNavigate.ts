"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Nav } from "@/nav";

/**
 * تبدیل‌کننده navigate مبتنی بر state به Next.js App Router.
 *
 * این hook تابع `navigate` قدیمی را که از طریق props پاس داده می‌شد،
 * با `useRouter` بومی Next.js جایگزین می‌کند. تمام کامپوننت‌های موجود
 * می‌توانند بدون تغییر از این hook استفاده کنند.
 *
 * نگاشت صفحات به مسیرها:
 * - home       → /
 * - doctors    → /doctors
 * - doctor     → /doctors/[slug]  (slug = doctorName)
 * - login      → /login
 * - panel      → /panel/doctor
 * - admin      → /panel/admin
 * - secretary  → /panel/secretary
 * - favorites  → /favorites
 * - article    → /articles/[id]
 * - appointments → /appointments
 * - profile    → /profile
 * - help       → /contact
 */
export function useNavigate(): Nav {
  const router = useRouter();

  return useCallback<Nav>(
    (page, section, doctorName) => {
      // اگر section مشخص شده و در صفحه خانه هستیم، اسکرول کن
      if (page === "home" && section) {
        // اگر قبلاً در صفحه خانه هستیم، فقط اسکرول کن
        if (window.location.pathname === "/") {
          document
            .querySelector(section)
            ?.scrollIntoView({ behavior: "smooth" });
          return;
        }
        // در غیر این صورت به صفحه خانه برو و بعد اسکرول کن
        router.push(`/${section ? `#${section.slice(1)}` : ""}`);
        return;
      }

      const routes: Record<string, string> = {
        home: "/",
        doctors: "/doctors",
        doctor: `/doctors/${encodeURIComponent(doctorName ?? "")}`,
        login: "/login",
        panel: "/panel/doctor",
        admin: "/panel/admin",
        secretary: "/panel/secretary",
        favorites: "/favorites",
        article: `/articles/${doctorName ?? "1"}`,
        appointments: "/appointments",
        profile: "/profile",
        help: "/contact",
      };

      const route = routes[page];
      if (route) {
        router.push(route);
      }
    },
    [router]
  );
}
