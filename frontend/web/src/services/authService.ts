import { apiClient } from "./apiClient";
import { storageService } from "./storageService";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  userId: string;
  fullName: string;
  email: string;
  role: string;
  familyId: string;
}

export interface LoginResponse extends AuthTokens {}
export interface RegisterResponse extends AuthTokens {}

export interface ChildLoginResponse {
  accessToken: string;
  childId: string;
  childName: string;
  familyId: string;
  totalPoints: number;
  level: number;
}

export const authService = {
  async register(fullName: string, email: string, password: string): Promise<RegisterResponse> {
    const data = await apiClient.post<RegisterResponse>("/api/auth/register", { fullName, email, password }, { skipAuth: true });
    await storageService.setItem("accessToken", data.accessToken);
    await storageService.setItem("refreshToken", data.refreshToken);
    // Augment with email since backend doesn't return it in the response
    return { ...data, email };
  },

  async login(email: string, password: string): Promise<LoginResponse> {
    const data = await apiClient.post<LoginResponse>("/api/auth/login", { email, password }, { skipAuth: true });
    await storageService.setItem("accessToken", data.accessToken);
    await storageService.setItem("refreshToken", data.refreshToken);
    return { ...data, email };
  },

  async childLogin(familyCode: string, pin: string): Promise<ChildLoginResponse> {
    const data = await apiClient.post<ChildLoginResponse>("/api/auth/child-login", { familyCode, pin }, { skipAuth: true });
    await storageService.setItem("accessToken", data.accessToken);
    await storageService.removeItem("refreshToken");
    return data;
  },

  async logout(): Promise<void> {
    const refreshToken = await storageService.getItem("refreshToken");
    try {
      if (refreshToken) {
        await apiClient.post("/api/auth/logout", { refreshToken });
      }
    } catch {
      // ignore
    } finally {
      await storageService.removeItem("accessToken");
      await storageService.removeItem("refreshToken");
      await storageService.removeItem("user");
    }
  },
};
