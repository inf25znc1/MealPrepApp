import { useEffect, useRef } from 'react';

/** Pass `null` to skip writing (e.g. until localStorage has been loaded). */
export function useDebouncedStorage<T>(
  key: string,
  value: T | null,
  delayMs = 300,
): void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (value === null) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        // quota or private mode — ignore
      }
    }, delayMs);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [key, value, delayMs]);
}
