"use client";

import TaskCard from "./TaskCard";
import { estados as estadosList } from "@/mocks/estados";

function estadoBadge(estado) {
  if (estado?.nombre === "PENDIENTE") return "badge-secondary";
  if (estado?.nombre === "EN PROGRESO") return "badge-primary";
  if (estado?.nombre === "COMPLETADA") return "badge-success";
  if (estado?.nombre === "VENCIDA") return "badge-error";
  return "badge-secondary";
}

export default function TaskBoard({ tareas = [] }) {
  const columnas = estadosList.map((estado) => ({
    ...estado,
    tareas: tareas.filter((t) => t.estadoId === estado.id),
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {columnas.map((col) => (
        <div key={col.id} className="bg-background rounded-lg p-3">
          <div className="flex items-center justify-between mb-3">
            <span className={estadoBadge(col)}>{col.nombre}</span>
            <span className="text-xs text-secondary font-medium">
              {col.tareas.length}
            </span>
          </div>

          {col.tareas.length > 0 ? (
            <div className="space-y-3">
              {col.tareas.map((tarea) => (
                <TaskCard key={tarea.id} tarea={tarea} />
              ))}
            </div>
          ) : (
            <p className="text-xs text-secondary-light text-center py-4">
              Sin tareas
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
