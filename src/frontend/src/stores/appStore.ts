import { create } from "zustand";
import type { UserRole } from "../types";

interface AppState {
  currentRole: UserRole;
  hasHomeownerProfile: boolean;
  hasWorkerProfile: boolean;
  availableRoles: UserRole[];
  setCurrentRole: (role: UserRole) => void;
  setHasHomeownerProfile: (val: boolean) => void;
  setHasWorkerProfile: (val: boolean) => void;
  setAvailableRoles: (roles: UserRole[]) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentRole: "homeowner",
  hasHomeownerProfile: false,
  hasWorkerProfile: false,
  availableRoles: [],
  setCurrentRole: (role) => set({ currentRole: role }),
  setHasHomeownerProfile: (val) => set({ hasHomeownerProfile: val }),
  setHasWorkerProfile: (val) => set({ hasWorkerProfile: val }),
  setAvailableRoles: (roles) => set({ availableRoles: roles }),
}));
