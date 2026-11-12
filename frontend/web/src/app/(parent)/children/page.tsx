"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared";
import { childrenService, type ChildDto } from "@/services/familyService";
import { Plus, X } from "lucide-react";

const AVATARS = ["🧒", "👦", "👧", "🧑", "🐶", "🐱", "🦊", "🐼", "🐨", "🦁", "🐸", "🦄"];

interface CreateChildForm {
  name: string;
  birthYear: string;
  avatarKey: string;
  pin: string;
  pinConfirm: string;
}

const DEFAULT_FORM: CreateChildForm = {
  name: "",
  birthYear: "",
  avatarKey: "🧒",
  pin: "",
  pinConfirm: "",
};

export default function ChildrenPage() {
  const [children, setChildren] = useState<ChildDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<CreateChildForm>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadChildren = () =>
    childrenService.getAll()
      .then(setChildren)
      .catch(console.error)
      .finally(() => setIsLoading(false));

  useEffect(() => { loadChildren(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("İsim gerekli"); return; }
    if (form.pin.length < 4) { setError("PIN en az 4 haneli olmalı"); return; }
    if (form.pin !== form.pinConfirm) { setError("PIN'ler eşleşmiyor"); return; }
    setSaving(true); setError("");
    try {
      await childrenService.create({
        name: form.name.trim(),
        birthYear: form.birthYear ? parseInt(form.birthYear) : undefined,
        avatarKey: form.avatarKey,
        pin: form.pin,
      });
      setShowModal(false);
      setForm(DEFAULT_FORM);
      setIsLoading(true);
      loadChildren();
    } catch {
      setError("Çocuk oluşturulurken hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Çocuklar"
        description="Aile üyelerini yönetin"
        action={
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Çocuk Ekle
          </button>
        }
      />

      {isLoading ? (
        <div className="text-slate-500 py-8 text-center">Yükleniyor...</div>
      ) : children.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <p className="text-5xl mb-4">👶</p>
          <p className="font-semibold text-slate-700 dark:text-slate-300">Henüz çocuk eklenmedi</p>
          <p className="text-sm mt-1">İlk çocuğunuzu eklemek için yukarıdaki butona tıklayın</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {children.map((child) => (
            <div key={child.id} className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-4xl">{child.avatarKey || "🧒"}</span>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{child.name}</h3>
                  {child.birthYear && <p className="text-sm text-slate-500">{child.birthYear}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-blue-50 dark:bg-blue-950 rounded p-2 text-center">
                  <p className="font-bold text-blue-700 dark:text-blue-300">{child.totalPoints}</p>
                  <p className="text-blue-600 dark:text-blue-400 text-xs">Toplam Puan</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-950 rounded p-2 text-center">
                  <p className="font-bold text-purple-700 dark:text-purple-300">{child.level}</p>
                  <p className="text-purple-600 dark:text-purple-400 text-xs">Seviye</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Yeni Çocuk Ekle</h2>
              <button onClick={() => { setShowModal(false); setForm(DEFAULT_FORM); setError(""); }} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">İsim *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Adı"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Doğum Yılı</label>
                <input
                  type="number"
                  min={2000}
                  max={new Date().getFullYear()}
                  value={form.birthYear}
                  onChange={(e) => setForm({ ...form, birthYear: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="2018"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Avatar Seç</label>
                <div className="grid grid-cols-6 gap-2">
                  {AVATARS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setForm({ ...form, avatarKey: emoji })}
                      className={`text-2xl h-10 w-10 rounded-lg flex items-center justify-center transition-colors ${
                        form.avatarKey === emoji
                          ? "bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-500"
                          : "hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">PIN (4+ haneli) *</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={8}
                  value={form.pin}
                  onChange={(e) => setForm({ ...form, pin: e.target.value.replace(/\D/g, "") })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">PIN Tekrar *</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={8}
                  value={form.pinConfirm}
                  onChange={(e) => setForm({ ...form, pinConfirm: e.target.value.replace(/\D/g, "") })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••"
                />
              </div>

              {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setForm(DEFAULT_FORM); setError(""); }}
                  className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? "Kaydediliyor..." : "Ekle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

