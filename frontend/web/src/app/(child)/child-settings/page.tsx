"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/services/apiClient";
import { storageService } from "@/services/storageService";
import { useAuthStore } from "@/stores/authStore";

interface ChildMeDto {
  id: string;
  name: string;
  avatarKey: string;
  totalPoints: number;
  totalLifetimePoints: number;
  level: number;
  levelProgressPercent: number;
  pointsForNextLevel: number;
}

const LEVEL_PETS = [
  "🥚", "🐣", "🐥", "🐢", "🐇", "🦊", "🐉", "🦅", "🦁", "🌟",
];

export default function ChildSettingsPage() {
  const [info, setInfo] = useState<ChildMeDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    apiClient.get<ChildMeDto>("/api/child/me")
      .then(setInfo)
      .catch(async () => {
        const cached = await storageService.getJSON<ChildMeDto>("childInfo");
        setInfo(cached);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/child-login");
  };

  const petEmoji = LEVEL_PETS[Math.min((info?.level ?? 1) - 1, LEVEL_PETS.length - 1)];

  return (
    <div className="space-y-6 pb-8">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center">⚙️ Ayarlar</h2>

      {isLoading ? (
        <div className="text-center py-12 text-slate-500">Yükleniyor...</div>
      ) : (
        <>
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-sm">
            <div className="text-6xl mb-3">{info?.avatarKey ?? "👤"}</div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{info?.name}</h3>
            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{info?.totalPoints ?? 0}</p>
                <p className="text-xs text-slate-500">Mevcut Puan</p>
              </div>
              <div className="w-px h-10 bg-slate-200 dark:bg-slate-700" />
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{info?.totalLifetimePoints ?? 0}</p>
                <p className="text-xs text-slate-500">Toplam Puan</p>
              </div>
              <div className="w-px h-10 bg-slate-200 dark:bg-slate-700" />
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{info?.level ?? 1}</p>
                <p className="text-xs text-slate-500">Seviye</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">🐾 Evcil Hayvan Durumu</p>
            <div className="flex items-center gap-4">
              <span className="text-4xl">{petEmoji}</span>
              <div className="flex-1">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Seviye {info?.level ?? 1}</span>
                  {(info?.pointsForNextLevel ?? 0) > 0 && (
                    <span>Sonraki: {info?.pointsForNextLevel} puan</span>
                  )}
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                  <div
                    className="h-2.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                    style={{ width: `${info?.levelProgressPercent ?? 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/40 rounded-xl p-4 text-sm text-blue-700 dark:text-blue-300">
            <p className="font-semibold mb-1">💡 PIN Değiştirme</p>
            <p>PIN değiştirmek için ebeveyninden yardım iste. Ebeveyn &quot;Çocuklar&quot; bölümünden PIN&apos;ini güncelleyebilir.</p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-3 bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-semibold rounded-xl hover:bg-red-200 dark:hover:bg-red-900 transition-colors"
          >
            🚪 Çıkış Yap
          </button>
        </>
      )}
    </div>
  );
}
