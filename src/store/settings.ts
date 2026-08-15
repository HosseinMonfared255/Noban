"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type NotificationPrefs = {
  appointmentReminders: boolean;
  reviewReplies: boolean;
  healthTips: boolean;
  promotions: boolean;
};

export type ThemePref = "light" | "dark" | "system";
export type LanguagePref = "fa" | "en";

type SettingsState = {
  notifications: NotificationPrefs;
  themePref: ThemePref;
  languagePref: LanguagePref;
  toggleNotification: (key: keyof NotificationPrefs) => void;
  setNotification: (key: keyof NotificationPrefs, value: boolean) => void;
  resetNotifications: () => void;
  setThemePref: (t: ThemePref) => void;
  setLanguagePref: (l: LanguagePref) => void;
};

const DEFAULT_PREFS: NotificationPrefs = {
  appointmentReminders: true,
  reviewReplies: true,
  healthTips: false,
  promotions: false,
};

/** Applies the theme preference to the document element. */
function applyTheme(pref: ThemePref) {
  if (typeof document === "undefined") return;
  const isDark =
    pref === "dark" ||
    (pref === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", isDark);
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      notifications: DEFAULT_PREFS,
      themePref: "system",
      languagePref: "fa",
      toggleNotification: (key) =>
        set((s) => ({
          notifications: {
            ...s.notifications,
            [key]: !s.notifications[key],
          },
        })),
      setNotification: (key, value) =>
        set((s) => ({
          notifications: { ...s.notifications, [key]: value },
        })),
      resetNotifications: () => set({ notifications: DEFAULT_PREFS }),
      setThemePref: (t) => {
        applyTheme(t);
        set({ themePref: t });
      },
      setLanguagePref: (l) => set({ languagePref: l }),
    }),
    {
      name: "noban-settings",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.themePref);
      },
    }
  )
);
