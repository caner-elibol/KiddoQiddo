import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";

function isNative(): boolean {
  return Capacitor.isNativePlatform();
}

export const storageService = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (isNative()) {
        const { value } = await Preferences.get({ key });
        return value;
      }
      if (typeof window !== "undefined" && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (error) {
      console.error(`Storage: Unable to read key "${key}"`, error);
    }
    return null;
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (isNative()) {
        await Preferences.set({ key, value });
        return;
      }
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch (error) {
      console.error(`Storage: Unable to set key "${key}"`, error);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (isNative()) {
        await Preferences.remove({ key });
        return;
      }
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Storage: Unable to remove key "${key}"`, error);
    }
  },

  async clear(): Promise<void> {
    try {
      if (isNative()) {
        await Preferences.clear();
        return;
      }
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.clear();
      }
    } catch (error) {
      console.error("Storage: Unable to clear", error);
    }
  },

  async getJSON<T>(key: string): Promise<T | null> {
    const value = await this.getItem(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`Storage: Unable to parse JSON for key "${key}"`, error);
      return null;
    }
  },

  async setJSON<T>(key: string, value: T): Promise<void> {
    try {
      await this.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Storage: Unable to stringify value for key "${key}"`, error);
    }
  },
};
