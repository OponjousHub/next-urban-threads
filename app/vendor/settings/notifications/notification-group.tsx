"use client";

type NotificationItem = {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
};

type Props = {
  title: string;
  items: NotificationItem[];
};

export default function NotificationGroup({ title, items }: Props) {
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b bg-gray-50 px-6 py-4">
        <h3 className="text-base font-bold text-gray-900">{title}</h3>
      </div>

      {/* Items */}
      <div className="divide-y divide-gray-100">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between px-6 py-5 hover:bg-gray-50 transition-colors"
          >
            <div className="max-w-xl">
              <p className="font-medium text-gray-900">{item.label}</p>

              {item.description && (
                <p className="mt-1 text-sm text-gray-500 leading-relaxed">
                  {item.description}
                </p>
              )}
            </div>

            {/* Toggle */}
            <button
              type="button"
              onClick={() => item.onChange(!item.checked)}
              aria-pressed={item.checked}
              className={`
                relative
                h-7
                w-12
                rounded-full
                transition-all
                duration-300
                focus:outline-none
                focus:ring-2
                focus:ring-[var(--color-primary)]
                focus:ring-offset-2

                ${item.checked ? "bg-[var(--color-primary)]" : "bg-gray-300"}
              `}
            >
              <span
                className={`
                  absolute
                  top-1
                  h-5
                  w-5
                  rounded-full
                  bg-white
                  shadow-md
                  transition-all
                  duration-300

                  ${item.checked ? "left-6" : "left-1"}
                `}
              />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
