import { useState } from "react";

/**
 * useLocalStorage
 * Persiste estado en localStorage de forma reactiva.
 * Usado internamente por AuthContext para mantener sesión entre recargas.
 *
 * @param {string} key - Clave en localStorage
 * @param {*} initialValue - Valor inicial si no existe la clave
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
