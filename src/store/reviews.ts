"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type Review = {
  id: string;
  doctorName: string;
  name: string;
  rating: number;
  date: string;
  text: string;
  createdAt: number;
};

type ReviewsState = {
  /** keyed by doctor name */
  byDoctor: Record<string, Review[]>;
  add: (doctorName: string, r: Omit<Review, "id" | "doctorName">) => void;
  get: (doctorName: string) => Review[];
  clear: () => void;
};

const genId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

export const useReviews = create<ReviewsState>()(
  persist(
    (set, get) => ({
      byDoctor: {},
      add: (doctorName, r) =>
        set((s) => ({
          byDoctor: {
            ...s.byDoctor,
            [doctorName]: [
              { ...r, id: genId(), doctorName, createdAt: Date.now() },
              ...(s.byDoctor[doctorName] ?? []),
            ],
          },
        })),
      get: (doctorName) => get().byDoctor[doctorName] ?? [],
      clear: () => set({ byDoctor: {} }),
    }),
    {
      name: "noban-reviews",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
