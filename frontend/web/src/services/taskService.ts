import { apiClient } from "./apiClient";

export interface TaskTemplateDto {
  id: string;
  title: string;
  description?: string;
  category: string;
  defaultPoints: number;
  suggestedAgeMin?: number;
  suggestedAgeMax?: number;
}

export interface TaskItemDto {
  id: string;
  title: string;
  description?: string;
  category: string;
  points: number;
  repeatType: string;
  requiresParentApproval: boolean;
  isActive: boolean;
}

// Today's tasks (child view) - matches TodayTaskDto from backend
export interface TodayTaskDto {
  childTaskId: string;
  title: string;
  category: string;
  points: number;
  status: string;
  requiresParentApproval: boolean;
}

// Pending approvals (parent view) - matches PendingApprovalDto from backend
export interface PendingApprovalDto {
  childTaskId: string;
  childId: string;
  childName: string;
  taskTitle: string;
  points: number;
  submittedAt?: string;
}

// Unified type used in UI
export type ChildTaskDto = TodayTaskDto | PendingApprovalDto;

export const taskService = {
  getTemplates: () => apiClient.get<TaskTemplateDto[]>("/api/tasks/templates"),

  getTasks: () => apiClient.get<TaskItemDto[]>("/api/tasks"),

  createTask: (data: {
    title: string;
    description?: string;
    category: string;
    points: number;
    repeatType: string;
    requiresParentApproval: boolean;
    startDate?: string;
    endDate?: string;
  }) => apiClient.post<{ id: string }>("/api/tasks", data),

  assignTask: (taskId: string, childId: string) =>
    apiClient.post("/api/tasks/" + taskId + "/assign/" + childId, {}),

  getPendingApprovals: () => apiClient.get<PendingApprovalDto[]>("/api/tasks/pending-approvals"),

  approveTask: (childTaskId: string, approved: boolean, parentNote?: string) =>
    apiClient.post("/api/tasks/" + childTaskId + "/approve", { approved, parentNote }),

  getTodayTasks: () => apiClient.get<TodayTaskDto[]>("/api/tasks/today"),

  submitTask: (childTaskId: string, note?: string) =>
    apiClient.post("/api/tasks/" + childTaskId + "/submit", { note }),
};
