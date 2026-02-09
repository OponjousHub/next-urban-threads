import { useEffect } from "react";
import { useTenant } from "@/store/tenant-provider-context";

export function useClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  onClose: () => void,
) {
  const { tenant } = useTenant();
  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!ref.current) return;

      if (!ref.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [ref, onClose]);
}
