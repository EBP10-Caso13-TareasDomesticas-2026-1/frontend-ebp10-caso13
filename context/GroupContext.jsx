"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import groupService from "@/services/groupService";

/**
 * GroupContext
 * Maneja el grupo familiar activo del usuario autenticado.
 *
 * Estructura de `grupo`:
 * { id, nombre, descripcion, codigoInvitacion, creadoEn }
 *
 * Estructura de `miembros`:
 * [{ id, usuarioId, grupoId, rolId, puntaje, racha, fechaUnion }, ...]
 *
 * `rolActual`: "admin" | "miembro" | null
 */

const GroupContext = createContext(null);

export function GroupProvider({ children }) {
  const { usuario, token } = useAuth();

  const [grupo, setGrupo] = useState(null);
  const [miembros, setMiembros] = useState([]);
  const [rolActual, setRolActual] = useState(null); // "admin" | "miembro"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasTriedInitialLoad, setHasTriedInitialLoad] = useState(false);

  // ─── Helpers internos ─────────────────────────────────────────

  const clearGroupError = () => setError(null);

  /**
   * Determina el rol del usuario en el grupo a partir de la lista de miembros.
   * rolId === 1 → "admin", rolId === 2 → "miembro" (según seed de BD)
   */
  const determineUserRole = useCallback(
    (usuarioId, listaMiembros) => {
      if (!usuarioId || !Array.isArray(listaMiembros) || listaMiembros.length === 0) return null;
      const yo = listaMiembros.find((m) => m.usuarioId === usuarioId);
      if (!yo) return null;
      
      if (yo.rol?.nombre === 'ADMINISTRADOR') {
        return "admin";
      }
      
      return "miembro";
    },
    [],
  );

  // ─── Acciones ─────────────────────────────────────────────────

  /**
   * Carga el grupo al que pertenece el usuario autenticado.
   * Se llama al montar pantallas que necesitan datos del grupo.
   * @returns {{ ok: boolean, error?: string }}
   */
  const cargarGrupo = useCallback(
    async (usuarioIdParam, tokenParam) => {
      const usuarioId = usuarioIdParam ?? usuario?.idUsuario;
      const tokenUser = tokenParam ?? token;
      if (!usuarioId || !tokenUser)
        return { ok: false, error: "Sin sesión activa" };
      clearGroupError();
      setLoading(true);
      try {
        // Devuelve el MiembroGrupo si el usuario pertenece a un grupo
        const miembroData = await groupService.obtenerGrupoDeUsuario(
          usuarioId,
          tokenUser,
        );

        if (!miembroData) {
          // Escenario 6: sin grupo asignado
          setGrupo(null);
          setMiembros([]);
          setRolActual(null);
          return { ok: false, noGrupo: true };
        }

        // Con el grupoId obtenemos el detalle completo del grupo
        const grupoData = await groupService.obtenerGrupo(
          miembroData.grupoId,
          tokenUser,
        );

        setGrupo(grupoData);
        setMiembros(grupoData.miembros);
        const rolCalculado = determineUserRole(usuarioId, grupoData.miembros);
        setRolActual(rolCalculado);
        return { ok: true };
      } catch (err) {
        const mensaje = err.message ?? "Error al cargar el grupo";
        setError(mensaje);
        return { ok: false, error: mensaje };
      } finally {
        setLoading(false);
      }
    },
    [usuario, token, determineUserRole]
  );

  /**
   * Crea un nuevo grupo familiar. El usuario queda como administrador.
   * @param {{ nombre, descripcion }} data
   * @returns {{ ok: boolean, grupo?: object, error?: string }}
   */
  const crearNuevoGrupo = useCallback(
    async (data) => {
      if (!usuario || !token) return { ok: false, error: "Sin sesión activa" };
      clearGroupError();
      setLoading(true);
      try {
        const grupoCreado = await groupService.crearGrupo(
          data,
          token,
          usuario.idUsuario,
        );
        setGrupo(grupoCreado);
        setRolActual("admin");
        setMiembros([]);
        return { ok: true, grupo: grupoCreado };
      } catch (err) {
        const mensaje = err.message ?? "Error al crear el grupo";
        setError(mensaje);
        return { ok: false, error: mensaje };
      } finally {
        setLoading(false);
      }
    },
    [usuario, token],
  );

  /**
   * Une al usuario a un grupo existente mediante código de invitación.
   * @param {string} codigoInvitacion
   * @returns {{ ok: boolean, error?: string }}
   */
  const unirseAlGrupo = useCallback(
    async (codigoInvitacion) => {
      if (!usuario || !token) return { ok: false, error: "Sin sesión activa" };
      clearGroupError();
      setLoading(true);
      try {
        const miembroData = await groupService.unirseConCodigo(
          codigoInvitacion,
          token,
          usuario.idUsuario,
        );
        const grupoId = miembroData.idGrupo || miembroData.grupoId;
        const grupoData = await groupService.obtenerGrupo(
          grupoId,
          token,
        );
        setGrupo(grupoData);
        setMiembros(grupoData.miembros);
        const rolCalculado = determineUserRole(usuario.idUsuario, grupoData.miembros);
        setRolActual(rolCalculado);
        return { ok: true };
      } catch (err) {
        const mensaje = err.message ?? "Código de invitación inválido";
        setError(mensaje);
        return { ok: false, error: mensaje };
      } finally {
        setLoading(false);
      }
    },
    [usuario, token, determineUserRole],
  );

  /**
   * Limpia el estado del grupo (usado al cerrar sesión).
   */
  const limpiarGrupo = useCallback(() => {
    setGrupo(null);
    setMiembros([]);
    setRolActual(null);
    setError(null);
  }, []);

  // ─── Disparador automático de carga ───────────────────────────
  // Si tenemos sesión activa pero el grupo está en null y aún no intentamos
  // cargarlo, disparar la carga automáticamente (útil para el F5).
  useEffect(() => {
    if (usuario?.idUsuario && token && !grupo && !hasTriedInitialLoad && !loading) {
      cargarGrupo(usuario.idUsuario, token).then(() => {
        setHasTriedInitialLoad(true);
      });
    }
  }, [usuario?.idUsuario, token, grupo, hasTriedInitialLoad, loading, cargarGrupo]);

  // ─── Valor del contexto ───────────────────────────────────────
  const value = {
    grupo, // objeto grupo | null
    miembros, // array de MiembroGrupo
    rolActual, // "admin" | "miembro" | null
    loading,
    error,
    cargarGrupo,
    crearGrupo: crearNuevoGrupo,
    unirseAlGrupo,
    limpiarGrupo,
  };

  return (
    <GroupContext.Provider value={value}>{children}</GroupContext.Provider>
  );
}

export { GroupContext };
