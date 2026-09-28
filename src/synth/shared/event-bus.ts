type Handler<T> = (e: T) => void;

export class EventBus<E extends Record<string, unknown>> {
  private handlers = new Map<keyof E, Set<Handler<any>>>();

  on<K extends keyof E>(name: K, fn: Handler<E[K]>) {
    const set = this.handlers.get(name) ?? new Set<Handler<any>>();
    set.add(fn);
    this.handlers.set(name, set);
    return () => { set.delete(fn); };
  }

  emit<K extends keyof E>(name: K, e: E[K]) {
    this.handlers.get(name)?.forEach(fn => fn(e));
  }
}
