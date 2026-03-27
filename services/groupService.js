// services/groupService.js
// HU-004 — Crear grupo  |  HU-005 — Unirse por código

import { USE_MOCK, apiRequest, delay } from "@/lib/api";
import { grupos } from "@/mocks/grupos";
import { miembrosGrupo } from "@/mocks/miembrosGrupo";
import { usuarios } from "@/mocks/usuarios";

const generarCodigo = () => Math.random().toString(36).substring(2, 8).toUpperCase();

const resolverGrupo = (grupo) => ({
  ...grupo,
  miembros: miembrosGrupo
    .filter((m) => m.grupoId === grupo.id)
    .map((m) => {
      const usuario = usuarios.find((u) => u.idUsuario === m.usuarioId);
      return { ...m, nombre: usuario?.nombre, correo: usuario?.correo, fotoPerfil: usuario?.fotoPerfil ?? null };
    }),
});

const mock = {
  crearGrupo: async ({ nombre, descripcion = "" }) => {
    await delay(600);
    return { id: grupos.length + 1, nombre, descripcion, codigoInvitacion: generarCodigo(), creadoEn: new Date().toISOString() };
  },

  unirseConCodigo: async (codigoInvitacion, usuarioId) => {
    await delay(600);
    const grupo = grupos.find((g) => g.codigoInvitacion === codigoInvitacion);
    if (!grupo) throw new Error("Código de invitación inválido o expirado.");
    if (miembrosGrupo.some((m) => m.grupoId === grupo.id && m.usuarioId === usuarioId))
      throw new Error("Ya eres miembro de este grupo.");
    return { mensaje: `Te uniste al grupo "${grupo.nombre}" exitosamente.`, grupo: { id: grupo.id, nombre: grupo.nombre } };
  },

  obtenerGrupo: async (grupoId) => {
    await delay(400);
    const grupo = grupos.find((g) => g.id === Number(grupoId));
    if (!grupo) throw new Error("Grupo no encontrado.");
    return resolverGrupo(grupo);
  },
};

const api = {
  crearGrupo:       (data, token)                  => apiRequest("/grupos",         { method: "POST", body: data }, token),
  unirseConCodigo:  (codigoInvitacion, _, token)   => apiRequest("/grupos/unirse",  { method: "POST", body: { codigoInvitacion } }, token),
  obtenerGrupo:     (grupoId, token)               => apiRequest(`/grupos/${grupoId}`, { method: "GET" }, token),
};

const groupService = USE_MOCK ? mock : api;
export default groupService;