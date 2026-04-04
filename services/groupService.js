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

const mock = {
  // HU-002 escenario 6 / HU-004 escenario 4
  async obtenerGrupoDeUsuario(usuarioId, token) {
    return miembrosGrupo.find((m) => m.usuarioId === usuarioId) || null;
  },

  // HU-004
  crearGrupo: async (data, _token, usuarioId) => {
  await delay(600);
  if (!usuarioId) throw new Error("Usuario no identificado.");
  // Quita el check yaTieneGrupo — el backend lo valida
  const { nombre, descripcion = "" } = data;
  const nuevoGrupo = {
    id: grupos.length + 1,
    nombre,
    descripcion,
    codigoInvitacion: generarCodigo(),
    creadoEn: new Date().toISOString(),
  };
  grupos.push(nuevoGrupo);
  miembrosGrupo.push({
    id: miembrosGrupo.length + 1,
    usuarioId,
    grupoId: nuevoGrupo.id,
    rolId: 1,  // Admin
    puntaje: 0,
    racha: 0,
    fechaUnion: new Date().toISOString(),
  });
  return nuevoGrupo;
},

  // HU-005
  unirseConCodigo: async (codigoInvitacion, _token, usuarioId) => {
  await delay(600);
  if (!usuarioId) throw new Error("Usuario no identificado.");
  // Quita checks — el backend los maneja
  const grupo = grupos.find((g) => g.codigoInvitacion === codigoInvitacion);
  if (!grupo) throw new Error("Código inválido o expirado...");
  const nuevaMembresia = {
    id: miembrosGrupo.length + 1,
    usuarioId,
    grupoId: grupo.id,
    rolId: 2,  // Miembro
    puntaje: 0,
    racha: 0,
    fechaUnion: new Date().toISOString(),
  };
  miembrosGrupo.push(nuevaMembresia);
  return nuevaMembresia;
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
  async obtenerGrupoDeUsuario(usuarioId, token) {
    const miembros = await apiRequest("/miembros-grupo", { method: "GET" }, token);
    const membresia = miembros.find(m => m.usuarioId === usuarioId);
    return membresia || null;  // Devuelve la membresía si existe
  },

  async crearGrupo(data, token, usuarioId) {
  if (!usuarioId) throw new Error("Usuario no identificado.");

  return apiRequest(
    "/grupos",
    {
      method: "POST",
      body: {
        nombre: data.nombre,
        idUsuario: usuarioId, // IMPORTANTE
      },
    },
    token
  );
},

  async unirseConCodigo(codigoInvitacion, token, usuarioId) {
  if (!usuarioId) throw new Error("Usuario no identificado.");

  return apiRequest(
    "/miembros-grupo",
    {
      method: "POST",
      body: {
        idUsuario: usuarioId,
        codigoInvitacion,
      },
    },
    token
  );
},

  async obtenerGrupo(grupoId, token) {
    const [grupos, miembros, usuarios] = await Promise.all([
      apiRequest("/grupos", { method: "GET" }, token),
      apiRequest("/miembros-grupo", { method: "GET" }, token),
      apiRequest("/usuarios", { method: "GET" }, token),
    ]);

    const grupo = grupos.find(g => g.id === Number(grupoId));
    if (!grupo) throw new Error("Grupo no encontrado.");

    return {
      ...grupo,
      miembros: miembros
        .filter(m => m.grupoId === grupo.id)
        .map(m => {
          const usuario = usuarios.find(u => u.id === m.usuarioId);
          return {
            ...m,
            nombre: usuario?.nombre,
            correo: usuario?.correo,
          };
        }),
    };
  },
};

const groupService = USE_MOCK ? mock : api;
export default groupService;