/**
 * Clarity's canonical API is window.clarity("set", key, value).
 * This helper waits until window.clarity exists (after Clarity.init() and script load)
 * before running tag/identify/event calls, so setTag never runs before init.
 */

export type ClarityFn = (command: string, ...args: unknown[]) => void;

export function claritySafe(
  fn: (clarity: ClarityFn) => void,
  timeoutMs = 3000
): void {
  if (typeof window === 'undefined') return;

  const start = Date.now();

  const tick = (): void => {
    const c = (window as Window & { clarity?: ClarityFn }).clarity;

    if (typeof c === 'function') {
      fn(c);
      return;
    }

    if (Date.now() - start < timeoutMs) {
      requestAnimationFrame(tick);
    }
  };

  tick();
}
