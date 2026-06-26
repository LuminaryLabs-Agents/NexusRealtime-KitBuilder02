export class TinyEventEmitter {
  #listeners = new Map();

  on(type, listener) {
    const listeners = this.#listeners.get(type) ?? new Set();
    listeners.add(listener);
    this.#listeners.set(type, listeners);
    return () => listeners.delete(listener);
  }

  emit(type, payload) {
    const listeners = this.#listeners.get(type);
    if (!listeners) return;
    for (const listener of [...listeners]) listener(payload);
  }
}
