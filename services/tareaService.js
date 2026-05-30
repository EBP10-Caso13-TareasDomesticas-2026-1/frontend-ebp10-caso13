import { USE_MOCK, apiRequest, delay } from "@/lib/api";
import { tareas } from "@/mocks/tareas";
import { estados } from "@/mocks/estados";
import { prioridades } from "@/mocks/prioridades";
import { usuarios } from "@/mocks/usuarios";

const resolverTarea = (tarea) => {
  const estadoObj = estados.find((e) => e.nombre === tarea.estado);
  const prioridadObj = prioridades.find((p) => p.nombre === tarea.prioridad);
  const asignado = usuarios.find((u) => u.idUsuario === tarea.idUsuarioAsignado);

  return {
    id: tarea.idTarea,
    titulo: tarea.nombre,
    descripcion: tarea.descripcion,
    grupoId: tarea.idGrupo,
    creadoPor: null,
    asignadoA: tarea.idUsuarioAsignado,
    prioridadId: prioridadObj?.id,
    estadoId: estadoObj?.id,
    fechaLimite: tarea.fechaLimite,
    fechaCreacion: tarea.fechaCreacion,
    fechaFinalizacion: null,
    estado: estadoObj ? { id: estadoObj.id, nombre: estadoObj.nombre, label: estadoObj.label } : null,
    prioridad: prioridadObj ? { id: prioridadObj.id, nombre: prioridadObj.nombre, label: prioridadObj.label } : null,
    asignado: asignado
      ? { idUsuario: asignado.idUsuario, nombre: asignado.nombre, fotoPerfil: asignado.fotoPerfil }
      : null,
    creador: null,
  };
};

const mock = {
  obtenerTareasDeGrupo: async (grupoId) => {
    await delay(400);
    const tareasDelGrupo = tareas
      .filter((t) => t.idGrupo === Number(grupoId))
      .map(resolverTarea);
    return tareasDelGrupo;
  },
};

const api = {
  obtenerTareasDeGrupo: (grupoId, token) =>
    apiRequest(`/grupos/${grupoId}/tareas`, { method: "GET" }, token),
};

const tareaService = USE_MOCK ? mock : api;
export default tareaService;
