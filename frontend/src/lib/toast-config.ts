import type { ExternalToast } from "sonner";

export const TOAST_CONFIG = {
  position: "bottom-right" as const,
  duration: {
    success: 3000,
    error: 4000,
    info: 3000,
    warning: 3000,
  },
  expand: true,
  richColors: true,
} as const;

export const getToastOptions = (type: keyof typeof TOAST_CONFIG.duration): ExternalToast => ({
  duration: TOAST_CONFIG.duration[type],
});
