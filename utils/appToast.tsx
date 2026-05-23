import { toast } from "sonner";
import { AdminToast } from "@/components/ui/adminToast";

export const appToast = {
  success: (title: string, description?: string) => {
    const duration = 4000;

    toast.custom(
      (id) => (
        <AdminToast
          type="success"
          title={title}
          description={description}
          duration={duration}
        />
      ),
      {
        duration,
      },
    );
  },

  error: (title: string, description?: string) => {
    const duration = 6000;

    toast.custom(
      (id) => (
        <AdminToast
          type="error"
          title={title}
          description={description}
          duration={duration}
        />
      ),
      {
        duration,
      },
    );
  },

  warning: (title: string, description?: string) => {
    const duration = 5000;

    toast.custom(
      (id) => (
        <AdminToast
          type="warning"
          title={title}
          description={description}
          duration={duration}
        />
      ),
      {
        duration,
      },
    );
  },
};
