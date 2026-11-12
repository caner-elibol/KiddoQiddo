"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared";
import { taskService, type TaskTemplateDto } from "@/services/taskService";
import { useRouter } from "next/navigation";

const CATEGORY_ICONS: Record<string, string> = {
  Temizlik: "🧹",
  Düzen: "📦",
  Eğitim: "📚",
  Spor: "⚽",
  Yemek: "🍽️",
  Aile: "👨‍👩‍👧",
  Sorumluluk: "✅",
  Diğer: "🌟",
};

export default function TaskTemplatesPage() {
  const [templates, setTemplates] = useState<TaskTemplateDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    taskService.getTemplates()
      .then((data) => setTemplates(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const groups = templates
    .filter((t) =>
      !search ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase())
    )
    .reduce<Record<string, TaskTemplateDto[]>>((acc, t) => {
      (acc[t.category] ??= []).push(t);
      return acc;
    }, {});

  const handleUse = (template: TaskTemplateDto) => {
    router.push(`/tasks?template=${encodeURIComponent(JSON.stringify({
      title: template.title,
      category: template.category,
      points: template.defaultPoints,
    }))}`);
  };

  return (
    <div>
      <PageHeader
        title="Görev Şablonları"
        description="Hazır şablonlardan görev oluşturun — hızlı başlangıç 🚀"
      />

      <div className="mb-6">
        <input
          type="text"
          placeholder="Şablon ara... (ör: Oda, Ödev, Spor)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {isLoading ? (
        <div className="text-slate-500 py-8 text-center">Yükleniyor...</div>
      ) : Object.keys(groups).length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <p className="text-5xl mb-4">🔍</p>
          <p className="font-semibold text-slate-700 dark:text-slate-300">Şablon bulunamadı</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groups).map(([category, items]) => (
            <div key={category}>
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                <span>{CATEGORY_ICONS[category] ?? "📋"}</span>
                {category}
                <span className="ml-auto bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs px-2 py-0.5 rounded-full">{items.length}</span>
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {items.map((tpl) => (
                  <div
                    key={tpl.id}
                    className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-4 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                  >
                    <span className="text-3xl shrink-0">{CATEGORY_ICONS[tpl.category] ?? "📋"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">{tpl.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">⭐ {tpl.defaultPoints} puan</span>
                        {(tpl.suggestedAgeMin || tpl.suggestedAgeMax) && (
                          <span className="text-xs text-slate-400">
                            · {tpl.suggestedAgeMin}-{tpl.suggestedAgeMax} yaş
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleUse(tpl)}
                      className="shrink-0 px-3 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Kullan
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 bg-blue-50 dark:bg-blue-950/40 rounded-xl p-4 text-sm text-blue-700 dark:text-blue-300">
        <p className="font-semibold mb-1">💡 Şablonlar nasıl çalışır?</p>
        <p>
          Şablondan &quot;Kullan&quot; butonuna tıkladığınızda &quot;Görevler&quot; sayfasına yönlendirilirsiniz ve görev formu otomatik doldurulur.
          Nokta değeri, kategori ve başlığı istediğiniz gibi düzenleyebilirsiniz.
        </p>
      </div>
    </div>
  );
}

