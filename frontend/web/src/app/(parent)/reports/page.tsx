"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/shared";
import { apiClient } from "@/services/apiClient";

interface CompletedTaskDto {
  title: string;
  category: string;
  points: number;
  scheduledDate: string;
}

interface ChildReportDto {
  childId: string;
  name: string;
  avatarKey: string;
  totalPoints: number;
  level: number;
  tasksCompletedThisWeek: number;
  tasksPendingApprovalThisWeek: number;
  tasksRejectedThisWeek: number;
  pointsEarnedThisWeek: number;
  rewardRequestsPending: number;
  completedTasksThisWeek: CompletedTaskDto[];
}

interface FamilyReportDto {
  children: ChildReportDto[];
  weekStart: string;
  weekEnd: string;
}

function formatWeek(start: string, end: string) {
  const s = new Date(start).toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
  const e = new Date(end).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
  return `${s} – ${e}`;
}

function ReportSkeleton() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-5">
        <Skeleton className="h-4 w-36 mb-4 opacity-40" />
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center space-y-2">
            <Skeleton className="h-9 w-14 mx-auto opacity-40" />
            <Skeleton className="h-3 w-20 mx-auto opacity-40" />
          </div>
          <div className="text-center space-y-2">
            <Skeleton className="h-9 w-14 mx-auto opacity-40" />
            <Skeleton className="h-3 w-20 mx-auto opacity-40" />
          </div>
          <div className="text-center space-y-2">
            <Skeleton className="h-9 w-14 mx-auto opacity-40" />
            <Skeleton className="h-3 w-20 mx-auto opacity-40" />
          </div>
        </div>
      </div>
      {[1, 2].map((i) => (
        <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 bg-slate-50 border-b border-slate-100">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3 p-4">
            {[1, 2, 3, 4].map((j) => (
              <Skeleton key={j} className="h-20 rounded-xl" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ReportsPage() {
  const [report, setReport] = useState<FamilyReportDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({});

  const toggleAccordion = (childId: string) =>
    setOpenAccordions((prev) => ({ ...prev, [childId]: !prev[childId] }));

  useEffect(() => {
    apiClient.get<FamilyReportDto>("/api/parent/reports")
      .then(setReport)
      .catch(() => setError("Rapor yüklenirken bir sorun oluştu."))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="animate-fade-in-up">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 font-heading">Haftalık Rapor</h1>
        <p className="text-slate-500 mt-1 text-sm">
          {report ? formatWeek(report.weekStart, report.weekEnd) : "Ailenizin bu haftaki özeti"}
        </p>
      </div>

      {isLoading ? (
        <ReportSkeleton />
      ) : error ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
          <p className="text-5xl mb-4">📊</p>
          <p className="font-semibold text-slate-700">Rapor yüklenemedi</p>
          <p className="text-sm text-slate-400 mt-2">{error}</p>
          <button
            onClick={() => { setError(""); setIsLoading(true); apiClient.get<FamilyReportDto>("/api/parent/reports").then(setReport).catch(() => setError("Rapor yüklenirken bir sorun oluştu.")).finally(() => setIsLoading(false)); }}
            className="mt-5 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      ) : !report || report.children.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">🌱</p>
          <p className="font-semibold text-slate-700 text-lg">Henüz veri yok</p>
          <p className="text-sm text-slate-400 mt-1">
            Görevler tamamlandıkça haftalık özet burada görünecek
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-5 text-white">
            <p className="text-sm font-semibold uppercase tracking-wide opacity-80 mb-3">Bu Hafta Aile Özeti</p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold">
                  {report.children.reduce((s, c) => s + c.tasksCompletedThisWeek, 0)}
                </p>
                <p className="text-xs opacity-75 mt-0.5">Tamamlanan Görev</p>
              </div>
              <div>
                <p className="text-3xl font-bold">
                  {report.children.reduce((s, c) => s + c.pointsEarnedThisWeek, 0)}
                </p>
                <p className="text-xs opacity-75 mt-0.5">Kazanılan Puan</p>
              </div>
              <div>
                <p className="text-3xl font-bold">
                  {report.children.reduce((s, c) => s + c.rewardRequestsPending, 0)}
                </p>
                <p className="text-xs opacity-75 mt-0.5">Bekleyen Ödül</p>
              </div>
            </div>
          </div>

          {report.children.map((child) => {
            const total = child.tasksCompletedThisWeek + child.tasksPendingApprovalThisWeek + child.tasksRejectedThisWeek;
            const pct = total > 0 ? Math.round((child.tasksCompletedThisWeek / total) * 100) : 0;
            return (
              <div key={child.childId} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-4 bg-slate-50 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-lg font-bold text-indigo-700 shrink-0">
                    {child.avatarKey && child.avatarKey.length > 1 ? child.avatarKey : child.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{child.name}</p>
                    <p className="text-xs text-slate-500">Seviye {child.level} · Toplam {child.totalPoints} puan</p>
                  </div>
                  {child.rewardRequestsPending > 0 && (
                    <span className="ml-auto bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                      {child.rewardRequestsPending} ödül bekliyor
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-3 p-4">
                  <div className="rounded-xl p-3 text-center bg-green-50 text-green-700">
                    <p className="text-xl mb-0.5">✅</p>
                    <p className="text-2xl font-bold">{child.tasksCompletedThisWeek}</p>
                    <p className="text-xs mt-0.5 opacity-75">Onaylanan</p>
                  </div>
                  <div className="rounded-xl p-3 text-center bg-amber-50 text-amber-700">
                    <p className="text-xl mb-0.5">⏳</p>
                    <p className="text-2xl font-bold">{child.tasksPendingApprovalThisWeek}</p>
                    <p className="text-xs mt-0.5 opacity-75">Onay Bekliyor</p>
                  </div>
                  <div className="rounded-xl p-3 text-center bg-slate-50 text-slate-600">
                    <p className="text-xl mb-0.5">↩️</p>
                    <p className="text-2xl font-bold">{child.tasksRejectedThisWeek}</p>
                    <p className="text-xs mt-0.5 opacity-75">Geri Alınan</p>
                  </div>
                  <div className="rounded-xl p-3 text-center bg-purple-50 text-purple-700">
                    <p className="text-xl mb-0.5">⭐</p>
                    <p className="text-2xl font-bold">{child.pointsEarnedThisWeek}</p>
                    <p className="text-xs mt-0.5 opacity-75">Bu Hafta</p>
                  </div>
                </div>

                {total > 0 && (
                  <div className="px-4 pb-4">
                    <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                      <span>Bu haftaki tamamlanma oranı</span>
                      <span className="font-semibold text-slate-700">{pct}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )}

                {child.completedTasksThisWeek && child.completedTasksThisWeek.length > 0 && (
                  <div className="border-t border-slate-100">
                    <button
                      onClick={() => toggleAccordion(child.childId)}
                      className="w-full flex items-center justify-between px-5 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      <span>✅ Tamamlanan Görevler ({child.completedTasksThisWeek.length})</span>
                      <span className={`transition-transform duration-200 ${openAccordions[child.childId] ? "rotate-180" : ""}`}>▾</span>
                    </button>
                    {openAccordions[child.childId] && (
                      <ul className="divide-y divide-slate-50 pb-2">
                        {child.completedTasksThisWeek.map((task, i) => (
                          <li key={i} className="flex items-center justify-between px-5 py-2.5 hover:bg-slate-50">
                            <div>
                              <p className="text-sm font-medium text-slate-800">{task.title}</p>
                              <p className="text-xs text-slate-400">{task.category} · {new Date(task.scheduledDate).toLocaleDateString("tr-TR", { weekday: "short", day: "numeric", month: "short" })}</p>
                            </div>
                            <span className="text-xs font-bold text-amber-600 shrink-0 ml-4">+{task.points} ⭐</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
