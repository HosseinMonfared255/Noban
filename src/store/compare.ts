"use client";

import { create } from "zustand";

const MAX_COMPARE = 3;

type CompareState = {
  /** doctor names selected for comparison */
  ids: string[];
  toggle: (name: string) => void;
  remove: (name: string) => void;
  clear: () => void;
  canAdd: (name: string) => boolean;
  isComparing: (name: string) => boolean;
};

export const useCompare = create<CompareState>((set, get) => ({
  ids: [],
  toggle: (name) =>
    set((s) => {
      if (s.ids.includes(name)) {
        return { ids: s.ids.filter((x) => x !== name) };
      }
      if (s.ids.length >= MAX_COMPARE) return s;
      return { ids: [...s.ids, name] };
    }),
  remove: (name) => set((s) => ({ ids: s.ids.filter((x) => x !== name) })),
  clear: () => set({ ids: [] }),
  canAdd: (name) => {
    const s = get();
    return s.ids.includes(name) || s.ids.length < MAX_COMPARE;
  },
  isComparing: (name) => get().ids.includes(name),
}));
