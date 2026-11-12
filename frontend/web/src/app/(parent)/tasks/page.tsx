"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/shared";
import { taskService, type TaskItemDto } from "@/services/taskService";
import { childrenService, type ChildDto } from "@/services/familyService";
import { Plus, X } from "lucide-react";

const CATEGORIES = ["Okul", "Sağlık", "Ev Düzeni", "Kişisel Bakım", "Spor", "Okuma", "Uyku", "Aile"];
const REPEAT_TYPES = [
  { value: "Daily", label: "Her Gün" },
  { value: "Weekly", label: "Haftalık" },
  { value: "Once", label: "Bir Kez" },
  { value: "Custom", label: "Özel Tarihler" },
];

interface CreateTaskForm {
  title: string;
  description: string;
  category: string;
  points: number;
  repeatType: string;
  requiresParentApproval: boolean;
  assignedChildIds: string[];
  startDate: string;
  endDate: string;
}

const DEFAULT_FORM: CreateTaskForm = {
  title: "",
  description: "",
  category: "Okul",
  points: 10,
  repeatType: "Daily",
  requiresParentApproval: true,
  assignedChildIds: [],
  startDate: "",
  endDate: "",
};

export default function TasksPage() {
  return (
    <Suspense fallback={<div className="text-slate-500 py-8 text-center">Yükleniyor...</div>}>
      <TasksPageInner />
    </Suspense>
  );
}

function TasksPageInner() {
  const [tasks, setTasks] = useState<TaskItemDto[]>([]);
  const [children, setChildren] = useState<ChildDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<CreateTaskForm>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();

  const loadTasks = () =>
    taskService.getTasks()
      .then(setTasks)
      .catch(console.error)
      .finally(() => setIsLoading(false));

  useEffect(() => {
    loadTasks();
    childrenService.getAll().then(setChildren).catch(console.error);

    // Pre-fill form from ?template= query param (set by task-templates page)
    const raw = searchParams.get("template");
    if (raw) {
      try {
        const tpl = JSON.parse(decodeURIComponent(raw));
        setForm((prev) => ({
          ...prev,
          title: tpl.title ?? prev.title,
          category: tpl.category ?? prev.category,
          points: tpl.points ?? prev.points,
        }));
        setShowModal(true);
      } catch { /* invalid JSON, ignore */ }
    }
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
    if (!form.title.trim()) { setError("Görev adı gerekli"); return; }
    if (form.repeatType === "Custom") {
      if (!form.startDate || !form.endDate) { setError("Başlangıç ve bitiş tarihi gerekli"); return; }
      if (form.startDate > form.endDate) { setError("Başlangıç tarihi bitiş tarihinden önce olmalı"); return; }
    }
    setSaving(true); setError("");
    try {
      const { id: taskId } = await taskService.createTask({
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        category: form.category,
        points: form.points,
        repeatType: form.repeatType,
        requiresParentApproval: form.requiresParentApproval,
        startDate: form.repeatType === "Custom" ? form.startDate : undefined,
        endDate: form.repeatType === "Custom" ? form.endDate : undefined,
      });

      // Assign to selected children — each call also generates today's child_task
      await Promise.all(
        form.assignedChildIds.map((childId) => taskService.assignTask(taskId, childId))
      );

      setShowModal(false);
      setForm(DEFAULT_FORM);
      setIsLoading(true);
      loadTasks();
    } catch {
      setError("Görev oluşturulurken hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const closeModal = () => { setShowModal(false); setForm(DEFAULT_FORM); setError(""); };

  return (
    <div>
      <PageHeader
        title="Görevler"
        description="Aile görevlerini yönetin"
        action={
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Yeni Görev
          </button>
        }
      />

      {isLoading ? (
        <div className="text-slate-500 py-8 text-center">Yükleniyor...</div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <p className="text-5xl mb-4">📋</p>
          <p className="font-semibold text-slate-700 dark:text-slate-300">Henüz görev yok</p>
          <p className="text-sm mt-1">Yeni bir görev oluşturmak için yukarıdaki butona tıklayın</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900 dark:text-white">{task.title}</p>
                <p className="text-sm text-slate-500 mt-0.5">{task.category} · {task.points} puan · {REPEAT_TYPES.find(r => r.value === task.repeatType)?.label ?? task.repeatType}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${task.isActive ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300" : "bg-slate-100 text-slate-500"}`}>
                {task.isActive ? "Aktif" : "Pasif"}
              </span>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Yeni Görev Oluştur</h2>
              <button onClick={closeModal} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Görev Adı *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ödevimi bitirdim"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Açıklama</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="İsteğe bağlı açıklama..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Kategori</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tekrar</label>
                  <select
                    value={form.repeatType}
                    onChange={(e) => setForm({ ...form, repeatType: e.target.value, startDate: "", endDate: "" })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {REPEAT_TYPES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
              </div>

              {form.repeatType === "Custom" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Başlangıç Tarihi *</label>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Bitiş Tarihi *</label>
                    <input
                      type="date"
                      value={form.endDate}
                      min={form.startDate || undefined}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {form.startDate && form.endDate && form.startDate <= form.endDate && (
                    <div className="col-span-2 bg-blue-50 dark:bg-blue-950 rounded-lg px-3 py-2 text-xs text-blue-700 dark:text-blue-300">
                      {(() => {
                        const days = Math.round((new Date(form.endDate).getTime() - new Date(form.startDate).getTime()) / 86400000) + 1;
                        const daily = days > 0 ? Math.floor(form.points / days) : form.points;
                        const remainder = days > 0 ? form.points % days : 0;
                        return `${days} gün · Günlük ${daily} puan${remainder > 0 ? ` (son gün +${remainder})` : ""} = Toplam ${form.points} puan`;
                      })()}
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Puan{form.repeatType === "Custom" ? " (Toplam)" : ""}</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={form.points}
                  onChange={(e) => setForm({ ...form, points: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.requiresParentApproval}
                  onChange={(e) => setForm({ ...form, requiresParentApproval: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">Ebeveyn onayı gereksin</span>
              </label>

              {children.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Çocuklara Ata
                    <span className="ml-1 text-xs text-slate-400 font-normal">(hemen çocuk görevine eklenir)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {children.map((child) => {
                      const selected = form.assignedChildIds.includes(child.id);
                      return (
                        <button
                          key={child.id}
                          type="button"
                          onClick={() => toggleChild(child.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all ${
                            selected
                              ? "bg-blue-600 border-blue-600 text-white"
                              : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-blue-400"
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

              {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
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

