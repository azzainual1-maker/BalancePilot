"use client";

import { useCallback, useEffect, useState } from "react";

type Parser<T> = (value: unknown) => T;

export function useLocalStorage<T>(key: string, fallback: T, parser?: Parser<T>) {
  const [value, setValue] = useState<T>(fallback);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const rawValue = window.localStorage.getItem(key);

      if (rawValue === null) {
        setValue(fallback);
      } else {
        const parsed = JSON.parse(rawValue);
        setValue(parser ? parser(parsed) : (parsed as T));
      }
    } catch {
      window.localStorage.removeItem(key);
      setValue(fallback);
    } finally {
      setIsReady(true);
    }
  }, [fallback, key, parser]);

  const updateValue = useCallback(
    (nextValue: T | ((current: T) => T)) => {
      setValue((current) => {
        const resolved =
          typeof nextValue === "function"
            ? (nextValue as (current: T) => T)(current)
            : nextValue;

        window.localStorage.setItem(key, JSON.stringify(resolved));
        return resolved;
      });
    },
    [key],
  );

  const clearValue = useCallback(() => {
    window.localStorage.removeItem(key);
    setValue(fallback);
  }, [fallback, key]);

  return [value, updateValue, clearValue, isReady] as const;
}
