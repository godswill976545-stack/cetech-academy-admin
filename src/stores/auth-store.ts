import { create } from 'zustand';
import type { AdminUser } from '@/types';

interface AuthState {
  user: AdminUser | null;
  setUser: (user: AdminUser | null) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));
