import { toast } from "sonner";
import { getToastOptions } from "@/lib/toast-config";

export const useNotifications = () => {
  const showSuccess = (message: string, description?: string) => {
    toast.success(message, {
      description,
      ...getToastOptions("success"),
    });
  };

  const showError = (message: string, description?: string) => {
    toast.error(message, {
      description,
      ...getToastOptions("error"),
    });
  };

  const showInfo = (message: string, description?: string) => {
    toast.info(message, {
      description,
      ...getToastOptions("info"),
    });
  };

  const showWarning = (message: string, description?: string) => {
    toast.warning(message, {
      description,
      ...getToastOptions("warning"),
    });
  };

  const showPromise = <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    });
  };

  return {
    success: showSuccess,
    error: showError,
    info: showInfo,
    warning: showWarning,
    promise: showPromise,
  };
};
