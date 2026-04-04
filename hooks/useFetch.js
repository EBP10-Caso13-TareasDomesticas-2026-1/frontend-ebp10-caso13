import { useState, useCallback } from "react";

/**
 * useFetch
 * Hook genérico para ejecutar llamadas a servicios con manejo de estado.
 * No ejecuta automáticamente — se llama manualmente con `execute()`.
 *
 * Uso básico:
 *   const { data, loading, error, execute } = useFetch(obtenerGrupo);
 *   await execute(grupoId, token);
 *
 * Uso con onSuccess / onError:
 *   const { execute } = useFetch(iniciarSesion, {
 *     onSuccess: (data) => router.push("/dashboard"),
 *     onError: (err) => console.error(err),
 *   });
 *
 * @param {Function} serviceFn - Función del servicio a ejecutar (desde /services/)
 * @param {Object} options
 * @param {Function} [options.onSuccess] - Callback al resolver exitosamente
 * @param {Function} [options.onError]   - Callback al rechazar
 */
export function useFetch(serviceFn, options = {}) {
  const { onSuccess, onError } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Ejecuta la función del servicio con los argumentos recibidos.
   * @param {...any} args - Argumentos que recibe la función del servicio
   * @returns {{ ok: boolean, data?: any, error?: string }}
   */
  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);

      try {
        const result = await serviceFn(...args);
        setData(result);
        onSuccess?.(result);
        return { ok: true, data: result };
      } catch (err) {
        const mensaje = err.message ?? "Ocurrió un error inesperado";
        setError(mensaje);
        onError?.(err); // pasas el error completo
        return { ok: false, error: mensaje, status: err.status };
      } finally {
        setLoading(false);
      }
    },
    [serviceFn, onSuccess, onError],
  );

  /** Resetea el estado completo (útil al desmontar o limpiar formularios) */
  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
}
