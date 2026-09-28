import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react";

type ToastType = "success" | "error" | "warning" | "loading";

interface AdminToastProps {
  title: string;
  description?: string;
  type?: ToastType;
  duration?: number;
}

export function AdminToast({
  title,
  description,
  type = "success",
  duration = 6000,
}: AdminToastProps) {
  const styles = {
    success: {
      accent: "#16a34a",
      icon: CheckCircle2,
    },

    error: {
      accent: "#dc2626",
      icon: AlertCircle,
    },

    warning: {
      accent: "#f59e0b",
      icon: AlertTriangle,
    },

    loading: {
      accent: "#2563eb",
      icon: Loader2,
    },
  };

  const current = styles[type];
  const Icon = current.icon;

  return (
    <div
      className="
        relative
        overflow-hidden
        flex
        items-start
        gap-4
        w-[420px]
        rounded-2xl
        border
        bg-white
        p-5
        shadow-xl
        backdrop-blur
      "
      style={{
        borderColor: current.accent,
      }}
    >
      {/* Left accent */}
      <div
        className="absolute left-0 top-0 h-full w-1"
        style={{
          backgroundColor: current.accent,
        }}
      />

      {/* Icon */}
      <div
        className="rounded-full p-2 shrink-0"
        style={{
          backgroundColor: `${current.accent}15`,
        }}
      >
        <Icon
          size={22}
          className={type === "loading" ? "animate-spin" : undefined}
          style={{
            color: current.accent,
          }}
        />
      </div>

      {/* Content */}
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900 text-base">{title}</h4>

        {description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
      </div>

      {/* Progress bar */}
      {duration > 0 && (
        <div
          className="absolute bottom-0 left-0 h-1"
          style={{
            width: "100%",
            backgroundColor: current.accent,
            animation: `shrink ${duration}ms linear forwards`,
          }}
        />
      )}
    </div>
  );
}
