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
    <div className="space-y-4">
      {/* Section Title */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>

        <div className="mt-2 border-b" />
      </div>

      {/* Notification Items */}
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between rounded-xl border bg-white p-4 transition hover:bg-gray-50"
          >
            <div>
              <h4 className="font-medium text-gray-900">{item.label}</h4>

              {item.description && (
                <p className="mt-1 text-sm text-gray-500">{item.description}</p>
              )}
            </div>

            {/* Toggle */}
            <button
              type="button"
              onClick={() => item.onChange(!item.checked)}
              className={`
                relative
                h-7
                w-12
                rounded-full
                transition-all
                duration-300

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
                  shadow
                  transition-all
                  duration-300

                  ${item.checked ? "left-6" : "left-1"}
                `}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
