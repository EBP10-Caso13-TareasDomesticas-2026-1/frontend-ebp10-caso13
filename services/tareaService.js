import { USE_MOCK, apiRequest, delay } from "@/lib/api";
import { tareas } from "@/mocks/tareas";
import { estados } from "@/mocks/estados";
import { prioridades } from "@/mocks/prioridades";
import { usuarios } from "@/mocks/usuarios";

const resolverTarea = (tarea) => {
  const estado = estados.find((e) => e.id === tarea.estadoId);
  const prioridad = prioridades.find((p) => p.id === tarea.prioridadId);
  const asignado = usuarios.find((u) => u.idUsuario === tarea.asignadoA);
  const creador = usuarios.find((u) => u.idUsuario === tarea.creadoPor);

  return {
    ...tarea,
    estado: estado ? { id: estado.id, nombre: estado.nombre } : null,
    prioridad: prioridad ? { id: prioridad.id, nombre: prioridad.nombre } : null,
    asignadoA: tarea.asignadoA,
    asignado: asignado
      ? { idUsuario: asignado.idUsuario, nombre: asignado.nombre, fotoPerfil: asignado.fotoPerfil }
      : null,
    creadoPor: tarea.creadoPor,
    creador: creador
      ? { idUsuario: creador.idUsuario, nombre: creador.nombre }
      : null,
  };
};

const mock = {
  obtenerTareasDeGrupo: async (grupoId) => {
    await delay(400);
    const tareasDelGrupo = tareas
      .filter((t) => t.grupoId === Number(grupoId))
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
