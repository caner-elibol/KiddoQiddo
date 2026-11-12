import { apiClient } from "./apiClient";

export interface RewardDto {
  id: string;
  title: string;
  description?: string;
  requiredPoints: number;
  isActive: boolean;
  assignedChildIds: string[];
}

export interface RewardRequestDto {
  id: string;
  rewardId: string;
  rewardTitle: string;
  requiredPoints: number;
  childId: string;
  childName?: string;
  status: string;
  requestedAt: string;
}

export interface ChildRewardRequestDto {
  id: string;
  rewardId: string;
  rewardTitle: string;
  requiredPoints: number;
  status: string;
  requestedAt: string;
}

export const rewardService = {
  getRewards: () => apiClient.get<RewardDto[]>("/api/rewards"),

  createReward: (data: { title: string; description?: string; requiredPoints: number; childIds?: string[] }) =>
    apiClient.post<{ id: string }>("/api/rewards", data),

  getRequests: (status?: string) => {
    const qs = status ? "?status=" + encodeURIComponent(status) : "";
    return apiClient.get<RewardRequestDto[]>("/api/rewards/requests" + qs);
  },

  requestReward: (rewardId: string) =>
    apiClient.post("/api/rewards/" + rewardId + "/request", {}),

  getMyRequests: () =>
    apiClient.get<ChildRewardRequestDto[]>("/api/child/my-reward-requests"),

  handleRequest: (requestId: string, approved: boolean) =>
    apiClient.post("/api/rewards/requests/" + requestId + "/handle", { approved }),

  deliverRequest: (requestId: string) =>
    apiClient.post("/api/rewards/requests/" + requestId + "/deliver", {}),
};
