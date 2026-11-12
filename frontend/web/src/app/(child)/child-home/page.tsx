"use client";

import { useEffect, useState } from "react";
import { taskService, type TodayTaskDto } from "@/services/taskService";
import { storageService } from "@/services/storageService";
import { apiClient } from "@/services/apiClient";
import { Skeleton } from "@/components/shared";

interface ChildInfo {
  id: string;
  name: string;
  totalPoints: number;
  totalLifetimePoints: number;
  level: number;
}

interface ChildMeDto {
  id: string;
  name: string;
  totalPoints: number;
  totalLifetimePoints: number;
  level: number;
  levelProgressPercent: number;
  pointsForNextLevel: number;
}

const QIDDO_MESSAGES = [
  "Küçük kazanımlar büyük alışkanlıklar yaratır 🌱",
  "Her görev seni ödülüne yaklaştırıyor 🎁",
  "Sen bu konuda çok iyisin ⚡",
  "Bugünkü rutin yarını kolaylaştırır 🔥",
  "Qiddo seninle birlikte büyüyor ⭐",
];

function getQiddoMessage(): string {
  return QIDDO_MESSAGES[new Date().getDate() % QIDDO_MESSAGES.length];
}

function getGreeting(name: string): string {
  const h = new Date().getHours();
  if (h < 12) return `Günaydın, ${name}! ☀️`;
  if (h < 18) return `Merhaba, ${name}! ⭐`;
  return `İyi akşamlar, ${name}! 🌙`;
}

function TaskSkeleton() {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-3 border border-white">
      <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/4" />
      </div>
      <Skeleton className="w-16 h-9 rounded-xl flex-shrink-0" />
    </div>
  );
}

export default function ChildHomePage() {
  const [tasks, setTasks] = useState<TodayTaskDto[]>([]);
  const [childInfo, setChildInfo] = useState<ChildInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [justCompleted, setJustCompleted] = useState<string | null>(null);

  const refreshChildInfo = async () => {
    try {
      const fresh = await apiClient.get<ChildMeDto>("/api/child/me");
      const updated: ChildInfo = {
        id: fresh.id,
        name: fresh.name,
        totalPoints: fresh.totalPoints,
        totalLifetimePoints: fresh.totalLifetimePoints,
        level: fresh.level,
      };
      setChildInfo(updated);
      await storageService.setJSON("childInfo", updated);
    } catch {
      const cached = await storageService.getJSON<ChildInfo>("childInfo");
      setChildInfo(cached);
    }
  };

  useEffect(() => {
    Promise.all([
      refreshChildInfo(),
      taskService.getTodayTasks().catch(() => [] as TodayTaskDto[]),
    ])
      .then(([, fetchedTasks]) => {
        setTasks(Array.isArray(fetchedTasks) ? fetchedTasks : []);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleSubmit = async (childTaskId: string) => {
    setSubmitting(childTaskId);
    try {
      await taskService.submitTask(childTaskId);
      setJustCompleted(childTaskId);
      setTimeout(() => setJustCompleted(null), 600);
      setTasks((prev) =>
        prev.map((t) =>
          t.childTaskId === childTaskId ? { ...t, status: "Submitted" } : t
        )
      );
      await refreshChildInfo();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(null);
    }
  };

  const completed = tasks.filter(
    (t) => t.status === "Approved" || t.status === "Submitted"
  ).length;
  const total = tasks.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const allDone = total > 0 && completed === total;

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 rounded-2xl p-5 text-white shadow-lg shadow-indigo-200/50">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 shadow-inner">
            🦊
          </div>
          <div className="min-w-0">
            <p className="font-bold text-lg leading-tight truncate">
              {isLoading
                ? "Merhaba! ⭐"
                : childInfo
                ? getGreeting(childInfo.name)
                : "Merhaba! ⭐"}
            </p>
            <p className="text-purple-100 text-sm mt-0.5 leading-snug">
              {getQiddoMessage()}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 text-center border border-white shadow-sm">
          {isLoading ? (
            <Skeleton className="h-8 w-16 mx-auto mb-1" />
          ) : (
            <p className="text-3xl font-bold text-indigo-600">
              {childInfo?.totalPoints ?? 0}
            </p>
          )}
          <p className="text-xs font-semibold text-slate-500 mt-1">⭐ Toplam Puan</p>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 text-center border border-white shadow-sm">
          {isLoading ? (
            <Skeleton className="h-8 w-12 mx-auto mb-1" />
          ) : (
            <p className="text-3xl font-bold text-purple-600">
              {childInfo?.level ?? 1}
            </p>
          )}
          <p className="text-xs font-semibold text-slate-500 mt-1">🏆 Seviye</p>
        </div>
      </div>

      {!isLoading && total > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-slate-700">Bugünkü İlerleme</p>
            <p className="text-sm font-bold text-indigo-600">
              {completed}/{total}
            </p>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2.5">
            <div
              className="h-2.5 rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 transition-all duration-700 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {allDone
              ? "🎉 Hepsini tamamladın! Harika iş!"
              : `${total - completed} görev daha kaldı`}
          </p>
        </div>
      )}

      <div>
        <h3 className="text-sm font-bold text-slate-700 mb-3 px-1 uppercase tracking-wide">
          📋 Bugünün Görevleri
        </h3>

        {isLoading ? (
          <div className="space-y-3">
            <TaskSkeleton />
            <TaskSkeleton />
            <TaskSkeleton />
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center border border-white shadow-sm">
            <p className="text-4xl mb-3">🌟</p>
            <p className="font-semibold text-slate-700">Bugün için görev yok</p>
            <p className="text-sm text-slate-400 mt-1">
              Ebeveynin yakında yeni görevler ekleyecek
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => {
              const isDone =
                task.status === "Submitted" || task.status === "Approved";
              const isJustDone = justCompleted === task.childTaskId;

              return (
                <div
                  key={task.childTaskId}
                  className={`flex items-center gap-3 p-4 rounded-2xl border transition-all duration-200 ${
                    isJustDone ? "animate-task-pop" : ""
                  } ${
                    isDone
                      ? "bg-green-50/90 border-green-200 backdrop-blur-sm"
                      : "bg-white/80 border-white backdrop-blur-sm shadow-sm"
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
                      isDone ? "bg-green-100" : "bg-indigo-50"
                    }`}
                  >
                    {isDone ? "✅" : "📌"}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-semibold text-sm leading-tight ${
                        isDone
                          ? "line-through text-slate-400"
                          : "text-slate-800"
                      }`}
                    >
                      {task.title}
                    </p>
                    <p
                      className={`text-xs mt-0.5 font-semibold ${
                        isDone ? "text-green-500" : "text-amber-500"
                      }`}
                    >
                      {isDone ? "Tamamlandı ✓" : `+${task.points} ⭐`}
                    </p>
                  </div>

                  {!isDone && (
                    <button
                      onClick={() => handleSubmit(task.childTaskId)}
                      disabled={submitting === task.childTaskId}
                      className="flex-shrink-0 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-bold rounded-xl hover:opacity-90 disabled:opacity-50 active:scale-95 transition-all shadow-sm"
                    >
                      {submitting === task.childTaskId ? "..." : "Yaptım!"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {!isLoading && allDone && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5 text-center">
          <p className="text-3xl mb-2">🌟</p>
          <p className="font-bold text-green-800">Bugün harika bir gün oldu!</p>
          <p className="text-xs text-green-600 mt-1">
            Yarın da böyle devam et 🌱
          </p>
        </div>
      )}
    </div>
  );
}

