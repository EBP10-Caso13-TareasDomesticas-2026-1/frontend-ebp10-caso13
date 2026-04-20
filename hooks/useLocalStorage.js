import { useState } from "react";

/**
 * useLocalStorage
 * Persists state to localStorage reactively, syncing React state with disk.
 * Used internally by AuthContext to persist sessions across page reloads.
 * 
 * Why check typeof window? Next.js does SSR. On the server, localStorage doesn't exist.
 * Without this check, we'd crash. The server-side render will use initialValue,
 * then the client will hydrate and load from localStorage.
 *
 * @param {string} key - localStorage key
 * @param {*} initialValue - Default value if key doesn't exist
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === "undefined") return initialValue;

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      // Permite pasar una función igual que useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);

      if (valueToStore === null || valueToStore === undefined) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`[useLocalStorage] Error escribiendo "${key}":`, error);
    }
  };

  const removeValue = () => {
    try {
      setStoredValue(null);
      window.localStorage.removeItem(key);
    } catch (error) {
      console.warn(`[useLocalStorage] Error eliminando "${key}":`, error);
    }
  };

  return [storedValue, setValue, removeValue];
}
