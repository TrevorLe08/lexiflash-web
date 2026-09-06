import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { removeToast } from "../../store/slices/uiSlice";

export const ToastContainer: React.FC = () => {
  const dispatch = useAppDispatch();
  const toasts = useAppSelector((state) => state.ui.toasts);

  useEffect(() => {
    if (toasts.length > 0) {
      const latest = toasts[toasts.length - 1];
      const timer = setTimeout(() => {
        if (latest) {
          dispatch(removeToast(latest.id));
        }
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toasts, dispatch]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === "success";
        const isError = toast.type === "error";

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-xl border transition-all duration-300 transform translate-y-0 ${
              isSuccess
                ? "bg-[#0b291d] border-emerald-500/50 text-emerald-100"
                : isError
                  ? "bg-[#2f1118] border-red-500/50 text-red-100"
                  : "bg-[#1a1d36] border-[#3c476c] text-[#f6f7fb]"
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isSuccess ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : isError ? (
                <AlertCircle className="w-5 h-5 text-red-400" />
              ) : (
                <Info className="w-5 h-5 text-[#6366F1]" />
              )}
            </div>
            <div className="flex-1 text-sm font-medium leading-snug">
              {toast.message}
            </div>
            <button
              onClick={() => dispatch(removeToast(toast.id))}
              className="text-[#939bb4] hover:text-white shrink-0 -mr-1 -mt-1 p-1 rounded hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
