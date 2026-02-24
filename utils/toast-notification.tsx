import toast from "react-hot-toast";

export function toastSuccess(message: any) {
  return toast.success(message, {
    duration: 6000, // 6 seconds
    style: {
      border: "1px solid #4f46e5",
      padding: "12px",
      color: "#333",
    },
    iconTheme: {
      primary: "#4f46e5",
      secondary: "#fff",
    },
  });
}
export function toastError( message: any) {
  return toast.error(message, {
    duration: 6000, // 6 seconds
    style: {
      border: "1px solid #4f46e5",
      padding: "12px",
      color: "#333",
    },
    iconTheme: {
      primary: "#4f46e5",
      secondary: "#fff",
    },
  });
}
