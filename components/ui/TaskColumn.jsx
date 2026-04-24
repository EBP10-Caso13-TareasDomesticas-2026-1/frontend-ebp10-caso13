"use client";

import TaskCard from "@/components/ui/TaskCard";

/**
 * TaskColumn — Columna del Kanban con lista de tareas
 *
 * Props:
 * - titulo: string (ej: "Pendientes")
 * - tareas: array de tareas
 * - esAdmin: boolean
 * - usuarioId: number
 * - onCambiarEstado: (idTarea, nuevoEstado) => void
 * - loading: boolean
 */
export default function TaskColumn({
  titulo,
  tareas,
  esAdmin,
  usuarioId,
  onCambiarEstado,
  loading,
}) {
  return (
    <div className="flex flex-col bg-gray-50 rounded-lg p-4 min-h-96">
      {/* Header de la columna */}
      <div className="mb-4">
        <h3 className="font-bold text-gray-800 text-sm">
          {titulo}
        </h3>
        <p className="text-xs text-gray-500">
          {tareas.length} {tareas.length === 1 ? "tarea" : "tareas"}
        </p>
      </div>

      {/* Lista de tarjetas */}
      <div className="flex flex-col gap-3 overflow-y-auto pr-2 flex-1">
        {tareas.length > 0 ? (
          tareas.map((tarea) => (
            <TaskCard
              key={tarea.idTarea}
              tarea={tarea}
              esAdmin={esAdmin}
              esMiaTarea={tarea.asignadoA?.id === usuarioId}
              onCambiarEstado={onCambiarEstado}
              loading={loading}
            />
          ))
        ) : (
          <div className="text-center py-8 text-gray-400 text-sm">
            No hay tareas
          </div>
        )}
      </div>
    </div>
  );
}
