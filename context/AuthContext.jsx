"use client";

import { createContext, useContext, useCallback, useEffect, useState } from "react";
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
  const [isHydrated, setIsHydrated] = useState(false);

  // ─── Derivados ────────────────────────────────────────────────
  // isAuthenticated includes expiration check to prevent using stale tokens.
  // Tokens are validated on every render, so expired tokens are caught immediately.
  const isAuthenticated = !!sesion?.token && !isTokenExpired(sesion.token);
  const usuario = sesion
    ? {
        idUsuario: sesion.idUsuario,
        nombre: sesion.nombre,
        correo: sesion.correo,
      }
    : null;
  const token = sesion?.token ?? null;

  // ─── Effect: Hidratación del cliente ──────────────────────────
  // Why isHydrated? Next.js renders on server and client. Without this flag,
  // we'd redirect to /login on server (where localStorage is empty),
  // causing flash/hydration mismatch. We only redirect AFTER client mounts.
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // ─── Effect: Auto-logout on token expiry ──────────────────────
  // Why schedule a logout? Waiting until the user clicks something means
  // they could interact with the app after the token expires.
  // Proactive timeout logout ensures we invalidate the session at the exact moment it expires.
  useEffect(() => {
    if (!token) return;

    if (isTokenExpired(token)) {
      removeSesion();
      return;
    }

    const msUntilExpiry = getTimeUntilExpiry(token);
    if (msUntilExpiry === Infinity) return; // Token has no expiry

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
   * Logs in user and persists session to localStorage.
   * Why persist? Allows users to stay logged in across page reloads.
   * Why return token? LoginPage needs it to pass to cargarGrupo() immediately.
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
   * Logs out user: invalidates token on backend and clears localStorage.
   * Why try/finally? Even if backend logout fails (network error, server down),
   * we still clear the local session. Better to kick the user out than leave
   * a stale session in localStorage that could cause confusion.
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
    isHydrated, // Indica que el cliente se hidratró (sesión cargada desde localStorage)
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Export interno — usar siempre a través de useAuth
export { AuthContext };
