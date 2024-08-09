export class EventEmitter {
  constructor() {
    this.events = new Map()
  }

  on(event, listener) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event).add(listener);
  }

  emit(event, ...args) {
    if (!this.events.has(event)) {
      return;
    }
    this.events.get(event).forEach(listener => listener(...args));
  }

  off(event, listener) {
    if (!this.events.has(event)) {
      return;
    }
    this.events.get(event).delete(listener);
    if (this.events.get(event).size === 0) {
      this.events.delete(event);
    }
  }

  once(event, listener) {
    const onceListener = (...args) => {
      listener(...args);
      this.off(event, onceListener);
    }
    this.on(event, onceListener);
  }
}
