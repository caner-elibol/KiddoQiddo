import { apiClient } from "./apiClient";

export interface DashboardDto {
  totalChildren: number;
  pendingApprovals: number;
  pendingRewardRequests: number;
  familyCode: string;
  children: ChildSummaryDto[];
}

export interface ChildSummaryDto {
  id: string;
  name: string;
  avatarKey: string;
  totalPoints: number;
  level: number;
  todayTasksCompleted: number;
  todayTasksTotal: number;
}

export interface ChildDto {
  id: string;
  name: string;
  birthYear?: number;
  avatarKey: string;
  level: number;
  totalPoints: number;
  totalLifetimePoints: number;
  isActive: boolean;
}

export const dashboardService = {
  getDashboard: () => apiClient.get<DashboardDto>("/api/parent/dashboard"),
};

export const childrenService = {
  getAll: () => apiClient.get<ChildDto[]>("/api/children"),

  create: (data: { name: string; birthYear?: number; avatarKey: string; pin: string }) =>
    apiClient.post<{ id: string }>("/api/children", data),

  update: (id: string, data: { name: string; birthYear?: number; avatarKey: string }) =>
    apiClient.put("/api/children/" + id, data),

  updatePin: (id: string, newPin: string) =>
    apiClient.put("/api/children/" + id + "/pin", { newPin }),
};
