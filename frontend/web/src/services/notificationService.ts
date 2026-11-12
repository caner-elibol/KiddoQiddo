import { Capacitor } from "@capacitor/core";
import { apiClient } from "./apiClient";

export interface NotificationDto {
  id: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  relatedEntityId?: string;
}

export interface NotificationsResult {
  items: NotificationDto[];
  unreadCount: number;
}

export const notificationService = {
  getAll: () => apiClient.get<NotificationsResult>("/api/notifications"),

  markRead: (ids: string[]) =>
    apiClient.post("/api/notifications/read", { ids }),
};

export async function registerPushNotifications(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  try {
    const { PushNotifications } = await import("@capacitor/push-notifications");

    const permission = await PushNotifications.requestPermissions();
    if (permission.receive !== "granted") return;

    await PushNotifications.register();

    // Listen for the FCM/APNs registration token and send to backend.
    PushNotifications.addListener("registration", async (token) => {
      try {
        await apiClient.post("/api/notifications/push-token", {
          token: token.value,
          platform: Capacitor.getPlatform(),
        });
      } catch {
        // Non-critical — push notifications are a best-effort feature.
      }
    });

    PushNotifications.addListener("pushNotificationReceived", (_notification) => {
    });

    PushNotifications.addListener(
      "pushNotificationActionPerformed",
      (_action) => {
      }
    );
  } catch (error) {
    console.error("PushNotifications: registration failed", error);
  }
}

export async function hapticImpact(style: "light" | "medium" | "heavy" = "medium"): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const { Haptics, ImpactStyle } = await import("@capacitor/haptics");
    const styleMap = {
      light: ImpactStyle.Light,
      medium: ImpactStyle.Medium,
      heavy: ImpactStyle.Heavy,
    };
    await Haptics.impact({ style: styleMap[style] });
  } catch {
    // Haptics are optional — never crash on failure.
  }
}
