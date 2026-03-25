"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiAlertCircle, FiCheck, FiInfo, FiX } from "react-icons/fi";

const ToastContext = createContext(null);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within ToastProvider");
    }
    return context;
}

function ToastItem({ toast, onClose }) {
    const config = {
        success: {
            title: "Thành công",
            icon: FiCheck,
            ring: "ring-sky-200",
            iconClass: "bg-sky-100 text-sky-600",
        },
        error: {
            title: "Có lỗi xảy ra",
            icon: FiX,
            ring: "ring-rose-200",
            iconClass: "bg-rose-100 text-rose-600",
        },
        warning: {
            title: "Cần chú ý",
            icon: FiAlertCircle,
            ring: "ring-amber-200",
            iconClass: "bg-amber-100 text-amber-600",
        },
        info: {
            title: "Thông báo",
            icon: FiInfo,
            ring: "ring-sky-200",
            iconClass: "bg-sky-100 text-sky-600",
        },
    }[toast.type];

    const Icon = config.icon;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -18, scale: 0.96 }}
            className={`pointer-events-auto w-full max-w-sm rounded-[1.6rem] border border-white/70 bg-white/95 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.12)] ring-1 backdrop-blur-xl ${config.ring}`}
        >
            <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${config.iconClass}`}>
                    <Icon size={18} />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-sky-900 uppercase tracking-tight">{config.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-sky-800/70 font-medium">{toast.message}</p>
                </div>
                <button
                    type="button"
                    onClick={() => onClose(toast.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl text-sky-300 transition hover:bg-sky-50 hover:text-sky-600"
                    aria-label="Đóng thông báo"
                >
                    <FiX size={16} />
                </button>
            </div>
        </motion.div>
    );
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
    }, []);

    const showToast = useCallback((message, type = "info") => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        setToasts((current) => [...current, { id, message, type }]);
        setTimeout(() => removeToast(id), 4000);
    }, [removeToast]);

    const toastApi = useMemo(
        () => ({
            success: (message) => showToast(message, "success"),
            error: (message) => showToast(message, "error"),
            warning: (message) => showToast(message, "warning"),
            warn: (message) => showToast(message, "warning"),
            info: (message) => showToast(message, "info"),
        }),
        [showToast]
    );

    return (
        <ToastContext.Provider value={toastApi}>
            {children}
            <div className="pointer-events-none fixed inset-x-0 top-4 z-[120] flex justify-center px-4 sm:justify-end sm:px-6">
                <div className="flex w-full max-w-sm flex-col gap-3">
                    <AnimatePresence>
                        {toasts.map((toast) => (
                            <ToastItem key={toast.id} toast={toast} onClose={removeToast} />
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </ToastContext.Provider>
    );
}
