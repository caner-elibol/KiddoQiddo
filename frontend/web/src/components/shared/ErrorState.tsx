import { AlertTriangle } from "lucide-react";

interface ErrorStateProps {
  title: string;
  message?: string;
  action?: React.ReactNode;
}

export function ErrorState({ title, message, action }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 px-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
      <AlertTriangle className="w-12 h-12 text-red-600 dark:text-red-400" />
      <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">
        {title}
      </h3>
      {message && (
        <p className="text-sm text-red-800 dark:text-red-200 max-w-sm text-center">
          {message}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
