"use client";

/**
 * DateLimitModal
 * Modal para solicitar nueva fecha límite antes de reabrir una tarea.
 */
export default function DateLimitModal({
  isOpen,
  value,
  error,
  loading,
  onChange,
  onConfirm,
  onCancel,
  minDateTime,
  title = "Nueva fecha límite obligatoria",
  description = "Para reabrir esta tarea debes asignar una nueva fecha límite.",
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onCancel}
    >
      <div
        className="relative bg-white rounded-lg shadow-lg p-8 max-w-sm w-full mx-4 flex flex-col items-center gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-error-light p-3 rounded-full" aria-hidden="true">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 text-error"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
            focusable="false"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 7V3m8 4V3m-9 8h10m-13 9h16a1 1 0 0 0 1-1V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a1 1 0 0 0 1 1Z"
            />
          </svg>
        </div>

        <h3 className="text-center">{title}</h3>
        <p className="text-sm text-secondary text-center">{description}</p>

        <div className="w-full">
          <label htmlFor="fecha-limite-modal" className="block text-sm font-medium text-foreground mb-1">
            Fecha límite
          </label>
          <input
            id="fecha-limite-modal"
            type="datetime-local"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="input-base"
            disabled={loading}
            min={minDateTime}
            required
          />
          {error && <p className="error-message">{error}</p>}
        </div>

        <div className="flex flex-col gap-2 w-full mt-2">
          <button
            type="button"
            onClick={onConfirm}
            disabled={!value || loading}
            className="btn-primary w-full"
          >
            Confirmar reapertura
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary w-full"
            disabled={loading}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
