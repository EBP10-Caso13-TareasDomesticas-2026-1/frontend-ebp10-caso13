"use client";

import { X, AlertCircle } from "lucide-react";
import { getEstadoInfo, getPrioridadInfo } from "@/lib/taskHelpers";

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/**
 * Genera iniciales a partir de un nombre completo.
 * Ej: "Ana López" → "AL"
 */
function generarIniciales(nombre) {
  if (!nombre) return "?";
  return nombre
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");
}

/**
 * Formatea una fecha ISO a formato legible.
 * Ej: "2026-05-22T10:00:00Z" → "22/05/2026"
 */
function formatearFecha(fechaISO) {
  if (!fechaISO) return "Sin fecha";
  const fecha = new Date(fechaISO);
  if (isNaN(fecha)) return fechaISO;
  return fecha.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Mapea el color hex del estado a clases Tailwind de badge.
 * Usa colores del sistema definidos en tailwind.config.js.
 */
function resolverEstiloBadge(estado) {
  const mapa = {
    PENDIENTE:    "bg-secondary-light text-secondary",
    EN_PROGRESO:  "bg-primary-light text-primary",
    COMPLETADA:   "bg-success-light text-success",
    VENCIDA:      "bg-error-light text-error",
  };
  return mapa[estado] ?? "bg-secondary-light text-secondary";
}

function resolverEstiloBadgePrioridad(prioridad) {
  const mapa = {
    ALTA:  "bg-error-light text-error",
    MEDIA: "bg-yellow-100 text-yellow-700",
    BAJA:  "bg-success-light text-success",
  };
  return mapa[prioridad] ?? "bg-secondary-light text-secondary";
}

// ─── COMPONENTE ──────────────────────────────────────────────────────────────

/**
 * TaskDetailModal — HU-010
 * Modal de solo lectura con el detalle completo de una tarea.
 * Accesible para cualquier miembro del grupo.
 *
 * Props:
 * @param {boolean}  isOpen   - Controla visibilidad del modal
 * @param {object}   tarea    - Objeto tarea (estructura de mocks/tareas.js)
 * @param {Function} onClose  - Callback al cerrar el modal
 * @param {boolean}  loading  - Si true, muestra skeleton de carga
 * @param {string}   error    - Mensaje de error si falló la carga (Escenario 7)
 */
export default function TaskDetailModal({ isOpen, tarea, onClose, loading = false, error = "" }) {
  if (!isOpen) return null;

  // ─── Info visual ──────────────────────────────────────────────────────────
  const estadoInfo    = tarea ? getEstadoInfo(tarea.estado)       : null;
  const prioridadInfo = tarea ? getPrioridadInfo(tarea.prioridad) : null;

  // ─── RENDER ───────────────────────────────────────────────────────────────

  return (
    // Escenario 5: clic en backdrop cierra el modal
    <div
      className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-lg z-50 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >

        {/* ── Header ── */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-border gap-4">
          <h2 className="text-base font-semibold text-foreground leading-snug flex-1">
            {loading ? (
              <span className="block h-5 w-48 bg-secondary-light rounded animate-pulse" />
            ) : (
              tarea?.titulo ?? "Sin título"
            )}
          </h2>
          {/* Escenario 5 y 7: botón de cierre siempre visible */}
          <button
            onClick={onClose}
            className="text-secondary hover:text-foreground transition-colors flex-shrink-0 mt-0.5"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Escenario 7: Error de carga ── */}
        {error && !loading && (
          <div className="mx-6 mt-4 flex items-center gap-2 bg-error-light border border-error rounded-lg px-3 py-2 text-sm text-error">
            <AlertCircle size={15} className="flex-shrink-0" />
            {error}
          </div>
        )}

        {/* ── Cuerpo ── */}
        {!error && (
          <div className="px-6 py-4 flex flex-col gap-4">

            {/* Fila: Estado + Prioridad (Escenarios 3 y 4) */}
            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-secondary uppercase tracking-wide">
                  Estado
                </span>
                {loading ? (
                  <span className="h-6 w-24 bg-secondary-light rounded-full animate-pulse block" />
                ) : (
                  <span className={`text-xs font-medium px-3 py-1 rounded-full w-fit ${resolverEstiloBadge(tarea?.estado)}`}>
                    {estadoInfo?.label ?? tarea?.estado}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-secondary uppercase tracking-wide">
                  Prioridad
                </span>
                {loading ? (
                  <span className="h-6 w-16 bg-secondary-light rounded-full animate-pulse block" />
                ) : (
                  <span className={`text-xs font-medium px-3 py-1 rounded-full w-fit ${resolverEstiloBadgePrioridad(tarea?.prioridad)}`}>
                    {prioridadInfo?.label ?? tarea?.prioridad}
                  </span>
                )}
              </div>
            </div>

            {/* Fila: Asignado a + Fecha límite */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-secondary uppercase tracking-wide">
                  Asignado a
                </span>
                {loading ? (
                  <span className="h-8 w-32 bg-secondary-light rounded animate-pulse block" />
                ) : (
                  <div className="flex items-center gap-2 mt-0.5">
                    {/* Avatar con iniciales */}
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-white">
                        {generarIniciales(tarea?.asignadoA)}
                      </span>
                    </div>
                    <span className="text-sm text-foreground font-medium">
                      {tarea?.asignadoA ?? "Sin asignar"}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-secondary uppercase tracking-wide">
                  Fecha límite
                </span>
                {loading ? (
                  <span className="h-5 w-24 bg-secondary-light rounded animate-pulse block mt-1" />
                ) : (
                  <span className="text-sm text-foreground mt-1">
                    {formatearFecha(tarea?.fechaLimite)}
                  </span>
                )}
              </div>
            </div>

            {/* Descripción (Escenario 2: sin descripción → texto placeholder) */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-secondary uppercase tracking-wide">
                Descripción
              </span>
              {loading ? (
                <div className="space-y-2 mt-1">
                  <span className="h-4 w-full bg-secondary-light rounded animate-pulse block" />
                  <span className="h-4 w-3/4 bg-secondary-light rounded animate-pulse block" />
                </div>
              ) : (
                <div className="border border-border rounded-lg px-3 py-2 min-h-[80px] bg-background">
                  <p className={`text-sm leading-relaxed ${tarea?.descripcion ? "text-foreground" : "text-secondary italic"}`}>
                    {tarea?.descripcion || "Sin descripción"}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <div className="px-6 pb-5 flex justify-end">
          <button
            onClick={onClose}
            className="text-sm font-medium text-secondary hover:text-foreground border border-border rounded-lg px-4 py-2 transition-colors hover:bg-background"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}
