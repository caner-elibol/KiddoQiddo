"use client";

import { LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

const CHILD_MENU_ITEMS = [
  { href: "/child-home", label: "Ana Sayfa", icon: "🏠" },
  { href: "/child-rewards", label: "Puan Mağazası", icon: "🛍️" },
  { href: "/child-pet", label: "Evcil Hayvanım", icon: "🐾" },
];

export function ChildLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isLoading, logout, hydrate } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const handleLogout = async () => {
    await logout();
    router.push("/child-login");
  };

  // Show the app shell only when a child is actually logged in.
  // While hydrating, or when unauthenticated (login page), render bare content.
  const isChildAuthenticated = !isLoading && isAuthenticated && user?.role === "Child";

  // Bare layout — used for login page and during hydration
  if (!isChildAuthenticated) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-300 dark:from-purple-900 dark:via-pink-900 dark:to-blue-900">
        <div className="flex-1 flex flex-col pt-safe pb-safe">
          <main className="flex-1 overflow-auto px-4 py-6 sm:px-6">
            <div className="max-w-2xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-300 dark:from-purple-900 dark:via-pink-900 dark:to-blue-900">
      <div className="flex-1 flex flex-col overflow-hidden pt-safe">
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-white/20 dark:border-slate-800/20">
          <div className="flex items-center justify-between px-4 py-3 sm:px-6">
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              KiddoQiddo
            </h1>

            <div className="flex items-center gap-2">
              <Link
                href="/child-settings"
                className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto px-4 py-6 sm:px-6">
          <div className="max-w-2xl mx-auto">{children}</div>
        </main>

        <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-t border-white/20 dark:border-slate-800/20 pb-safe">
          <div className="flex items-center justify-around px-4 py-3">
            {CHILD_MENU_ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname === item.href + "/";
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "text-purple-700 dark:text-purple-300 bg-white/40"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}

