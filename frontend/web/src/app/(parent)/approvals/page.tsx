"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/shared";
import { taskService, type PendingApprovalDto } from "@/services/taskService";
import { rewardService, type RewardRequestDto } from "@/services/rewardService";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "az önce";
  if (mins < 60) return `${mins}dk önce`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}sa önce`;
  return `${Math.floor(hours / 24)}g önce`;
}

function ApprovalCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
      <div className="flex items-start gap-4">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-5 w-56" />
          <Skeleton className="h-3 w-40" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20 rounded-xl" />
          <Skeleton className="h-9 w-16 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function ApprovalsPage() {
  const [tab, setTab] = useState<"tasks" | "rewards">("tasks");
  const [tasks, setTasks] = useState<PendingApprovalDto[]>([]);
  const [rewardRequests, setRewardRequests] = useState<RewardRequestDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const load = () => {
    setIsLoading(true);
    Promise.all([
      taskService.getPendingApprovals().catch(() => [] as PendingApprovalDto[]),
      rewardService.getRequests("Requested").catch(() => [] as RewardRequestDto[]),
    ])
      .then(([taskData, rewardData]) => {
        setTasks(Array.isArray(taskData) ? taskData : []);
        setRewardRequests(Array.isArray(rewardData) ? rewardData : []);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(load, []);

  const handleTaskDecision = async (id: string, approved: boolean) => {
    setProcessing(id);
    try {
      await taskService.approveTask(id, approved);
      load();
    } finally {
      setProcessing(null);
    }
  };

  const handleRewardDecision = async (id: string, approved: boolean) => {
    setProcessing(id);
    try {
      await rewardService.handleRequest(id, approved);
      load();
    } finally {
      setProcessing(null);
    }
  };

  const totalPending = tasks.length + rewardRequests.length;

  return (
    <div className="animate-fade-in-up">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 font-heading">Onaylar</h1>
        <p className="text-slate-500 mt-1 text-sm">
          {isLoading
            ? "Onaylar yükleniyor..."
            : totalPending > 0
            ? `${totalPending} işlem onayınızı bekliyor`
            : "Her şey güncel, harika gidiyorsunuz ✨"}
        </p>
      </div>

      <div className="flex bg-slate-100 dark:bg-slate-800 rounded-2xl p-1 gap-1 mb-6">
        <button
          onClick={() => setTab("tasks")}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
            tab === "tasks"
              ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
          }`}
        >
          ✅ Görevler
          {tasks.length > 0 && (
            <span className="bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-full leading-none">
              {tasks.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("rewards")}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
            tab === "rewards"
              ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
          }`}
        >
          🎁 Ödül Talepleri
          {rewardRequests.length > 0 && (
            <span className="bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-full leading-none">
              {rewardRequests.length}
            </span>
          )}
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <ApprovalCardSkeleton />
          <ApprovalCardSkeleton />
          <ApprovalCardSkeleton />
        </div>
      ) : tab === "tasks" ? (
        tasks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
            <p className="text-5xl mb-4">✨</p>
            <p className="font-semibold text-slate-700 text-lg">Tüm onaylar güncel</p>
            <p className="text-sm text-slate-400 mt-2">
              Çocuklar görevleri tamamladığında burada görünecek
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.childTaskId}
                className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:border-slate-200 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Görev Tamamlandı
                    </p>
                    <p className="font-semibold text-slate-900 text-base leading-tight">
                      {task.taskTitle}
                    </p>
                    <p className="text-sm text-slate-500 mt-1.5">
                      <span className="font-medium text-slate-700">{task.childName}</span>
                      <span className="mx-2">·</span>
                      <span className="text-amber-600 font-semibold">
                        ⭐ {task.points} puan
                      </span>
                      {task.submittedAt && (
                        <span className="ml-2 text-slate-400">
                          {timeAgo(task.submittedAt)}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleTaskDecision(task.childTaskId, true)}
                      disabled={processing === task.childTaskId}
                      className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 text-sm font-semibold disabled:opacity-50 transition-colors active:scale-95"
                    >
                      {processing === task.childTaskId ? "..." : "Onayla"}
                    </button>
                    <button
                      onClick={() => handleTaskDecision(task.childTaskId, false)}
                      disabled={processing === task.childTaskId}
                      className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-red-50 hover:text-red-600 text-sm font-semibold disabled:opacity-50 transition-colors"
                    >
                      Reddet
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        rewardRequests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
            <p className="text-5xl mb-4">🎁</p>
            <p className="font-semibold text-slate-700 text-lg">Bekleyen ödül talebi yok</p>
            <p className="text-sm text-slate-400 mt-2">
              Çocuklar ödül istediğinde burada görünecek
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {rewardRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100 hover:border-amber-200 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-amber-500 mb-1">
                      Ödül Talebi
                    </p>
                    <p className="font-semibold text-slate-900 text-base leading-tight">
                      {req.rewardTitle}
                    </p>
                    <p className="text-sm text-slate-500 mt-1.5">
                      <span className="font-medium text-slate-700">{req.childName}</span>
                      <span className="mx-2">·</span>
                      <span className="text-amber-600 font-semibold">
                        ⭐ {req.requiredPoints} puan
                      </span>
                      <span className="ml-2 text-slate-400">{timeAgo(req.requestedAt)}</span>
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleRewardDecision(req.id, true)}
                      disabled={processing === req.id}
                      className="px-4 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 text-sm font-semibold disabled:opacity-50 transition-colors active:scale-95"
                    >
                      {processing === req.id ? "..." : "Onayla"}
                    </button>
                    <button
                      onClick={() => handleRewardDecision(req.id, false)}
                      disabled={processing === req.id}
                      className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 text-sm font-semibold disabled:opacity-50 transition-colors"
                    >
                      Reddet
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
