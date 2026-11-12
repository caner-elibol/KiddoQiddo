"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/shared";
import { dashboardService, type DashboardDto } from "@/services/familyService";
import { useAuthStore } from "@/stores/authStore";
import Link from "next/link";
import { CheckCircle2, Gift, Users, ArrowRight, Star } from "lucide-react";

function getGreeting(name?: string) {
  const h = new Date().getHours();
  const firstName = name?.split(" ")[0];
  const suffix = firstName ? `, ${firstName}` : "";
  if (h < 12) return `Günaydın${suffix} 👋`;
  if (h < 18) return `İyi günler${suffix} 👋`;
  return `İyi akşamlar${suffix} 👋`;
}

function StatCard({
  icon,
  label,
  value,
  accent,
  href,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent: string;
  href?: string;
  highlight?: boolean;
}) {
  const inner = (
    <div
      className={`bg-white rounded-2xl p-5 shadow-sm border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 flex items-center justify-between group ${
        highlight ? "border-amber-200" : "border-slate-100"
      }`}
    >
      <div>
        <p className="text-sm text-slate-500 font-medium">{label}</p>
        <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${accent}`}>
        {icon}
      </div>
    </div>
  );
  return href ? (
    <Link href={href} className="block">
      {inner}
    </Link>
  ) : (
    inner
  );
}

function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
      <Skeleton className="h-4 w-24 mb-4" />
      <Skeleton className="h-8 w-14" />
    </div>
  );
}

function ChildProgressSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
      <Skeleton className="h-5 w-36 mb-5" />
      {[1, 2].map((i) => (
        <div key={i} className="flex items-center gap-3 py-4 border-b border-slate-50 last:border-0">
          <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-2 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    dashboardService
      .getDashboard()
      .then(setData)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const pending = (data?.pendingApprovals ?? 0) + (data?.pendingRewardRequests ?? 0);

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-heading">
          {getGreeting(user?.name)}
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          {isLoading
            ? "Ailenizin durumu yükleniyor..."
            : pending > 0
            ? `${pending} işlem onayınızı bekliyor.`
            : "Aileniz bugün harika gidiyor ⭐"}
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            icon={<Users className="w-5 h-5 text-indigo-600" />}
            label="Çocuklar"
            value={data?.totalChildren ?? 0}
            accent="bg-indigo-50"
          />
          <StatCard
            icon={<CheckCircle2 className="w-5 h-5 text-amber-600" />}
            label="Bekleyen Onaylar"
            value={data?.pendingApprovals ?? 0}
            accent="bg-amber-50"
            href={(data?.pendingApprovals ?? 0) > 0 ? "/approvals" : undefined}
            highlight={(data?.pendingApprovals ?? 0) > 0}
          />
          <StatCard
            icon={<Gift className="w-5 h-5 text-purple-600" />}
            label="Ödül Talepleri"
            value={data?.pendingRewardRequests ?? 0}
            accent="bg-purple-50"
            href={(data?.pendingRewardRequests ?? 0) > 0 ? "/rewards" : undefined}
          />
        </div>
      )}

      {!isLoading && (data?.pendingApprovals ?? 0) > 0 && (
        <Link
          href="/approvals"
          className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-2xl p-4 hover:bg-amber-100 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">✋</span>
            <div>
              <p className="font-semibold text-amber-900 text-sm">
                {data!.pendingApprovals} görev onayınızı bekliyor
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                Çocuğunuz harika iş çıkardı, onaylayın ⭐
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-amber-500 shrink-0 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      )}

      {!isLoading && data?.familyCode && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-1">
              Aile Kodu
            </p>
            <p className="text-2xl font-bold tracking-widest text-indigo-900">
              {data.familyCode}
            </p>
            <p className="text-xs text-indigo-400 mt-1">
              Çocuklarınız bu kodla giriş yapıyor
            </p>
          </div>
          <span className="text-4xl select-none">🏠</span>
        </div>
      )}

      {isLoading ? (
        <ChildProgressSkeleton />
      ) : data && data.children.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-5 pt-5 pb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Bugünkü İlerleme</h2>
            <Link
              href="/tasks"
              className="text-xs text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1 transition-colors"
            >
              Görevler <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {data.children.map((child) => {
              const total = child.todayTasksTotal || 0;
              const done = child.todayTasksCompleted || 0;
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;
              const avatarDisplay =
                child.avatarKey && child.avatarKey.length > 1
                  ? child.avatarKey
                  : child.name.charAt(0).toUpperCase();
              return (
                <div key={child.id} className="px-5 py-4">
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-lg font-bold text-indigo-700 flex-shrink-0">
                      {avatarDisplay}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-slate-900 text-sm">{child.name}</p>
                        <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
                          {done}/{total} görev
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        Seviye {child.level}
                        <span className="mx-1">·</span>
                        <Star className="w-3 h-3 inline text-amber-400" />
                        {child.totalPoints} puan
                      </p>
                    </div>
                  </div>
                  {total > 0 ? (
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">Bugün için görev atanmamış</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : !isLoading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-10 text-center">
          <p className="text-4xl mb-3">👨‍👩‍👧‍👦</p>
          <p className="font-semibold text-slate-700">Henüz çocuk eklenmedi</p>
          <p className="text-sm text-slate-400 mt-1">
            İlk çocuğunuzu ekleyerek başlayın
          </p>
          <Link
            href="/children"
            className="inline-flex items-center gap-2 mt-5 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Çocuk Ekle <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : null}
    </div>
  );
}

