// services/groupService.js
// HU-002 escenario 6 — Redirigir según si el usuario tiene grupo tras login
// HU-004             — Crear grupo familiar
// HU-005             — Unirse por código de invitación

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

// Firma pública uniforme para mock y api:
//   obtenerGrupoDeUsuario(usuarioId, token)
//   crearGrupo(data, token)
//   unirseConCodigo(codigoInvitacion, token)
//   obtenerGrupo(grupoId, token)
//
// El mock recibe usuarioId como primer argumento cuando lo necesita.
// La api real lo ignora porque el backend identifica al usuario por el token JWT.
// Las pantallas siempre llaman con la misma firma — nunca cambian.

// Usuario simulado activo en modo mock (refleja lo que vendría del AuthContext)
const MOCK_USUARIO_ACTIVO_ID = 4; // David Sanchez — no pertenece a ningún grupo aún

const mock = {
  // HU-002 escenario 6 / HU-004 escenario 4
  obtenerGrupoDeUsuario: async (usuarioId, _token) => {
    await delay(400);
    const membresia = miembrosGrupo.find((m) => m.usuarioId === usuarioId);
    if (!membresia) return null;
    const grupo = grupos.find((g) => g.id === membresia.grupoId);
    return grupo ? { ...resolverGrupo(grupo), rolId: membresia.rolId } : null;
  },

  // HU-004
  crearGrupo: async (data, _token) => {
    await delay(600);
    const yaTieneGrupo = miembrosGrupo.some((m) => m.usuarioId === MOCK_USUARIO_ACTIVO_ID);
    if (yaTieneGrupo) throw new Error("Ya perteneces a un grupo familiar. Debes abandonar o eliminar tu grupo actual para poder crear uno nuevo.");
    const { nombre, descripcion = "" } = data;
    return { id: grupos.length + 1, nombre, descripcion, codigoInvitacion: generarCodigo(), creadoEn: new Date().toISOString() };
  },

  // HU-005
  unirseConCodigo: async (codigoInvitacion, _token) => {
    await delay(600);
    const yaTieneGrupo = miembrosGrupo.some((m) => m.usuarioId === MOCK_USUARIO_ACTIVO_ID);
    if (yaTieneGrupo) throw new Error("Ya formas parte de un hogar. Debes abandonar tu grupo actual en tu perfil para poder unirte a uno nuevo.");
    const grupo = grupos.find((g) => g.codigoInvitacion === codigoInvitacion);
    if (!grupo) throw new Error("Código inválido o expirado. Por favor, verifica con el administrador de tu grupo.");
    return { mensaje: `¡Bienvenido al grupo ${grupo.nombre}!`, grupo: { id: grupo.id, nombre: grupo.nombre } };
  },

  // HU-004 / HU-005
  obtenerGrupo: async (grupoId, _token) => {
    await delay(400);
    const grupo = grupos.find((g) => g.id === Number(grupoId));
    if (!grupo) throw new Error("Grupo no encontrado.");
    return resolverGrupo(grupo);
  },
};

const api = {
  obtenerGrupoDeUsuario: (usuarioId, token)       => apiRequest(`/miembros-grupo/usuario/${usuarioId}`, { method: "GET" }, token),
  crearGrupo:            (data, token)            => apiRequest("/grupos",                              { method: "POST", body: data }, token),
  unirseConCodigo:       (codigoInvitacion, token)=> apiRequest("/grupos/unirse",                      { method: "POST", body: { codigoInvitacion } }, token),
  obtenerGrupo:          (grupoId, token)         => apiRequest(`/grupos/${grupoId}`,                  { method: "GET" }, token),
};

const groupService = USE_MOCK ? mock : api;
export default groupService;