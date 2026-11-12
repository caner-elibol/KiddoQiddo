import { storageService } from "./storageService";
import { Capacitor, CapacitorHttp } from "@capacitor/core";

const CONFIGURED_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5125";

// Android emulator reaches the host machine at 10.0.2.2, not localhost
function getBaseUrl(): string {
  try {
    const platform = Capacitor.getPlatform();
    if (
      platform === "android" &&
      (CONFIGURED_URL.includes("localhost") || CONFIGURED_URL.includes("127.0.0.1"))
    ) {
      return CONFIGURED_URL
        .replace(/localhost/g, "10.0.2.2")
        .replace(/127\.0\.0\.1/g, "10.0.2.2");
    }
  } catch {
    // Capacitor not available (SSR / early load) — fall through
  }
  return CONFIGURED_URL;
}

async function buildHeaders(withAuth: boolean): Promise<Record<string, string>> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (withAuth) {
    const token = await storageService.getItem("accessToken");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

// Native uses CapacitorHttp to bypass WebView CORS and mixed-content limits; web uses fetch
async function httpRequest(
  url: string,
  method: string,
  headers: Record<string, string>,
  body?: string
): Promise<{ status: number; data: unknown }> {
  if (Capacitor.isNativePlatform()) {
    const response = await CapacitorHttp.request({
      url,
      method,
      headers,
      data: body ? JSON.parse(body) : undefined,
    });
    return { status: response.status, data: response.data };
  }

  const res = await fetch(url, {
    method,
    headers,
    body,
  });
  const data = res.status === 204 ? undefined : await res.json().catch(() => undefined);
  return { status: res.status, data };
}

class ApiClient {
  private isRefreshing = false;
  private refreshQueue: Array<(token: string | null) => void> = [];

  constructor() {}

  private async tryRefresh(): Promise<string | null> {
    if (this.isRefreshing) {
      return new Promise((resolve) => {
        this.refreshQueue.push(resolve);
      });
    }
    this.isRefreshing = true;
    try {
      const refreshToken = await storageService.getItem("refreshToken");
      if (!refreshToken) return null;

      const response = await httpRequest(
        `${getBaseUrl()}/api/auth/refresh`,
        "POST",
        { "Content-Type": "application/json" },
        JSON.stringify({ refreshToken })
      );
      if (response.status !== 200) return null;

      const data = response.data as { accessToken: string; refreshToken: string };
      await storageService.setItem("accessToken", data.accessToken);
      await storageService.setItem("refreshToken", data.refreshToken);
      this.refreshQueue.forEach((cb) => cb(data.accessToken));
      return data.accessToken;
    } catch {
      this.refreshQueue.forEach((cb) => cb(null));
      return null;
    } finally {
      this.isRefreshing = false;
      this.refreshQueue = [];
    }
  }

  private async handleUnauthorized(): Promise<void> {
    await storageService.removeItem("accessToken");
    await storageService.removeItem("refreshToken");
    await storageService.removeItem("user");
    if (typeof window !== "undefined") {
      const isChildRoute = window.location.pathname.startsWith("/child");
      window.location.href = isChildRoute ? "/child-login" : "/login";
    }
  }

  private extractErrorMessage(data: unknown, status: number): string {
    if (data && typeof data === "object") {
      const d = data as Record<string, unknown>;
      const msg = d.title ?? d.message ?? d.detail;
      if (typeof msg === "string") return msg;
    }
    return `Hata: ${status}`;
  }

  async request<T>(
    endpoint: string,
    options: { method?: string; body?: string; skipAuth?: boolean } = {}
  ): Promise<T> {
    const { method = "GET", body, skipAuth } = options;
    const url = `${getBaseUrl()}${endpoint}`;
    const headers = await buildHeaders(!skipAuth);

    let response = await httpRequest(url, method, headers, body);

    if (response.status === 401 && !skipAuth) {
      const newToken = await this.tryRefresh();
      if (!newToken) {
        await this.handleUnauthorized();
        throw new Error("Oturum süresi doldu, lütfen tekrar giriş yapın.");
      }
      const retryHeaders = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${newToken}`,
      };
      response = await httpRequest(url, method, retryHeaders, body);
    }

    if (response.status >= 400) {
      throw new Error(this.extractErrorMessage(response.data, response.status));
    }

    if (response.status === 204 || response.data === undefined) return undefined as T;
    return response.data as T;
  }

  get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: "GET" });
  }

  post<T>(endpoint: string, body?: unknown, opts: { skipAuth?: boolean } = {}) {
    return this.request<T>(endpoint, {
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...opts,
    });
  }

  put<T>(endpoint: string, body?: unknown) {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  del<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

export const apiClient = new ApiClient();
