"use client";

import { createContext, useContext, useCallback, useEffect } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import authService from "@/services/authService";
import { isTokenExpired, getTimeUntilExpiry } from "@/lib/jwt";

/**
 * AuthContext
 * Maneja la sesión del usuario: token, datos básicos, login, logout y registro.
 *
 * Estructura guardada en localStorage (clave "homesync_sesion"):
 * {
 *   token: string,
 *   idUsuario: number,
 *   nombre: string,
 *   correo: string
 * }
 */

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [sesion, setSesion, removeSesion] = useLocalStorage(
    "homesync_sesion",
    null,
  );

  // ─── Derivados ────────────────────────────────────────────────
  // Incluye validación de expiración
  const isAuthenticated = !!sesion?.token && !isTokenExpired(sesion.token);
  const usuario = sesion
    ? {
        idUsuario: sesion.idUsuario,
        nombre: sesion.nombre,
        correo: sesion.correo,
      }
    : null;
  const token = sesion?.token ?? null;

  // ─── Effect: Logout si token expirado ──────────────────────────
  useEffect(() => {
    if (!token) return;

    // Si token ya expiró, limpiar inmediatamente
    if (isTokenExpired(token)) {
      removeSesion();
      return;
    }

    // Obtener tiempo hasta expiración
    const msUntilExpiry = getTimeUntilExpiry(token);

    // Si token no tiene expiration, no hacer nada
    if (msUntilExpiry === Infinity) return;

    // Setup timeout para cuando expire
    const timeoutId = setTimeout(() => {
      removeSesion();
    }, msUntilExpiry);

    return () => clearTimeout(timeoutId);
  }, [token, removeSesion]);

  // ─── Acciones ─────────────────────────────────────────────────

  /**
   * Registra un nuevo usuario.
   * @param {{ nombre, correo, contrasena, pinSeguridad, telefono }} data
   * @returns {{ ok: boolean, error?: string }}
   */
  const register = useCallback(async (data) => {
    try {
      await authService.registrarUsuario(data);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: error.message ?? "Error al registrarse" };
    }
  }, []);

  /**
   * Inicia sesión y persiste la sesión en localStorage.
   * @param {{ correo, contrasena }} data
   * @returns {{ ok: true, idUsuario: number, token: string } | { ok: false, error: string }}
   */
  const login = useCallback(
    async (data) => {
      try {
        const respuesta = await authService.iniciarSesion(data);
        setSesion({
          token: respuesta.token,
          idUsuario: respuesta.idUsuario,
          nombre: respuesta.nombre,
          correo: respuesta.correo,
        });
        // Devuelve la data para que el LoginPage la use
        return {
          ok: true,
          idUsuario: respuesta.idUsuario,
          token: respuesta.token,
        };
      } catch (error) {
        return {
          ok: false,
          error: error.message ?? "Credenciales incorrectas",
        };
      }
    },
    [setSesion],
  );

  /**
   * Cierra sesión: invalida el token en el backend y limpia localStorage.
   * @returns {{ ok: boolean, error?: string }}
   */
  const logout = useCallback(async () => {
    try {
      if (token) {
        await authService.cerrarSesion(token);
      }
    } catch (error) {
      // Aunque falle el backend, limpiamos la sesión local igual
      console.warn(
        "[AuthContext] Error al cerrar sesión en el servidor:",
        error,
      );
    } finally {
      removeSesion();
    }
    return { ok: true };
  }, [token, removeSesion]);

  // ─── Valor del contexto ───────────────────────────────────────
  const value = {
    usuario, // { idUsuario, nombre, correo } | null
    token, // string | null
    isAuthenticated,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Export interno — usar siempre a través de useAuth
export { AuthContext };
