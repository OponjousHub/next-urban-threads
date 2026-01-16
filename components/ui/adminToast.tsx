type ToastType = "success" | "error" | "warning";

interface AdminToastProps {
  title: string;
  description?: string;
  type?: ToastType;
}

export function AdminToast({
  title,
  description,
  type = "success",
}: AdminToastProps) {
  const styles = {
    success: {
      bg: "#e6f2ee",
      border: "#047857",
      text: "#065f46",
    },
    error: {
      bg: "#f8e8e8",
      border: "#B91C1C",
      text: "#7f1d1d",
    },
    warning: {
      bg: "#f9e8b5",
      border: "#CA8A04",
      text: "#713f12",
    },
  };

  const current = styles[type];

  return (
    <div
      style={{
        backgroundColor: current.bg,
        borderLeft: `6px solid ${current.border}`,
        color: current.text,
      }}
      className="w-[420px] p-5 rounded-xl shadow-lg"
    >
      <h4 className="text-lg font-semibold">{title}</h4>

      {description && (
        <p className="mt-1 text-sm leading-relaxed opacity-90">{description}</p>
      )}
    </div>
  );
}

export function GetToast({
  title,
  description,
  type = "success",
}: AdminToastProps) {
  const styles = {
    success: {
      bg: "#e6f2ee",
      border: "#047857",
      text: "#065f46",
    },
    error: {
      bg: "#f8e8e8",
      border: "#B91C1C",
      text: "#7f1d1d",
    },
    warning: {
      bg: "#f9e8b5",
      border: "#CA8A04",
      text: "#713f12",
    },
  };

  const current = styles[type];

  return (
    <div
      style={{
        backgroundColor: current.bg,
        borderLeft: `6px solid ${current.border}`,
        color: current.text,
      }}
      className="w-[220px] p-5 rounded-xl shadow-lg border border-solid border-indigo-600"
    >
      <h4 className="text-lg font-semibold">{title}</h4>

      {description && (
        <p className="mt-1 text-sm leading-relaxed opacity-90">{description}</p>
      )}
    </div>
  );
}
