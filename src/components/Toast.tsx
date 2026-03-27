import { createContext, useCallback, useContext, useState } from "react";

interface ToastData {
	id: number;
	type: "success" | "error" | "info";
	message: string;
	exiting?: boolean;
}

interface ToastContextType {
	showToast: (type: ToastData["type"], message: string) => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export function useToast() {
	return useContext(ToastContext);
}

let nextId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
	const [toasts, setToasts] = useState<ToastData[]>([]);

	const showToast = useCallback((type: ToastData["type"], message: string) => {
		const id = nextId++;
		setToasts((prev) => [...prev, { id, type, message }]);

		setTimeout(() => {
			setToasts((prev) =>
				prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)),
			);
			setTimeout(() => {
				setToasts((prev) => prev.filter((t) => t.id !== id));
			}, 300);
		}, 3000);
	}, []);

	const removeToast = useCallback((id: number) => {
		setToasts((prev) =>
			prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)),
		);
		setTimeout(() => {
			setToasts((prev) => prev.filter((t) => t.id !== id));
		}, 300);
	}, []);

	const icons: Record<ToastData["type"], string> = {
		success: "✓",
		error: "✕",
		info: "ℹ",
	};

	return (
		<ToastContext.Provider value={{ showToast }}>
			{children}
			<div className="toast-container">
				{toasts.map((toast) => (
					<div
						key={toast.id}
						className={`toast toast-${toast.type} ${toast.exiting ? "exiting" : ""}`}
					>
						<span className="toast-icon">{icons[toast.type]}</span>
						<span>{toast.message}</span>
						<button
							type="button"
							className="toast-close"
							onClick={() => removeToast(toast.id)}
						>
							✕
						</button>
					</div>
				))}
			</div>
		</ToastContext.Provider>
	);
}
