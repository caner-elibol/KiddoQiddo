"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/shared";
import { rewardService, type RewardDto, type RewardRequestDto } from "@/services/rewardService";
import { childrenService, type ChildDto } from "@/services/familyService";
import { Plus, X, Star } from "lucide-react";

interface CreateRewardForm {
  title: string;
  description: string;
  requiredPoints: number;
  assignedChildIds: string[];
}

const DEFAULT_FORM: CreateRewardForm = {
  title: "",
  description: "",
  requiredPoints: 50,
  assignedChildIds: [],
};

type RequestFilter = "all" | "Requested" | "Approved" | "Delivered" | "Rejected";

const STATUS_LABELS: Record<string, string> = {
  Requested: "Bekliyor",
  Approved: "Onaylandı",
  Delivered: "Teslim Edildi",
  Rejected: "Reddedildi",
};

const STATUS_COLORS: Record<string, string> = {
  Requested: "bg-amber-100 text-amber-800",
  Approved: "bg-indigo-100 text-indigo-800",
  Delivered: "bg-green-100 text-green-800",
  Rejected: "bg-slate-100 text-slate-600",
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "az önce";
  if (mins < 60) return `${mins}dk önce`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}sa önce`;
  return `${Math.floor(hours / 24)}g önce`;
}

function RewardCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-3">
      <div className="flex items-start justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-2 w-full rounded-full" />
    </div>
  );
}

export default function RewardsPage() {
  const [tab, setTab] = useState<"catalog" | "requests">("catalog");
  const [rewards, setRewards] = useState<RewardDto[]>([]);
  const [requests, setRequests] = useState<RewardRequestDto[]>([]);
  const [children, setChildren] = useState<ChildDto[]>([]);
  const [filter, setFilter] = useState<RequestFilter>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<CreateRewardForm>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);

  const loadAll = () => {
    setIsLoading(true);
    Promise.all([
      rewardService.getRewards().catch(() => [] as RewardDto[]),
      rewardService.getRequests().catch(() => [] as RewardRequestDto[]),
    ])
      .then(([r, req]) => {
        setRewards(Array.isArray(r) ? r : []);
        setRequests(Array.isArray(req) ? req : []);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadAll();
    childrenService.getAll().then(setChildren).catch(console.error);
  }, []);

  const toggleChild = (childId: string) => {
    setForm((prev) => ({
      ...prev,
      assignedChildIds: prev.assignedChildIds.includes(childId)
        ? prev.assignedChildIds.filter((id) => id !== childId)
        : [...prev.assignedChildIds, childId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Ödül adı gerekli");
      return;
    }
    if (form.requiredPoints < 1) {
      setError("Puan 1'den küçük olamaz");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await rewardService.createReward({
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        requiredPoints: form.requiredPoints,
        childIds:
          form.assignedChildIds.length > 0 ? form.assignedChildIds : undefined,
      });
      setShowModal(false);
      setForm(DEFAULT_FORM);
      loadAll();
    } catch {
      setError("Ödül oluşturulurken hata oluştu. Tekrar deneyin.");
    } finally {
      setSaving(false);
    }
  };

  const handleDecision = async (id: string, approved: boolean) => {
    setProcessing(id);
    try {
      await rewardService.handleRequest(id, approved);
      loadAll();
    } finally {
      setProcessing(null);
    }
  };

  const handleDeliver = async (id: string) => {
    setProcessing(id);
    try {
      await rewardService.deliverRequest(id);
      loadAll();
    } finally {
      setProcessing(null);
    }
  };

  const pendingCount = requests.filter((r) => r.status === "Requested").length;
  const filteredRequests =
    filter === "all" ? requests : requests.filter((r) => r.status === filter);

  return (
    <div className="animate-fade-in-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-heading">Ödüller</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Çocuklarınızı motive eden ödüller oluşturun ve yönetin
          </p>
        </div>
        {tab === "catalog" && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm font-semibold shadow-sm shadow-indigo-200 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Yeni Ödül
          </button>
        )}
      </div>

      <div className="flex bg-slate-100 dark:bg-slate-800 rounded-2xl p-1 gap-1 mb-6">
        <button
          onClick={() => setTab("catalog")}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
            tab === "catalog"
              ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
          }`}
        >
          🎁 Ödül Kataloğu
        </button>
        <button
          onClick={() => setTab("requests")}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
            tab === "requests"
              ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
          }`}
        >
          📋 Talepler
          {pendingCount > 0 && (
            <span className="bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-full leading-none">
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <RewardCardSkeleton />
          <RewardCardSkeleton />
          <RewardCardSkeleton />
        </div>
      ) : tab === "catalog" ? (
        rewards.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
            <p className="text-5xl mb-4">🎁</p>
            <p className="font-semibold text-slate-700 text-lg">Henüz ödül eklenmedi</p>
            <p className="text-sm text-slate-400 mt-2">
              Çocuklarınızı motive etmek için ilk ödülü oluşturun
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 mt-5 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" /> İlk Ödülü Oluştur
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewards.map((reward) => {
              const assignedChildren = children.filter((c) =>
                reward.assignedChildIds?.includes(c.id)
              );
              return (
                <div
                  key={reward.id}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="font-bold text-slate-900 leading-tight">
                      {reward.title}
                    </h3>
                    <span className="flex items-center gap-1 text-sm font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full whitespace-nowrap shrink-0">
                      <Star className="w-3 h-3 fill-amber-400 stroke-amber-400" />
                      {reward.requiredPoints}
                    </span>
                  </div>

                  {reward.description && (
                    <p className="text-sm text-slate-500 mb-3 leading-snug">
                      {reward.description}
                    </p>
                  )}

                  <div className="w-full bg-slate-100 rounded-full h-1 mb-3">
                    <div className="h-1 rounded-full bg-gradient-to-r from-amber-300 to-orange-400 w-full opacity-60" />
                  </div>

                  <div>
                    {assignedChildren.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {assignedChildren.map((c) => (
                          <span
                            key={c.id}
                            className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium"
                          >
                            {c.avatarKey || "🧒"} {c.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">
                        Tüm çocuklar
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <div>
          <div className="flex flex-wrap gap-2 mb-5">
            {(
              [
                "all",
                "Requested",
                "Approved",
                "Delivered",
                "Rejected",
              ] as RequestFilter[]
            ).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  filter === f
                    ? "bg-slate-900 text-white border-slate-900"
                    : "border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {f === "all" ? "Tümü" : STATUS_LABELS[f]}
                {f !== "all" && (
                  <span className="ml-1 opacity-60">
                    ({requests.filter((r) => r.status === f).length})
                  </span>
                )}
              </button>
            ))}
          </div>

          {filteredRequests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
              <p className="text-5xl mb-4">📋</p>
              <p className="font-semibold text-slate-700">
                {filter === "all"
                  ? "Henüz ödül talebi yok"
                  : "Bu kategoride talep yok"}
              </p>
              <p className="text-sm text-slate-400 mt-1">
                Çocuklar ödül kazandığında burada gösterilecek
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:border-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-slate-900">
                          {req.rewardTitle}
                        </p>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                            STATUS_COLORS[req.status] ?? ""
                          }`}
                        >
                          {STATUS_LABELS[req.status] ?? req.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mt-0.5">
                        <span className="font-medium text-slate-700">
                          {req.childName}
                        </span>
                        <span className="mx-1.5">·</span>
                        <span className="text-amber-600 font-semibold">
                          ⭐ {req.requiredPoints}
                        </span>
                        <span className="ml-2 text-slate-400">
                          {timeAgo(req.requestedAt)}
                        </span>
                      </p>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      {req.status === "Requested" && (
                        <>
                          <button
                            onClick={() => handleDecision(req.id, true)}
                            disabled={processing === req.id}
                            className="px-3 py-1.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 text-xs font-semibold disabled:opacity-50 transition-colors active:scale-95"
                          >
                            {processing === req.id ? "..." : "Onayla"}
                          </button>
                          <button
                            onClick={() => handleDecision(req.id, false)}
                            disabled={processing === req.id}
                            className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 text-xs font-semibold disabled:opacity-50 transition-colors"
                          >
                            Reddet
                          </button>
                        </>
                      )}
                      {req.status === "Approved" && (
                        <button
                          onClick={() => handleDeliver(req.id)}
                          disabled={processing === req.id}
                          className="px-3 py-1.5 bg-green-600 text-white rounded-xl hover:bg-green-700 text-xs font-semibold disabled:opacity-50 transition-colors active:scale-95"
                        >
                          {processing === req.id ? "..." : "✅ Teslim Et"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-4 pb-4 sm:pb-0">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Yeni Ödül Oluştur</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Çocuğunuzu motive edecek bir ödül ekleyin
                </p>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  setForm(DEFAULT_FORM);
                  setError("");
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Ödül Adı *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all text-sm"
                  placeholder="Sinema gecesi 🎬"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Açıklama
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={2}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all resize-none text-sm"
                  placeholder="İsteğe bağlı açıklama..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Gereken Puan *
                </label>
                <input
                  type="number"
                  min={1}
                  value={form.requiredPoints}
                  onChange={(e) =>
                    setForm({ ...form, requiredPoints: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all text-sm"
                />
              </div>

              {children.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Çocuğa Özel
                    <span className="ml-1.5 text-xs text-slate-400 font-normal">
                      (boş = tüm çocuklar)
                    </span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {children.map((child) => {
                      const selected = form.assignedChildIds.includes(child.id);
                      return (
                        <button
                          key={child.id}
                          type="button"
                          onClick={() => toggleChild(child.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border-2 transition-all ${
                            selected
                              ? "bg-indigo-600 border-indigo-600 text-white"
                              : "bg-white border-slate-200 text-slate-700 hover:border-indigo-300"
                          }`}
                        >
                          <span>{child.avatarKey || "🧒"}</span>
                          <span>{child.name}</span>
                          {selected && <span>✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {error && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                  {error}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setForm(DEFAULT_FORM);
                    setError("");
                  }}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors text-sm font-semibold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors text-sm font-semibold"
                >
                  {saving ? "Kaydediliyor..." : "Oluştur"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
