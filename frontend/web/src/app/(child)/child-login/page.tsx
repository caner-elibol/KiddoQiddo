"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import { storageService } from "@/services/storageService";
import { useAuthStore } from "@/stores/authStore";

export default function ChildLoginPage() {
  const [familyCode, setFamilyCode] = useState("");
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { setFromChildLogin } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await authService.childLogin(familyCode.trim().toUpperCase(), pin);
      await storageService.setJSON("childInfo", {
        id: res.childId,
        name: res.childName,
        familyId: res.familyId,
        totalPoints: res.totalPoints,
        level: res.level,
      });
      // Update auth store so ChildLayout shows the navigation shell
      await setFromChildLogin(res);
      router.push("/child-home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Giriş başarısız oldu");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
          👋 Merhaba!
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Aile kodunu ve PINini gir
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Aile Kodu
          </label>
          <input
            type="text"
            value={familyCode}
            onChange={(e) => setFamilyCode(e.target.value.toUpperCase())}
            placeholder="ABCD12"
            maxLength={8}
            className="w-full px-4 py-3 text-center text-xl font-bold border-2 border-purple-300 dark:border-purple-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 uppercase"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            PIN
          </label>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="••••"
            maxLength={6}
            className="w-full px-4 py-3 text-center text-2xl font-bold border-2 border-purple-300 dark:border-purple-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !familyCode || !pin}
          className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 transition-colors"
        >
          {isLoading ? "Yükleniyor..." : "Giriş Yap"}
        </button>
      </form>
    </div>
  );
}

