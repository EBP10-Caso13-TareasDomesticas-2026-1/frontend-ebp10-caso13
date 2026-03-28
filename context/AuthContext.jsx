"use client";

import { createContext, useContext, useCallback } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import authService from "@/services/authService";

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
  const [sesion, setSesion, removeSesion] = useLocalStorage("homesync_sesion", null);

  // ─── Derivados ────────────────────────────────────────────────
  const isAuthenticated = !!sesion?.token;
  const usuario = sesion
    ? { idUsuario: sesion.idUsuario, nombre: sesion.nombre, correo: sesion.correo }
    : null;
  const token = sesion?.token ?? null;

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
   * @returns {{ ok: boolean, error?: string }}
   */
  const login = useCallback(async (data) => {
    try {
      const respuesta = await authService.iniciarSesion(data);
      // respuesta esperada: { idUsuario, nombre, correo, token, mensaje }
      setSesion({
        token: respuesta.token,
        idUsuario: respuesta.idUsuario,
        nombre: respuesta.nombre,
        correo: respuesta.correo,
      });
      return { ok: true };
    } catch (error) {
      return { ok: false, error: error.message ?? "Credenciales incorrectas" };
    }
  }, [setSesion]);

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
      console.warn("[AuthContext] Error al cerrar sesión en el servidor:", error);
    } finally {
      removeSesion();
    }
    return { ok: true };
  }, [token, removeSesion]);

  // ─── Valor del contexto ───────────────────────────────────────
  const value = {
    usuario,       // { idUsuario, nombre, correo } | null
    token,         // string | null
    isAuthenticated,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Export interno — usar siempre a través de useAuth
export { AuthContext };