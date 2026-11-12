import { create } from "zustand";

interface Child {
  id: string;
  name: string;
  avatar?: string;
  birthDate?: string;
}

interface ChildStore {
  selectedChild: Child | null;
  children: Child[];

  setSelectedChild: (child: Child | null) => void;
  setChildren: (children: Child[]) => void;
}

export const useChildStore = create<ChildStore>((set) => ({
  selectedChild: null,
  children: [],

  setSelectedChild: (child) => set({ selectedChild: child }),

  setChildren: (children) => set({ children }),
}));
