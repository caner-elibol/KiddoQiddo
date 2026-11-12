import { create } from "zustand";
import { storageService } from "@/services/storageService";
import { authService, type LoginResponse, type ChildLoginResponse } from "@/services/authService";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "Parent" | "Child" | "Admin";
  familyId: string;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setFromAuthResponse: (res: LoginResponse) => Promise<void>;
  setFromChildLogin: (res: ChildLoginResponse) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setFromAuthResponse: async (res) => {
    const user: User = {
      id: res.userId,
      email: res.email,
      name: res.fullName,
      role: res.role as User["role"],
      familyId: res.familyId,
    };
    set({ user, isAuthenticated: true });
    await storageService.setJSON("user", user);
  },

  setFromChildLogin: async (res) => {
    const user: User = {
      id: res.childId,
      email: "",
      name: res.childName,
      role: "Child",
      familyId: res.familyId,
    };
    set({ user, isAuthenticated: true });
    await storageService.setJSON("user", user);
  },

  logout: async () => {
    await authService.logout();
    set({ user: null, isAuthenticated: false });
  },

  hydrate: async () => {
    try {
      const user = await storageService.getJSON<User>("user");
      const token = await storageService.getItem("accessToken");
      if (user && token) {
        set({ user, isAuthenticated: true });
      }
    } catch (error) {
      console.error("Failed to hydrate auth store:", error);
    } finally {
      set({ isLoading: false });
    }
  },
}));
