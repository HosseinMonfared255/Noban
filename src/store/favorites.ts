"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type FavoritesState = {
  /** doctor names that the user has bookmarked */
  ids: string[];
  toggle: (name: string) => void;
  isFavorite: (name: string) => boolean;
  clear: () => void;
};

export const useFavorites = create<FavoritesState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (name) =>
        set((s) => ({
          ids: s.ids.includes(name)
            ? s.ids.filter((x) => x !== name)
            : [...s.ids, name],
        })),
      isFavorite: (name) => get().ids.includes(name),
      clear: () => set({ ids: [] }),
    }),
    {
      name: "noban-favorites",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
