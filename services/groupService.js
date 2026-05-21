// services/groupService.js
// HU-002 escenario 6 — Redirigir según si el usuario tiene grupo tras login
// HU-004             — Crear grupo familiar
// HU-005             — Unirse por código de invitación

import { USE_MOCK, apiRequest, delay } from "@/lib/api";
import { grupos } from "@/mocks/grupos";
import { miembrosGrupo } from "@/mocks/miembrosGrupo";
import { usuarios } from "@/mocks/usuarios";
import { tareas } from "@/mocks/tareas";

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
//   crearGrupo(data, token, usuarioId)
//   unirseConCodigo(codigoInvitacion, token, usuarioId)
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

  // HUS-024 — Eliminar miembro del grupo
  async eliminarMiembro(idMiembroGrupo, _token) {
    await delay(600);
    const miembro = miembrosGrupo.find((m) => m.id === Number(idMiembroGrupo));
    if (!miembro) throw new Error("Miembro no encontrado.");

    // Validar que no tiene tareas PENDIENTE, EN_PROGRESO o VENCIDA dentro del mismo grupo
    const tareasActivas = tareas.filter(
      (t) =>
        t.idUsuarioAsignado === miembro.usuarioId &&
        t.idGrupo === miembro.grupoId &&
        (t.estado === "PENDIENTE" || t.estado === "EN_PROGRESO" || t.estado === "VENCIDA") &&
        t.eliminada !== true
    );

    if (tareasActivas.length > 0) {
      throw new Error("El miembro tiene tareas pendientes. Completa o reasigna antes de eliminar.");
    }

    // Remover del array
    const index = miembrosGrupo.indexOf(miembro);
    miembrosGrupo.splice(index, 1);

    return { mensaje: "Miembro eliminado exitosamente." };
  },

  // HU-025 — Abandonar grupo
  // Flujo 1: Miembro normal (sin nuevo admin) → solo DELETE
  // Flujo 2: Admin con delegación (con nuevo admin) → PUT (cambiar rol) + DELETE
  async abandonarGrupo(idMiembroGrupo, idMiembroNuevoAdmin, _token) {
    await delay(600);
    const miembroAbandonar = miembrosGrupo.find((m) => m.id === Number(idMiembroGrupo));
    if (!miembroAbandonar) throw new Error("Miembro no encontrado.");

    // Validación común: verificar tareas activas
    const tareasActivas = tareas.filter(
      (t) =>
        t.idUsuarioAsignado === miembroAbandonar.usuarioId &&
        (t.estado === "PENDIENTE" || t.estado === "EN_PROGRESO" || t.estado === "VENCIDA") &&
        t.eliminada !== true
    );
    if (tareasActivas.length > 0) {
      throw new Error("Tienes tareas pendientes. Completa o reasigna antes de abandonar.");
    }

    // FLUJO 1: Miembro normal abandona (sin delegación)
    if (!idMiembroNuevoAdmin) {
      if (miembroAbandonar.rolId === 1) {
        const otrosMiembros = miembrosGrupo.filter(
          (m) => m.grupoId === miembroAbandonar.grupoId && m.id !== miembroAbandonar.id
        );
        if (otrosMiembros.length > 0) {
          throw new Error("Debes delegar el rol de administrador antes de abandonar el grupo.");
        }
      }
      const index = miembrosGrupo.indexOf(miembroAbandonar);
      miembrosGrupo.splice(index, 1);
      return { mensaje: "Has abandonado el grupo exitosamente." };
    }

    // FLUJO 2: Admin abandona con delegación obligatoria
    if (miembroAbandonar.rolId !== 1) {
      throw new Error("Solo administradores pueden delegar el rol. Usa abandonarGrupo sin nuevo admin para salir.");
    }

    const miembroNuevoAdmin = miembrosGrupo.find((m) => m.id === Number(idMiembroNuevoAdmin));
    if (!miembroNuevoAdmin) throw new Error("Nuevo administrador no encontrado.");
    if (miembroNuevoAdmin.grupoId !== miembroAbandonar.grupoId) {
      throw new Error("El nuevo administrador debe estar en el mismo grupo.");
    }
    if (miembroNuevoAdmin.id === miembroAbandonar.id) {
      throw new Error("No puedes designarte a ti mismo como nuevo admin.");
    }

    // Cambiar rol del nuevo admin a 1 (admin)
    miembroNuevoAdmin.rolId = 1;

    // Remover al admin antiguo
    const index = miembrosGrupo.indexOf(miembroAbandonar);
    miembrosGrupo.splice(index, 1);

    return { mensaje: "Has designado nuevo administrador y abandonado el grupo exitosamente." };
  },

  // HU-032 — Obtener ranking del grupo
  async obtenerRanking(idGrupo, _token) {
    await delay(400);
    const grupoId = Number(idGrupo);
    
    // Filtrar miembros del grupo
    const miembrosDelGrupo = miembrosGrupo.filter((m) => m.grupoId === grupoId);
    if (miembrosDelGrupo.length === 0) throw new Error("Grupo no encontrado o sin miembros.");

    // Mapear miembros con datos de usuario y tareas completadas
    const ranking = miembrosDelGrupo.map((miembro, index) => {
      const usuario = usuarios.find((u) => u.idUsuario === miembro.usuarioId);
      const tareasCompletadas = tareas.filter(
        (t) =>
          t.idGrupo === grupoId &&
          t.idUsuarioAsignado === miembro.usuarioId &&
          t.estado === "COMPLETADA" &&
          t.eliminada !== true
      ).length;

      return {
        id: miembro.id,
        usuarioId: miembro.usuarioId,
        nombre: usuario?.nombre || "Usuario desconocido",
        puntaje: miembro.puntaje,
        racha: miembro.racha,
        tareasCompletadas,
      };
    });

    // Ordenar por puntaje DESC, luego por tareasCompletadas DESC
    ranking.sort((a, b) => {
      if (b.puntaje !== a.puntaje) return b.puntaje - a.puntaje;
      return b.tareasCompletadas - a.tareasCompletadas;
    });

    // Actualizar puestos después de ordenar
    ranking.forEach((miembro, index) => {
      miembro.puesto = index + 1;
    });

    return ranking;
  },
};

const api = {
  async obtenerGrupoDeUsuario(usuarioId, token) {
    const miembros = await apiRequest("/miembros-grupo", { method: "GET" }, token);
    const membresia = miembros.find(m => m.usuario?.idUsuario === usuarioId || m.usuarioId === usuarioId || m.idUsuario === usuarioId);
    if (!membresia) return null;
    return {
      ...membresia,
      grupoId: membresia.grupo?.idGrupo || membresia.idGrupo || membresia.grupoId,
      usuarioId: membresia.usuario?.idUsuario || membresia.idUsuario || membresia.usuarioId,
      rolId: membresia.rol?.idRol || membresia.rolId
    };
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

    const grupo = grupos.find(g => (g.id || g.idGrupo) === Number(grupoId));
    if (!grupo) throw new Error("Grupo no encontrado.");

    return {
      ...grupo,
      id: grupo.id || grupo.idGrupo,
      miembros: miembros
        .filter(m => (m.grupoId || m.grupo?.idGrupo || m.idGrupo) === (grupo.id || grupo.idGrupo))
        .map(m => {
          const uid = m.usuarioId || m.usuario?.idUsuario || m.idUsuario;
          const usuario = usuarios.find(u => (u.id || u.idUsuario) === uid);
          return {
            ...m,
            usuarioId: uid,
            grupoId: m.grupoId || m.grupo?.idGrupo || m.idGrupo,
            rolId: m.rolId || m.rol?.idRol,
            rol: m.rol || { nombre: m.rolNombre },
            nombre: m.usuario?.nombre || usuario?.nombre,
            correo: m.usuario?.correo || usuario?.correo,
          };
        }),
    };
  },

  // HUS-024 — Eliminar miembro del grupo
  async eliminarMiembro(idMiembroGrupo, token) {
    return apiRequest(
      `/miembros-grupo/${idMiembroGrupo}`,
      { method: "DELETE" },
      token
    );
  },

  // HU-025 — Abandonar grupo
  // Flujo 1: Miembro normal (sin nuevo admin) → solo DELETE
  // Flujo 2: Admin con delegación (con nuevo admin) → PUT + DELETE
  async abandonarGrupo(idMiembroGrupo, idMiembroNuevoAdmin, token) {
    // FLUJO 1: Miembro normal abandona sin delegación
    if (!idMiembroNuevoAdmin) {
      return apiRequest(
        `/miembros-grupo/${idMiembroGrupo}`,
        { method: "DELETE" },
        token
      );
    }

    // FLUJO 2: Admin abandona con delegación
    // Primero cambiar rol del nuevo admin a 1
    await apiRequest(
      `/miembros-grupo/${idMiembroNuevoAdmin}`,
      {
        method: "PUT",
        body: { rolId: 1 },
      },
      token
    );

    // Luego remover el antiguo admin
    return apiRequest(
      `/miembros-grupo/${idMiembroGrupo}`,
      { method: "DELETE" },
      token
    );
  },

  // HU-032 — Obtener ranking del grupo
  async obtenerRanking(idGrupo, token) {
    return apiRequest(
      `/grupos/${idGrupo}/ranking`,
      { method: "GET" },
      token
    );
  },
};

const groupService = USE_MOCK ? mock : api;
export default groupService;
