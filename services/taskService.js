// services/taskService.js
// Sprint 2 — Tareas
// SPRINT 2 (este sprint):
//   HU-006 — Crear tarea
//   HU-007 — Listar tareas del grupo (tablero)
//   HU-008 — Actualizar estado de tarea
// Sprint 3
//   HUS-007 — Eliminar tarea

import { USE_MOCK, apiRequest, delay } from "@/lib/api";
import { tareas } from "@/mocks/tareas";
import { miembrosGrupo } from "@/mocks/miembrosGrupo";

const mock = {
  // HU-006 — Crear tarea
  async crearTarea(data, _token, usuarioId) {
    await delay(600);
    if (!usuarioId) throw new Error("Usuario no identificado.");

    const { nombre, descripcion, idUsuarioAsignado, prioridad, fechaLimite } = data;

    // Inferir el grupo del usuario (el backend lo haría por token)
    const miembro = miembrosGrupo.find((m) => m.usuarioId === usuarioId);
    if (!miembro) throw new Error("Usuario no pertenece a ningún grupo.");

    const nuevaTarea = {
      idTarea: Math.max(...tareas.map((t) => t.idTarea), 0) + 1,
      idGrupo: miembro.grupoId,
      idUsuarioAsignado,
      nombre,
      descripcion: descripcion || null,
      prioridad,
      estado: "PENDIENTE",
      fechaLimite,
      fechaCreacion: new Date().toISOString(),
    };

    tareas.push(nuevaTarea);
    return nuevaTarea;
  },

  // HU-007 — Obtener tareas del grupo (para tablero)
  async obtenerTareasGrupo(idGrupo, _token) {
    await delay(400);
    return tareas.filter((t) => t.idGrupo === Number(idGrupo) && t.eliminada !== true);
  },

  // HU-008 — Actualizar tarea
  async actualizarTarea(idTarea, data, _token) {
    await delay(600);
    const tarea = tareas.find((t) => t.idTarea === Number(idTarea));
    if (!tarea) throw new Error("Tarea no encontrada.");

    if (data.nombre !== undefined) tarea.nombre = data.nombre;
    if (data.descripcion !== undefined) tarea.descripcion = data.descripcion;
    if (data.prioridad) tarea.prioridad = data.prioridad;
    if (data.estado) tarea.estado = data.estado;
    if (data.idUsuarioAsignado !== undefined && data.idUsuarioAsignado !== null) {
      tarea.idUsuarioAsignado = Number(data.idUsuarioAsignado);
    }
    if (data.fechaLimite) tarea.fechaLimite = data.fechaLimite;

    return tarea;
  },

  // HUS-007 — Eliminar tarea (soft delete)
  async eliminarTarea(idTarea, _token) {
    await delay(600);
    const tarea = tareas.find((t) => t.idTarea === Number(idTarea));
    if (!tarea) throw new Error("Tarea no encontrada.");

    // Soft delete: marcar como eliminada
    tarea.eliminada = true;

    return { mensaje: "Tarea eliminada exitosamente." };
  },
};

const api = {
  async crearTarea(data, token, usuarioId) {
    if (!usuarioId) throw new Error("Usuario no identificado.");

    return apiRequest(
      "/tareas",
      {
        method: "POST",
        body: {
          nombre: data.nombre,
          descripcion: data.descripcion,
          idUsuarioAsignado: data.idUsuarioAsignado,
          prioridad: data.prioridad,
          fechaLimite: data.fechaLimite,
        },
      },
      token
    );
  },

  async obtenerTareasGrupo(idGrupo, token) {
    const data = await apiRequest(
      `/tareas/grupo/${idGrupo}`,
      { method: "GET" },
      token
    );
    
    if (Array.isArray(data)) {
      return data;
    }
    if (data && typeof data === "object") {
      if (data.tablero && typeof data.tablero === "object") {
        return Object.values(data.tablero).flat();
      }
      return [];
    }
    return [];
  },

  async actualizarTarea(idTarea, data, token) {
    return apiRequest(
      `/tareas/${idTarea}/estado`,
      {
        method: "PATCH",
        body: {
          estado: data.estado,
          ...(data.fechaLimite ? { fechaLimite: data.fechaLimite } : {}),
        },
      },
      token
    );
  },

  // HUS-007 — Eliminar tarea (soft delete)
  async eliminarTarea(idTarea, token) {
    return apiRequest(
      `/tareas/${idTarea}`,
      { method: "DELETE" },
      token
    );
  },


};

const taskService = USE_MOCK ? mock : api;
export default taskService;
