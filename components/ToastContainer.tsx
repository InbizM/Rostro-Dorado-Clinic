import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastProps {
    toast: Toast;
    onClose: (id: string) => void;
}

const ToastItem: React.FC<ToastProps> = ({ toast, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(toast.id);
        }, 4000);

        return () => clearTimeout(timer);
    }, [toast.id, onClose]);

    const icons = {
        success: <CheckCircle size={24} />,
        error: <XCircle size={24} />,
        info: <Info size={24} />
    };

    const colors = {
        success: 'bg-green-500/20 border-green-500/50 text-green-100',
        error: 'bg-red-500/20 border-red-500/50 text-red-100',
        info: 'bg-blue-500/20 border-blue-500/50 text-blue-100'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            className={`flex items-center gap-3 px-6 py-4 rounded-xl border backdrop-blur-sm shadow-2xl min-w-[300px] ${colors[toast.type]}`}
        >
            <div className="flex-shrink-0">
                {icons[toast.type]}
            </div>
            <p className="flex-1 font-medium">{toast.message}</p>
            <button
                onClick={() => onClose(toast.id)}
                className="flex-shrink-0 hover:opacity-70 transition-opacity"
            >
                <X size={18} />
            </button>
        </motion.div>
    );
};

let toastCounter = 0;
let addToastCallback: ((message: string, type: ToastType) => void) | null = null;

export const showToast = (message: string, type: ToastType = 'info') => {
    if (addToastCallback) {
        addToastCallback(message, type);
    }
};

const ToastContainer: React.FC = () => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    useEffect(() => {
        addToastCallback = (message: string, type: ToastType) => {
            const id = `toast-${toastCounter++}`;
            setToasts(prev => [...prev, { id, message, type }]);
        };

        return () => {
            addToastCallback = null;
        };
    }, []);

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <div
            className="fixed top-4 right-4 flex flex-col gap-3 pointer-events-none"
            style={{ zIndex: 2147483646 }} // Above everything, below cursor
        >
            <AnimatePresence>
                {toasts.map(toast => (
                    <div className="pointer-events-auto" key={toast.id}>
                        <ToastItem toast={toast} onClose={removeToast} />
                    </div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default ToastContainer;
