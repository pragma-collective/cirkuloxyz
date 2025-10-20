// Simple event emitter for auth events
type AuthEventListener = () => void;

class AuthEvents {
	private listeners: Map<string, AuthEventListener[]> = new Map();

	on(event: string, listener: AuthEventListener) {
		if (!this.listeners.has(event)) {
			this.listeners.set(event, []);
		}
		this.listeners.get(event)!.push(listener);
	}

	off(event: string, listener: AuthEventListener) {
		const eventListeners = this.listeners.get(event);
		if (eventListeners) {
			const index = eventListeners.indexOf(listener);
			if (index > -1) {
				eventListeners.splice(index, 1);
			}
		}
	}

	emit(event: string) {
		const eventListeners = this.listeners.get(event);
		if (eventListeners) {
			eventListeners.forEach((listener) => listener());
		}
	}
}

export const authEvents = new AuthEvents();
