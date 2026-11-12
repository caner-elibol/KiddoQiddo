import { PageHeader } from "@/components/shared";

export default function SettingsPage() {
  return (
    <div>
      <PageHeader
        title="Ayarlar"
        description="Hesap ve tercihlerinizi yönetin"
      />

      <div className="max-w-2xl space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Profil Ayarları
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Ad
              </label>
              <input
                type="text"
                placeholder="Adınız"
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="Email adresiniz"
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Bildirimler
          </h3>
          <div className="space-y-3">
            {["Yeni görevler", "Tamamlanan görevler", "Ödül talepleri"].map(
              (item) => (
                <div key={item} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id={item}
                    defaultChecked
                    className="rounded"
                  />
                  <label htmlFor={item} className="text-sm text-slate-700 dark:text-slate-300">
                    {item}
                  </label>
                </div>
              )
            )}
          </div>
        </div>

        <button className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
          Değişiklikleri Kaydet
        </button>
      </div>
    </div>
  );
}
