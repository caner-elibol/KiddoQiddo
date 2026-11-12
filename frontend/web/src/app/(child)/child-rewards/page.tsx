"use client";

import { useEffect, useState } from "react";
import { rewardService, type RewardDto, type ChildRewardRequestDto } from "@/services/rewardService";
import { apiClient } from "@/services/apiClient";

interface ChildInfo {
  id: string;
  name: string;
  totalPoints: number;
  level: number;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  Requested: { label: "Bekliyor", color: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300", icon: "⏳" },
  Approved:  { label: "Onaylandı", color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300", icon: "✅" },
  Rejected:  { label: "Reddedildi", color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300", icon: "❌" },
  Delivered: { label: "Teslim Edildi", color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300", icon: "🎁" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });
}

export default function ChildRewardsPage() {
  const [tab, setTab] = useState<"shop" | "history">("shop");
  const [rewards, setRewards] = useState<RewardDto[]>([]);
  const [history, setHistory] = useState<ChildRewardRequestDto[]>([]);
  const [points, setPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [requesting, setRequesting] = useState<string | null>(null);
  const [requested, setRequested] = useState<Set<string>>(new Set());

  useEffect(() => {
    Promise.all([
      rewardService.getRewards().catch(() => [] as RewardDto[]),
      rewardService.getMyRequests().catch(() => [] as ChildRewardRequestDto[]),
      apiClient.get<{ totalPoints: number }>("/api/child/me").catch(() => ({ totalPoints: 0 })),
    ]).then(([rewardsData, requestsData, me]) => {
      setRewards(Array.isArray(rewardsData) ? rewardsData : []);
      const safeRequests = Array.isArray(requestsData) ? requestsData : [];
      setHistory(safeRequests);
      // Pre-populate requested set: rewards with pending/approved request
      const pendingIds = new Set(
        safeRequests
          .filter((r) => r.status === "Requested" || r.status === "Approved")
          .map((r) => r.rewardId)
      );
      setRequested(pendingIds);
      setPoints((me as { totalPoints: number })?.totalPoints ?? 0);
    }).finally(() => setIsLoading(false));
  }, []);

  const handleRequest = async (rewardId: string) => {
    setRequesting(rewardId);
    try {
      await rewardService.requestReward(rewardId);
      setRequested((prev) => new Set([...prev, rewardId]));
      const updated = await rewardService.getMyRequests().catch(() => history);
      setHistory(Array.isArray(updated) ? updated : history);
    } catch {/* already requested or server-side rejected */}
    finally { setRequesting(null); }
  };

  const activeRewards = rewards.filter((r) => r.isActive);

  return (
    <div className="space-y-4">
      <div className="text-center mb-2">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">🛍️ Puan Mağazası</h2>
        <div className="inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 px-4 py-2 rounded-full mt-3 font-semibold">
          <span className="text-xl">⭐</span>
          <span>{points} puan</span>
        </div>
      </div>

      <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 gap-1">
        <button
          onClick={() => setTab("shop")}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
            tab === "shop"
              ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-500 dark:text-slate-400"
          }`}
        >
          🏪 Mağaza
        </button>
        <button
          onClick={() => setTab("history")}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
            tab === "history"
              ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-500 dark:text-slate-400"
          }`}
        >
          📜 Geçmişim {history.length > 0 && <span className="ml-1">({history.length})</span>}
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">Yükleniyor...</div>
      ) : tab === "shop" ? (
        activeRewards.length === 0 ? (
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 text-center">
            <p className="text-5xl mb-3">🎀</p>
            <p className="font-semibold text-slate-700 dark:text-slate-300">Henüz ödül eklenmemiş</p>
            <p className="text-sm text-slate-500 mt-1">Ebeveynin ödüller ekleyene kadar bekle!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeRewards.map((reward) => {
              const canAfford = points >= reward.requiredPoints;
              const isRequested = requested.has(reward.id);
              return (
                <div
                  key={reward.id}
                  className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-5 flex items-center gap-4 border-2 transition-all ${
                    canAfford
                      ? "border-amber-300 dark:border-amber-600 shadow-md"
                      : "border-transparent opacity-70"
                  }`}
                >
                  <div className="text-4xl shrink-0">🎁</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white text-lg leading-tight">{reward.title}</p>
                    {reward.description && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{reward.description}</p>
                    )}
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-amber-500 text-sm">⭐</span>
                      <span className={`text-sm font-semibold ${canAfford ? "text-amber-600 dark:text-amber-400" : "text-slate-400"}`}>
                        {reward.requiredPoints} puan
                      </span>
                      {!canAfford && (
                        <span className="text-xs text-red-500 dark:text-red-400 ml-1">
                          ({reward.requiredPoints - points} puan eksik)
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRequest(reward.id)}
                    disabled={!canAfford || isRequested || requesting === reward.id}
                    className={`shrink-0 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                      isRequested
                        ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 cursor-default"
                        : canAfford
                        ? "bg-gradient-to-r from-amber-400 to-orange-400 text-white hover:from-amber-500 hover:to-orange-500 shadow-md active:scale-95"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    {requesting === reward.id ? "..." : isRequested ? "✓ Talep Edildi" : "İste!"}
                  </button>
                </div>
              );
            })}
          </div>
        )
      ) : (
        history.length === 0 ? (
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 text-center">
            <p className="text-5xl mb-3">📭</p>
            <p className="font-semibold text-slate-700 dark:text-slate-300">Henüz ödül talebi yok</p>
            <p className="text-sm text-slate-500 mt-1">Mağazadan ödül isteyince burada görünecek</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((req) => {
              const cfg = STATUS_CONFIG[req.status] ?? { label: req.status, color: "bg-slate-100 text-slate-600", icon: "📋" };
              return (
                <div key={req.id} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 flex items-center gap-4">
                  <span className="text-3xl">{cfg.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white">{req.rewardTitle}</p>
                    <p className="text-xs text-slate-500 mt-0.5">⭐ {req.requiredPoints} puan · {formatDate(req.requestedAt)}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${cfg.color}`}>
                    {cfg.label}
                  </span>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}

