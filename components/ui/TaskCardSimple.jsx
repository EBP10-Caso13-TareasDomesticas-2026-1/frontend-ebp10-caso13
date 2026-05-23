"use client";

import { Calendar, User } from "lucide-react";

function estadoBadge(estado) {
  if (estado?.nombre === "PENDIENTE") return "badge-secondary";
  if (estado?.nombre === "EN_PROGRESO") return "badge-primary";
  if (estado?.nombre === "COMPLETADA") return "badge-success";
  if (estado?.nombre === "VENCIDA") return "badge-error";
  return "badge-secondary";
}

function prioridadBadge(prioridad) {
  if (prioridad?.nombre === "ALTA") return "badge-error";
  if (prioridad?.nombre === "MEDIA") return "badge-secondary";
  if (prioridad?.nombre === "BAJA") return "bg-blue-100 text-blue-700 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
  return "badge-secondary";
}

function formatFecha(isoString) {
  if (!isoString) return "";
  const fecha = new Date(isoString);
  return fecha.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
  });
}

export default function TaskCardSimple({ tarea }) {
  const { titulo, descripcion, estado, prioridad, asignado, fechaLimite } =
    tarea;

  return (
    <div className="card p-4 space-y-3 hover:shadow-lg transition-shadow cursor-pointer">
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-semibold flex-1">{titulo}</h4>
      </div>

      {descripcion && (
        <p className="text-xs text-secondary line-clamp-2">{descripcion}</p>
      )}

      <div className="flex flex-wrap items-center gap-1.5">
        <span className={prioridadBadge(prioridad)}>
          {prioridad?.label || prioridad?.nombre}
        </span>
        <span className={estadoBadge(estado)}>
          {estado?.label || estado?.nombre}
        </span>
      </div>

      <div className="flex items-center justify-between text-xs text-secondary pt-1 border-t border-border">
        {fechaLimite && (
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {formatFecha(fechaLimite)}
          </span>
        )}
        {asignado && (
          <span className="flex items-center gap-1">
            <User size={12} />
            {asignado.nombre}
          </span>
        )}
      </div>
    </div>
  );
}
