"use client";

import { create } from "zustand";
import { api, ApiError } from "@/lib/api";
import type { User } from "@/lib/types";

type AuthState = {
  user: User | null;
  status: "idle" | "loading" | "ready";
  fetchMe: () => Promise<void>;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: "idle",
  fetchMe: async () => {
    set({ status: "loading" });
    try {
      const { user } = await api.get<{ user: User }>("/auth/me");
      set({ user, status: "ready" });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        set({ user: null, status: "ready" });
      } else {
        set({ status: "ready" });
      }
    }
  },
  setUser: (user) => set({ user }),
  logout: async () => {
    await api.post("/auth/logout");
    set({ user: null });
  },
}));
