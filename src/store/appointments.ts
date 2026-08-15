"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type AppointmentStatus = "upcoming" | "completed" | "cancelled";

export type Appointment = {
  id: string;
  doctorName: string;
  doctorPhoto: string;
  specialty: string;
  location: string;
  fee: number;
  dayName: string;
  date: string;
  slot: string;
  patientName: string;
  patientPhone: string;
  insurance: string;
  trackingCode: string;
  createdAt: number;
  status: AppointmentStatus;
};

type AppointmentsState = {
  items: Appointment[];
  add: (a: Omit<Appointment, "id" | "createdAt" | "status">) => string;
  cancel: (id: string) => void;
  reschedule: (id: string, dayName: string, date: string, slot: string) => void;
  markCompleted: (id: string) => void;
  clear: () => void;
};

const genId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

const genCode = () =>
  String(Math.floor(10000 + Math.random() * 90000));

export const useAppointments = create<AppointmentsState>()(
  persist(
    (set) => ({
      items: [],
      add: (a) => {
        const id = genId();
        const trackingCode = genCode();
        const item: Appointment = {
          ...a,
          id,
          trackingCode,
          createdAt: Date.now(),
          status: "upcoming",
        };
        set((s) => ({ items: [item, ...s.items] }));
        return trackingCode;
      },
      cancel: (id) =>
        set((s) => ({
          items: s.items.map((x) =>
            x.id === id ? { ...x, status: "cancelled" as const } : x
          ),
        })),
      reschedule: (id, dayName, date, slot) =>
        set((s) => ({
          items: s.items.map((x) =>
            x.id === id ? { ...x, dayName, date, slot } : x
          ),
        })),
      markCompleted: (id) =>
        set((s) => ({
          items: s.items.map((x) =>
            x.id === id ? { ...x, status: "completed" as const } : x
          ),
        })),
      clear: () => set({ items: [] }),
    }),
    {
      name: "noban-appointments",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
