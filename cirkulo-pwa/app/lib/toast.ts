/**
 * Simple toast notification utility
 * Uses a lightweight approach with DOM manipulation for instant feedback
 * Can be upgraded to a library like sonner or react-hot-toast later
 */

type ToastType = "success" | "error" | "info" | "warning";

interface ToastOptions {
	duration?: number;
	position?: "top" | "bottom";
}

/**
 * Show a toast notification
 */
export function toast(
	message: string,
	type: ToastType = "info",
	options: ToastOptions = {}
) {
	const { duration = 3000, position = "bottom" } = options;

	// Create toast container if it doesn't exist
	let container = document.getElementById("toast-container");
	if (!container) {
		container = document.createElement("div");
		container.id = "toast-container";
		container.style.cssText = `
			position: fixed;
			${position === "top" ? "top: 1rem" : "bottom: 1rem"};
			right: 1rem;
			z-index: 9999;
			display: flex;
			flex-direction: column;
			gap: 0.5rem;
			pointer-events: none;
		`;
		document.body.appendChild(container);
	}

	// Create toast element
	const toastEl = document.createElement("div");
	toastEl.className = "toast";
	
	// Style based on type
	const colors = {
		success: "bg-green-500",
		error: "bg-red-500",
		warning: "bg-orange-500",
		info: "bg-blue-500",
	};

	const icons = {
		success: "✓",
		error: "✕",
		warning: "⚠",
		info: "ℹ",
	};

	toastEl.innerHTML = `
		<div class="${colors[type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] max-w-md" style="pointer-events: auto;">
			<span class="text-xl font-bold">${icons[type]}</span>
			<span class="flex-1 text-sm font-medium">${message}</span>
		</div>
	`;

	// Add animation
	toastEl.style.cssText = `
		animation: slideIn 0.3s ease-out;
		@keyframes slideIn {
			from {
				transform: translateX(100%);
				opacity: 0;
			}
			to {
				transform: translateX(0);
				opacity: 1;
			}
		}
	`;

	container.appendChild(toastEl);

	// Remove toast after duration
	setTimeout(() => {
		toastEl.style.animation = "slideOut 0.3s ease-out";
		setTimeout(() => {
			container?.removeChild(toastEl);
		}, 300);
	}, duration);
}

// Convenience methods
toast.success = (message: string, options?: ToastOptions) =>
	toast(message, "success", options);

toast.error = (message: string, options?: ToastOptions) =>
	toast(message, "error", options);

toast.warning = (message: string, options?: ToastOptions) =>
	toast(message, "warning", options);

toast.info = (message: string, options?: ToastOptions) =>
	toast(message, "info", options);
