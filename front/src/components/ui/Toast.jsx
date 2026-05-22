import { useEffect, useState } from "react";
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";

const ICONS = {
  success: <CheckCircle size={18} className="text-green-500" />,
  error:   <XCircle    size={18} className="text-red-500" />,
  info:    <AlertCircle size={18} className="text-blue-500" />,
};

const BG = {
  success: "border-green-100",
  error:   "border-red-100",
  info:    "border-blue-100",
};

function Toast({ message, type = "success", onClose, duration = 3500 }) {
  useEffect(() => {
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [onClose, duration]);

  return (
    <div className={`flex items-start gap-3 rounded-xl border ${BG[type] || "border-gray-200"} bg-white px-4 py-3 shadow-lg`}>
      <span className="mt-0.5 flex-shrink-0">{ICONS[type]}</span>
      <p className="flex-1 text-sm text-gray-800">{message}</p>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
        <X size={15} />
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, removeToast }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-5 right-5 z-50 flex w-80 flex-col gap-2">
      {toasts.map((t) => (
        <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
      ))}
    </div>
  );
}

let _uid = 0;

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const add = (message, type = "success") => {
    const id = ++_uid;
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const remove = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return {
    toasts,
    removeToast: remove,
    success: (msg) => add(msg, "success"),
    error:   (msg) => add(msg, "error"),
    info:    (msg) => add(msg, "info"),
  };
}
