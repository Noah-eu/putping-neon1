export const guard = (cond, fn) => cond ? fn() : undefined;
export const noop = () => {};
export const safe = (fn, fallback) => { try{ return fn() } catch { return fallback } };
