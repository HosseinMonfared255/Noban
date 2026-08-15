"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type LoginEvent = {
  id: string;
  timestamp: number;
  method: "password" | "otp" | "signup";
  device: string;
  ip: string;
};

export type User = {
  id: string;
  phone: string;
  firstName: string;
  lastName: string;
  createdAt: string; // ISO string از API
  avatar?: string;
  loginHistory: LoginEvent[];
};

type AuthState = {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  updateProfile: (patch: Partial<Pick<User, "firstName" | "lastName" | "avatar">>) => void;
  addLoginEvent: (event: Omit<LoginEvent, "id" | "timestamp">) => void;
  clearLoginHistory: () => void;
};

const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

function detectDevice(): string {
  if (typeof navigator === "undefined") return "نامشخص";
  const ua = navigator.userAgent;
  const isMobile = /Mobile|Android|iPhone|iPad/i.test(ua);
  const browser = /Chrome/i.test(ua)
    ? "Chrome"
    : /Firefox/i.test(ua)
    ? "Firefox"
    : /Safari/i.test(ua)
    ? "Safari"
    : /Edge/i.test(ua)
    ? "Edge"
    : "مرورگر";
  const os = /Windows/i.test(ua)
    ? "ویندوز"
    : /Mac/i.test(ua)
    ? "مک"
    : /Linux/i.test(ua)
    ? "لینوکس"
    : /Android/i.test(ua)
    ? "اندروید"
    : /iOS|iPhone|iPad/i.test(ua)
    ? "iOS"
    : "نامشخص";
  return `${isMobile ? "موبایل" : "دسکتاپ"} · ${os} · ${browser}`;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: (user) =>
        set({
          user: {
            ...user,
            loginHistory: [
              {
                id: genId(),
                timestamp: Date.now(),
                method: "otp",
                device: detectDevice(),
                ip: "",
              },
            ],
          },
        }),
      logout: () => set({ user: null }),
      updateProfile: (patch) =>
        set((s) => (s.user ? { user: { ...s.user, ...patch } } : s)),
      addLoginEvent: (event) =>
        set((s) =>
          s.user
            ? {
                user: {
                  ...s.user,
                  loginHistory: [
                    { ...event, id: genId(), timestamp: Date.now() },
                    ...(s.user.loginHistory ?? []).slice(0, 9),
                  ],
                },
              }
            : s
        ),
      clearLoginHistory: () =>
        set((s) => (s.user ? { user: { ...s.user, loginHistory: [] } } : s)),
    }),
    {
      name: "noban-auth",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
