"use client";

/**
 * TaskCard — Tarjeta de tarea individual
 *
 * Props:
 * - tarea: {
 *     idTarea: number,
 *     idGrupo: number,
 *     idUsuarioAsignado: number,
 *     nombre: string,
 *     descripcion: string | null,
 *     prioridad: "ALTA" | "MEDIA" | "BAJA",
 *     estado: "PENDIENTE" | "EN_PROGRESO" | "COMPLETADA" | "VENCIDA",
 *     fechaLimite: string,
 *     fechaCreacion?: string,
 *     asignadoA?: { id: number, nombre: string, correo?: string, fotoPerfil?: string | null } | null,
 *   }
 * - esAdmin: boolean
 * - esMiaTarea: boolean
 * - onCambiarEstado: (idTarea, nuevoEstado) => void
 * - loading: boolean (deshabilita botones durante cambios)
 */
export default function TaskCard({
  tarea,
  esAdmin,
  esMiaTarea,
  onCambiarEstado,
  loading,
}) {
  // ─── Helpers para UI ───────────────────────────────────────────

  const formatFechaLimite = (fecha) => {
    if (!fecha) return "";
    try {
      const date = new Date(fecha);
      return new Intl.DateTimeFormat("es-ES", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch {
      return "";
    }
  };

  const getPrioridadBadge = (prioridad) => {
    const config = {
      ALTA: {
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-200",
        label: "Alta",
      },
      MEDIA: {
        bg: "bg-yellow-50",
        text: "text-yellow-700",
        border: "border-yellow-200",
        label: "Media",
      },
      BAJA: {
        bg: "bg-green-50",
        text: "text-green-700",
        border: "border-green-200",
        label: "Baja",
      },
    };
    return config[prioridad] || config.MEDIA;
  };

  const getEstadoStyle = (estado) => {
    if (estado === "VENCIDA") {
      return "border-red-400 bg-red-50";
    }
    if (estado === "COMPLETADA") {
      return "border-green-300 bg-white";
    }
    return "border-gray-200 bg-white";
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

  const puedeCambiarEstado = esAdmin || esMiaTarea;
  const prioridadStyle = getPrioridadBadge(tarea.prioridad);
  const estadoStyle = getEstadoStyle(tarea.estado);

  // ─── Renderizar botones según estado y permisos ───────────────

  const renderBotones = () => {
    if (!puedeCambiarEstado) {
      // No tiene permisos — mostrar solo etiqueta
      return (
        <button
          type="button"
          disabled
          className="w-full mt-2 px-2 py-1 rounded text-xs font-medium border bg-gray-100 border-gray-200 text-gray-600 opacity-90 cursor-not-allowed"
        >
          Asignada a {tarea.asignadoA?.nombre || "usuario"}
        </button>
      );
    }

    // Tiene permisos — mostrar botones contextuales
    const botones = [];

    if (tarea.estado === "PENDIENTE") {
      botones.push(
        <button
          key="en-progreso"
          type="button"
          onClick={() => onCambiarEstado(tarea.idTarea, "EN_PROGRESO")}
          disabled={loading}
          className="w-full px-2 py-1 bg-yellow-100 hover:bg-yellow-200 disabled:bg-gray-100 text-yellow-700 disabled:text-gray-400 text-xs font-medium rounded transition"
        >
          En progreso
        </button>,
        <button
          key="completar"
          type="button"
          onClick={() => onCambiarEstado(tarea.idTarea, "COMPLETADA")}
          disabled={loading}
          className="w-full px-2 py-1 bg-green-100 hover:bg-green-200 disabled:bg-gray-100 text-green-700 disabled:text-gray-400 text-xs font-medium rounded transition"
        >
          Completar
        </button>,
      );
    } else if (tarea.estado === "EN_PROGRESO") {
      botones.push(
        <button
          key="volver-pendiente"
          type="button"
          onClick={() => onCambiarEstado(tarea.idTarea, "PENDIENTE")}
          disabled={loading}
          className="w-full px-2 py-1 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-100 text-gray-700 disabled:text-gray-400 text-xs font-medium rounded transition"
        >
          Volver a Pendiente
        </button>,
        <button
          key="completar"
          type="button"
          onClick={() => onCambiarEstado(tarea.idTarea, "COMPLETADA")}
          disabled={loading}
          className="w-full px-2 py-1 bg-green-100 hover:bg-green-200 disabled:bg-gray-100 text-green-700 disabled:text-gray-400 text-xs font-medium rounded transition"
        >
          Completar
        </button>,
      );
    } else if (tarea.estado === "COMPLETADA") {
      if (esAdmin) {
        botones.push(
          <button
            key="reabrir"
            type="button"
            onClick={() => onCambiarEstado(tarea.idTarea, "PENDIENTE")}
            disabled={loading}
            className="w-full px-2 py-1 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-100 text-gray-700 disabled:text-gray-400 text-xs font-medium rounded transition"
          >
            Reabrir
          </button>,
          <button
            key="mover-en-progreso"
            type="button"
            onClick={() => onCambiarEstado(tarea.idTarea, "EN_PROGRESO")}
            disabled={loading}
            className="w-full px-2 py-1 bg-yellow-100 hover:bg-yellow-200 disabled:bg-gray-100 text-yellow-700 disabled:text-gray-400 text-xs font-medium rounded transition"
          >
            Mover a en progreso
          </button>,
        );
      }
    } else if (tarea.estado === "VENCIDA") {
      if (esAdmin) {
        botones.push(
          <button
            key="reabrir"
            type="button"
            onClick={() => onCambiarEstado(tarea.idTarea, "PENDIENTE")}
            disabled={loading}
            className="w-full px-2 py-1 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-100 text-gray-700 disabled:text-gray-400 text-xs font-medium rounded transition"
          >
            Reabrir
          </button>,
          <button
            key="completar"
            type="button"
            onClick={() => onCambiarEstado(tarea.idTarea, "COMPLETADA")}
            disabled={loading}
            className="w-full px-2 py-1 bg-green-100 hover:bg-green-200 disabled:bg-gray-100 text-green-700 disabled:text-gray-400 text-xs font-medium rounded transition"
          >
            Completar
          </button>,
        );
      }
    }

    return (
      <div className="flex flex-col gap-2 mt-2">
        {botones}
      </div>
    );
  };

  return (
    <div
      className={`p-3 rounded-lg border transition md:min-h-[220px] ${estadoStyle}`}
    >
      {/* Encabezado: Título */}
      <h4 className="font-semibold text-sm text-gray-800 mb-2 break-words">
        {tarea.nombre}
      </h4>

      {/* Responsable */}
      {tarea.asignadoA && (
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ backgroundColor: "#6467F2" }}
          >
            {getIniciales(tarea.asignadoA.nombre)}
          </div>
          <span className="text-xs text-gray-600">
            {tarea.asignadoA.nombre}
          </span>
        </div>
      )}

      {/* Fecha límite */}
      {tarea.fechaLimite && (
        <div className="flex items-center gap-1 mb-2 text-xs text-gray-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-3 h-3"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          {formatFechaLimite(tarea.fechaLimite)}
        </div>
      )}

      {/* Prioridad Badge */}
      <div className="mb-3">
        <span
          className={`inline-block px-2 py-1 rounded text-xs font-medium border ${prioridadStyle.bg} ${prioridadStyle.text} ${prioridadStyle.border}`}
        >
          {prioridadStyle.label}
        </span>
      </div>

      {/* Estado visual COMPLETADA */}
      {tarea.estado === "COMPLETADA" && (
        <button
          type="button"
          disabled
          className="w-full mb-2 px-2 py-1 rounded text-xs font-medium border bg-green-100 border-green-200 text-green-700 opacity-90 cursor-not-allowed flex items-center justify-center gap-1"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-3 h-3"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M10 15.172l9.192-9.193a1 1 0 1 1 1.415 1.415l-10.606 10.606a1 1 0 0 1-1.415 0l-4.24-4.243a1 1 0 1 1 1.415-1.415L10 15.172z" />
          </svg>
          Tarea completada
        </button>
      )}

      {/* Estado visual VENCIDA */}
      {tarea.estado === "VENCIDA" && (
        <button
          type="button"
          disabled
          className="w-full mb-2 px-2 py-1 rounded text-xs font-medium border bg-red-100 border-red-200 text-red-700 opacity-90 cursor-not-allowed"
        >
          Esta tarea está vencida.
        </button>
      )}

      {/* Botones */}
      {renderBotones()}
    </div>
  );
}
