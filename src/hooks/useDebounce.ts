import { useState, useEffect } from "react";

/**
 * Custom hook that delays updating the returned value until after
 * the specified delay (in milliseconds) has elapsed since the last time
 * the value was modified.
 *
 * @param value The value to debounce
 * @param delayMs The delay in milliseconds (default: 500ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delayMs: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delayMs]);

  return debouncedValue;
}
