import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import Toast, { ToastVariant } from "../components/ui/alert/Toast";

export interface ToastMessage {
  id: string;
  variant: ToastVariant;
  message: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (variant: ToastVariant, message: string, duration?: number) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (variant: ToastVariant, message: string, duration: number = 4000) => {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      setToasts((prev) => [...prev, { id, variant, message, duration }]);
    },
    []
  );

  const showSuccess = useCallback(
    (message: string, duration?: number) => showToast("success", message, duration),
    [showToast]
  );

  const showError = useCallback(
    (message: string, duration?: number) => showToast("error", message, duration),
    [showToast]
  );

  const showWarning = useCallback(
    (message: string, duration?: number) => showToast("warning", message, duration),
    [showToast]
  );

  const showInfo = useCallback(
    (message: string, duration?: number) => showToast("info", message, duration),
    [showToast]
  );

  // Listen to global API errors emitted by axios interceptor
  useEffect(() => {
    const handleApiError = (event: Event) => {
      const customEvent = event as CustomEvent<{ message?: string }>;
      const msg = customEvent.detail?.message || "Terjadi kesalahan pada server.";
      showError(msg);
    };

    window.addEventListener("api-error", handleApiError);
    return () => {
      window.removeEventListener("api-error", handleApiError);
    };
  }, [showError]);

  return (
    <ToastContext.Provider
      value={{ showToast, showSuccess, showError, showWarning, showInfo, removeToast }}
    >
      {children}
      {/* Render Toast Container */}
      <div
        style={{
          position: "fixed",
          top: "1.25rem",
          right: "1.25rem",
          zIndex: 99999,
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          maxWidth: "24rem",
          width: "100%",
          pointerEvents: "none",
        }}
      >
        {toasts.map((toast) => (
          <div key={toast.id} style={{ pointerEvents: "auto" }}>
            <Toast
              show={true}
              variant={toast.variant}
              message={toast.message}
              duration={toast.duration}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
