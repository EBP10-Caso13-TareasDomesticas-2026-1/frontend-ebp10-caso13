import { useState, useEffect, useCallback } from "react";

/**
 * useRateLimit
 * Hook para manejar rate limiting con countdown en tiempo real
 * 
 * @param {number} maxIntentos - Máximo número de intentos permitidos
 * @param {number} ventanaMinutos - Ventana de tiempo en minutos
 * @param {number} bloqueoMinutos - Duración del bloqueo en minutos
 * @param {string} storageKeyIntentos - Clave localStorage para intentos
 * @param {string} storageKeyBloqueo - Clave localStorage para bloqueo
 * 
 * @returns {object} { bloqueado, bloqueoHasta, registrarIntento, limpiarIntentos, formatearTiempo }
 */
export function useRateLimit(
  maxIntentos = 10,
  ventanaMinutos = 5,
  bloqueoMinutos = 15,
  storageKeyIntentos = "hs_rate_intentos",
  storageKeyBloqueo = "hs_rate_bloqueo_hasta"
) {
  const [bloqueado, setBloqueado] = useState(false);
  const [bloqueoHasta, setBloqueoHasta] = useState(null);
  const [tick, setTick] = useState(0); // Fuerza re-render cada segundo

  const TIEMPO_VENTANA_MS = ventanaMinutos * 60 * 1000;
  const TIEMPO_BLOQUEO_MS = bloqueoMinutos * 60 * 1000;

  /**
   * Verifica el estado actual del bloqueo desde localStorage
   */
  const verificarEstadoBloqueo = useCallback(() => {
    try {
      const bloqueoHastaStr = localStorage.getItem(storageKeyBloqueo);
      if (bloqueoHastaStr) {
        const bloqueoHastaTime = parseInt(bloqueoHastaStr, 10);
        const ahora = Date.now();
        if (ahora < bloqueoHastaTime) {
          setBloqueado(true);
          setBloqueoHasta(bloqueoHastaTime);
          return true;
        } else {
          localStorage.removeItem(storageKeyBloqueo);
          localStorage.removeItem(storageKeyIntentos);
          setBloqueado(false);
          setBloqueoHasta(null);
        }
      }
      setBloqueado(false);
      setBloqueoHasta(null);
      return false;
    } catch {
      return false;
    }
  }, [storageKeyBloqueo, storageKeyIntentos]);

  /**
   * Registra un intento fallido
   * @returns {boolean} true si ahora está bloqueado
   */
  const registrarIntento = useCallback(() => {
    try {
      const ahora = Date.now();
      const intentosStr = localStorage.getItem(storageKeyIntentos);
      let intentosData = { count: 0, desde: ahora };

      if (intentosStr) {
        try {
          intentosData = JSON.parse(intentosStr);
        } catch {
          localStorage.removeItem(storageKeyIntentos);
          intentosData = { count: 0, desde: ahora };
        }
      }

      if (
        !intentosData ||
        typeof intentosData.count !== "number" ||
        typeof intentosData.desde !== "number"
      ) {
        intentosData = { count: 0, desde: ahora };
      }

      // Limpiar si la ventana de tiempo ya pasó
      if (ahora - intentosData.desde > TIEMPO_VENTANA_MS) {
        intentosData.count = 0;
        intentosData.desde = ahora;
      }

      intentosData.count++;
      localStorage.setItem(storageKeyIntentos, JSON.stringify(intentosData));

      if (intentosData.count >= maxIntentos) {
        const bloqueoHastaTime = ahora + TIEMPO_BLOQUEO_MS;
        localStorage.setItem(storageKeyBloqueo, String(bloqueoHastaTime));
        setBloqueado(true);
        setBloqueoHasta(bloqueoHastaTime);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [
    storageKeyIntentos,
    storageKeyBloqueo,
    maxIntentos,
    TIEMPO_VENTANA_MS,
    TIEMPO_BLOQUEO_MS,
  ]);

  /**
   * Limpia los intentos y el bloqueo
   */
  const limpiarIntentos = useCallback(() => {
    try {
      localStorage.removeItem(storageKeyIntentos);
      localStorage.removeItem(storageKeyBloqueo);
      setBloqueado(false);
      setBloqueoHasta(null);
    } catch {
      // Silently fail
    }
  }, [storageKeyIntentos, storageKeyBloqueo]);

  /**
   * Formatea el tiempo restante de bloqueo
   */
  const formatearTiempo = useCallback((hasta) => {
    const diff = Math.max(0, hasta - Date.now());
    const minutos = Math.floor(diff / 60000);
    const segundos = Math.floor((diff % 60000) / 1000);
    return `${minutos}:${String(segundos).padStart(2, "0")}`;
  }, []);

  // Verificar bloqueo al montar
  useEffect(() => {
    verificarEstadoBloqueo();
  }, [verificarEstadoBloqueo]);

  // Actualizar countdown cada segundo
  useEffect(() => {
    if (!bloqueado || !bloqueoHasta) return;

    const intervalo = setInterval(() => {
      const ahora = Date.now();
      if (ahora >= bloqueoHasta) {
        // Bloqueo expiró
        setBloqueado(false);
        setBloqueoHasta(null);
        limpiarIntentos();
        clearInterval(intervalo);
      } else {
        // Forzar actualización del componente incrementando tick
        setTick((prev) => prev + 1);
      }
    }, 1000);

    return () => clearInterval(intervalo);
  }, [bloqueado, bloqueoHasta, limpiarIntentos]);

  return {
    bloqueado,
    bloqueoHasta,
    registrarIntento,
    limpiarIntentos,
    formatearTiempo,
    verificarEstadoBloqueo,
    tick, // Fuerza re-renders cada segundo mientras está bloqueado
  };
}
