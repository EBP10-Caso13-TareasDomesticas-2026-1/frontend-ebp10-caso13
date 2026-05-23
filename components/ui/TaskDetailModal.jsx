"use client";

import { useState } from "react";
import Image from "next/image";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

/**
 * TaskDetailModal — Modal de detalle de tarea (HU-010 + HUS-007)
 *
 * Muestra el detalle completo de una tarea.
 * Solo el administrador ve los botones "Editar" y "Eliminar tarea".
 *
 * Props:
 * - isOpen      (boolean)   Controla visibilidad del modal
 * - tarea       (object)    Objeto tarea con todos sus campos
 * - esAdmin     (boolean)   Si true, muestra acciones de admin
 * - loading     (boolean)   Deshabilita botones durante operaciones
 * - onClose     (function)  Cierra el modal
 * - onEliminar  (function)  Callback (idTarea) => void — ejecuta el soft delete
 * - onEditar    (function)  Callback (tarea) => void  — abre flujo de edición
 */
export default function TaskDetailModal({
  isOpen = false,
  tarea,
  esAdmin = false,
  loading = false,
  onClose,
  onEliminar,
  onEditar,
}) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deletingTask, setDeletingTask] = useState(false);

  if (!isOpen || !tarea) return null;

  // ─── Helpers visuales ───────────────────────────────────────

  const formatFecha = (fecha) => {
    if (!fecha) return "—";
    try {
      return new Intl.DateTimeFormat("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(new Date(fecha));
    } catch {
      return "—";
    }
  };

  const getEstadoBadge = (estado) => {
    const config = {
      PENDIENTE: {
        bg: "bg-orange-50",
        text: "text-orange-600",
        border: "border-orange-200",
        label: "Pendiente",
      },
      EN_PROGRESO: {
        bg: "bg-blue-50",
        text: "text-blue-600",
        border: "border-blue-200",
        label: "En Progreso",
      },
      COMPLETADA: {
        bg: "bg-green-50",
        text: "text-green-600",
        border: "border-green-200",
        label: "Completada",
      },
      VENCIDA: {
        bg: "bg-red-50",
        text: "text-red-600",
        border: "border-red-200",
        label: "Vencida",
      },
    };
    return config[estado] || config.PENDIENTE;
  };

  const getPrioridadBadge = (prioridad) => {
    const config = {
      ALTA: {
        bg: "bg-red-50",
        text: "text-red-600",
        border: "border-red-200",
        label: "Alta",
      },
      MEDIA: {
        bg: "bg-yellow-50",
        text: "text-yellow-600",
        border: "border-yellow-200",
        label: "Media",
      },
      BAJA: {
        bg: "bg-green-50",
        text: "text-green-600",
        border: "border-green-200",
        label: "Baja",
      },
    };
    return config[prioridad] || config.MEDIA;
  };

  const getIniciales = (nombre) => {
    if (!nombre) return "?";
    return nombre
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const estadoStyle = getEstadoBadge(tarea.estado);
  const prioridadStyle = getPrioridadBadge(tarea.prioridad);

  // ─── Handler confirmar eliminación ──────────────────────────

  const handleConfirmarEliminar = async () => {
    setDeletingTask(true);
    try {
      await onEliminar?.(tarea.idTarea);
      setShowConfirmDelete(false);
      onClose?.();
    } catch {
      // El error se maneja en el padre (tablero)
      setShowConfirmDelete(false);
    } finally {
      setDeletingTask(false);
    }
  };

  // ─── Render ─────────────────────────────────────────────────

  return (
    <>
      {/* Overlay + modal de detalle */}
      <div
        className="fixed inset-0 z-40 flex items-center justify-center bg-black/50"
        onClick={onClose}
      >
        <div
          className="relative bg-white rounded-2xl shadow-xl w-full max-w-xl mx-4 p-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Botón cerrar (X) */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 text-secondary hover:text-foreground transition-colors"
            aria-label="Cerrar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Título */}
          <h2 className="text-xl font-bold text-foreground pr-8 mb-6">
            {tarea.nombre}
          </h2>

          <hr className="border-border mb-6" />

          {/* Estado y prioridad */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-xs font-semibold text-secondary uppercase tracking-widest mb-2">
                Estado
              </p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${estadoStyle.bg} ${estadoStyle.text} ${estadoStyle.border}`}
              >
                {estadoStyle.label}
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold text-secondary uppercase tracking-widest mb-2">
                Prioridad
              </p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${prioridadStyle.bg} ${prioridadStyle.text} ${prioridadStyle.border}`}
              >
                {prioridadStyle.label}
              </span>
            </div>
          </div>

          {/* Asignado a y fecha límite */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-xs font-semibold text-secondary uppercase tracking-widest mb-2">
                Asignado a
              </p>
              {tarea.asignadoA ? (
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: "#6467F2" }}
                  >
                    {getIniciales(tarea.asignadoA.nombre)}
                  </div>
                  <span className="text-sm text-foreground font-medium">
                    {tarea.asignadoA.nombre}
                  </span>
                </div>
              ) : (
                <span className="text-sm text-secondary">Sin asignar</span>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-secondary uppercase tracking-widest mb-2">
                Fecha límite
              </p>
              <p className="text-sm text-foreground">
                {formatFecha(tarea.fechaLimite)}
              </p>
            </div>
          </div>

          {/* Descripción */}
          {tarea.descripcion && (
            <div className="mb-6">
              <p className="text-xs font-semibold text-secondary uppercase tracking-widest mb-2">
                Descripción
              </p>
              <div className="bg-background border border-border rounded-lg px-4 py-3">
                <p className="text-sm text-foreground leading-relaxed">
                  {tarea.descripcion}
                </p>
              </div>
            </div>
          )}

          {/* Footer con acciones */}
          <div className="flex items-center justify-between mt-2">
            {/* Botones admin — solo se renderizan si esAdmin (HA-02: conditional rendering) */}
            <div className="flex items-center gap-2">
              {esAdmin && (
                <>
                  <button
                    type="button"
                    onClick={() => onEditar?.(tarea)}
                    disabled={loading || deletingTask}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Editar
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowConfirmDelete(true)}
                    disabled={loading || deletingTask}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-error/30 bg-error-light text-sm font-medium text-error hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Image
                      src="/papelera.svg"
                      width={16}
                      height={16}
                      alt="eliminar"
                    />
                    Eliminar tarea
                  </button>
                </>
              )}
            </div>

            {/* Botón cerrar */}
            <button
              type="button"
              onClick={onClose}
              disabled={loading || deletingTask}
              className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-secondary hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      {/* Solo se monta si esAdmin (HA-02: guardián de componente) */}
      {esAdmin && (
        <ConfirmationModal
          isOpen={showConfirmDelete}
          icon={
            <Image
              src="/papelera.svg"
              width={32}
              height={32}
              alt="eliminar tarea"
            />
          }
          title="¿Eliminar tarea?"
          description="Esta acción no se puede deshacer. La tarea será eliminada permanentemente del tablero."
          confirmText={deletingTask ? "Eliminando..." : "Eliminar tarea"}
          cancelText="Cancelar"
          variant="danger"
          onConfirm={handleConfirmarEliminar}
          onCancel={() => setShowConfirmDelete(false)}
        />
      )}
    </>
  );
}