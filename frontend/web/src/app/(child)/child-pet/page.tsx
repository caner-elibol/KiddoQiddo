"use client";

import { useEffect, useRef, useState } from "react";
import { storageService } from "@/services/storageService";
import { taskService } from "@/services/taskService";

interface ChildInfo {
  id: string;
  name: string;
  totalPoints: number;
  totalLifetimePoints: number;
  level: number;
}

// Points needed to reach each level (cumulative)
const LEVEL_THRESHOLDS = [0, 50, 150, 300, 500, 750, 1050, 1400, 1800, 2250];

function getPointsToNextLevel(level: number, totalPoints: number) {
  const nextThreshold = LEVEL_THRESHOLDS[level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + 500;
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const progress = totalPoints - currentThreshold;
  const needed = nextThreshold - currentThreshold;
  return { progress, needed, pct: Math.min(100, Math.round((progress / needed) * 100)) };
}

const LEVEL_PETS = ["🐣", "🐥", "🐤", "🐦", "🦆", "🦅", "🦁", "🐉", "✨🐉", "🌟🐉"];
const LEVEL_NAMES = ["Yumurta", "Civciv", "Ördek", "Kuş", "Kırlangıç", "Kartal", "Aslan", "Ejder", "Ejder Ustası", "Efsane"];

const MILESTONES = [
  { points: 50, label: "İlk 50 Puan", icon: "🥉", reached: false },
  { points: 150, label: "150 Puan", icon: "🥈", reached: false },
  { points: 300, label: "300 Puan", icon: "🥇", reached: false },
  { points: 500, label: "Süper Kahraman", icon: "🏆", reached: false },
];

export default function ChildPetPage() {
  const [childInfo, setChildInfo] = useState<ChildInfo | null>(null);
  const [tasksToday, setTasksToday] = useState({ total: 0, completed: 0 });
  const [customPetName, setCustomPetName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [draftName, setDraftName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    storageService.getJSON<ChildInfo>("childInfo").then(setChildInfo);
    storageService.getItem("petCustomName").then((saved) => {
      if (saved) setCustomPetName(saved);
    });
    taskService.getTodayTasks()
      .then((tasks) => {
        const completed = tasks.filter((t) => t.status === "Approved" || t.status === "Submitted").length;
        setTasksToday({ total: tasks.length, completed });
      })
      .catch(() => {});
  }, []);

  const level = childInfo?.level ?? 1;
  const totalPoints = childInfo?.totalPoints ?? 0;
  const totalLifetimePoints = childInfo?.totalLifetimePoints ?? 0;
  const { progress, needed, pct } = getPointsToNextLevel(level, totalLifetimePoints);
  const petEmoji = LEVEL_PETS[Math.min(level - 1, LEVEL_PETS.length - 1)];
  const petSpeciesName = LEVEL_NAMES[Math.min(level - 1, LEVEL_NAMES.length - 1)];
  const displayPetName = customPetName || petSpeciesName;
  const isHappy = tasksToday.total === 0 || tasksToday.completed > 0;

  const milestones = MILESTONES.map((m) => ({ ...m, reached: totalLifetimePoints >= m.points }));

  const startEditing = () => {
    setDraftName(displayPetName);
    setIsEditingName(true);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const saveName = async () => {
    const trimmed = draftName.trim();
    setCustomPetName(trimmed);
    await storageService.setItem("petCustomName", trimmed);
    setIsEditingName(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") saveName();
    if (e.key === "Escape") setIsEditingName(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center gap-2 min-h-[40px]">
        {isEditingName ? (
          <input
            ref={inputRef}
            autoFocus
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onBlur={saveName}
            onKeyDown={handleKeyDown}
            maxLength={20}
            className="text-2xl font-bold text-center bg-white/70 dark:bg-slate-800/70 rounded-xl px-3 py-1 outline-none border-2 border-purple-400 text-slate-900 dark:text-white w-52"
          />
        ) : (
          <>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">🐾 {displayPetName}</h2>
            <button
              onClick={startEditing}
              className="text-lg leading-none hover:scale-125 transition-transform active:scale-95"
              title="Adı değiştir"
            >
              ✏️
            </button>
          </>
        )}
      </div>

      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 text-center shadow-sm">
        <div
          className="text-8xl mb-3 inline-block"
          style={{ filter: isHappy ? "none" : "grayscale(50%)", transition: "filter 0.5s" }}
        >
          {petEmoji}
        </div>
        <p className="text-sm font-semibold text-purple-600 dark:text-purple-300 uppercase tracking-wide mb-1">
          {isHappy ? "Mutlu 😊" : "Görevleri bekliyor 😴"}
        </p>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{petSpeciesName}</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Seviye {level}</p>
      </div>

      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Seviye İlerlemesi</span>
          <span className="text-sm text-slate-500">{progress} / {needed} puan</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-right text-xs text-slate-400 mt-1">{pct}%</p>
      </div>

      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm">
        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">Bugünkü Görevler</h4>
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-700"
              style={{ width: tasksToday.total > 0 ? `${Math.round((tasksToday.completed / tasksToday.total) * 100)}%` : "0%" }}
            />
          </div>
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300 shrink-0">
            {tasksToday.completed}/{tasksToday.total}
          </span>
        </div>
      </div>

      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm">
        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Rozetler</h4>
        <div className="grid grid-cols-4 gap-3">
          {milestones.map((m) => (
            <div key={m.points} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${m.reached ? "opacity-100" : "opacity-30 grayscale"}`}>
              <span className="text-3xl">{m.icon}</span>
              <span className="text-[10px] text-center text-slate-600 dark:text-slate-300 font-medium leading-tight">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 px-5 py-2.5 rounded-full font-bold text-lg">
          <span>⭐</span>
          <span>Toplam {totalPoints} puan</span>
        </div>
      </div>
    </div>
  );
}
