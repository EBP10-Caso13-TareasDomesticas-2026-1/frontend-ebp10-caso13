"use client";

import { useState, useEffect } from "react";
import { X, Save, AlertCircle, Lock } from "lucide-react";
import Button from "@/components/ui/Button";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { getEstados, getPrioridades } from "@/lib/taskHelpers";

// ─── CONSTANTES ──────────────────────────────────────────────────────────────

const ESTADO_COMPLETADA = "COMPLETADA";
const ESTADO_VENCIDA = "VENCIDA";
const MAX_TITULO = 100;
const MAX_DESCRIPCION = 500;

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/**
 * Dado el estado de una tarea, retorna qué campos están bloqueados.
 * Escenario 3/4: VENCIDA → fecha límite bloqueada, resto editable.
 * Escenario 5: COMPLETADA → todo bloqueado (solo lectura).
 */
function resolverBloqueoPorEstado(estado) {
  if (estado === ESTADO_COMPLETADA) {
    return { todo: true, fechaLimite: true };
  }
  if (estado === ESTADO_VENCIDA) {
    return { todo: false, fechaLimite: true };
  }
  return { todo: false, fechaLimite: false };
}

/**
 * Formatea una fecha ISO a formato compatible con datetime-local input.
 * Ej: "2026-05-22T10:00:00Z" → "2026-05-22T10:00"
 */
function formatearParaInput(fechaISO) {
  if (!fechaISO) return "";
  return fechaISO.slice(0, 16);
}

function obtenerMinDateTimeLocal() {
  const ahora = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${ahora.getFullYear()}-${pad(ahora.getMonth() + 1)}-${pad(ahora.getDate())}T${pad(ahora.getHours())}:${pad(ahora.getMinutes())}`;
}

// ─── COMPONENTE ──────────────────────────────────────────────────────────────

/**
 * TaskEditModal — HU-008
 * Modal de edición de tarea. Solo accesible para administradores.
 *
 * Props:
 * @param {boolean}  isOpen        - Controla visibilidad del modal
 * @param {object}   tarea         - Objeto tarea a editar (estructura de mocks/tareas.js)
 * @param {Function} onClose       - Callback al cerrar/cancelar sin guardar
 * @param {Function} onGuardar     - Callback al confirmar guardado: recibe (idTarea, datosActualizados)
 * @param {boolean}  loading       - Estado de carga externo (mientras se guarda)
 */
export default function TaskEditModal({
  isOpen,
  tarea,
  miembros = [],
  onClose,
  onGuardar,
  loading = false,
}) {
  // ── Estado del formulario ──
  const [form, setForm] = useState({
    nombre: "",
    estado: "",
    prioridad: "",
    idUsuarioAsignado: "",
    fechaLimite: "",
    descripcion: "",
  });

  // ── Errores por campo ──
  const [errores, setErrores] = useState({ nombre: "", idUsuarioAsignado: "" });

  // ── Estado del modal de confirmación ──
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  // ── Detectar cambios sin guardar (Escenario 7) ──
  const [haycambios, setHayCambios] = useState(false);

  // ── Bloqueo por estado (Escenarios 3, 4, 5) ──
  const bloqueo = resolverBloqueoPorEstado(form.estado);

  // ── Catálogos ──
  const estados = getEstados();
  const prioridades = getPrioridades();

  // ── Inicializar formulario cuando cambia la tarea ──
  useEffect(() => {
    if (tarea && isOpen) {
      setForm({
        nombre: tarea.nombre ?? tarea.titulo ?? "",
        estado: tarea.estado ?? "",
        prioridad: tarea.prioridad ?? "",
        idUsuarioAsignado:
          tarea.idUsuarioAsignado ?? tarea.asignadoA?.id ?? tarea.asignadoA ?? "",
        fechaLimite: formatearParaInput(tarea.fechaLimite),
        descripcion: tarea.descripcion ?? "",
      });
      setErrores({ nombre: "", idUsuarioAsignado: "" });
      setHayCambios(false);
    }
  }, [tarea, isOpen]);

  if (!isOpen || !tarea) return null;

  // ─── HANDLERS ──────────────────────────────────────────────────────────────

  const handleChange = (campo) => (e) => {
    const valor = e.target.value;

    // Límite de caracteres
    if (campo === "nombre" && valor.length > MAX_TITULO) return;
    if (campo === "descripcion" && valor.length > MAX_DESCRIPCION) return;

    setForm((prev) => ({ ...prev, [campo]: valor }));
    setErrores((prev) => ({ ...prev, [campo]: "" }));
    setHayCambios(true);
  };

  const seleccionarPrioridad = (prioridad) => {
    setForm((prev) => ({ ...prev, prioridad }));
    setHayCambios(true);
  };

  const validarTodo = () => {
    const fechaSeleccionada = form.fechaLimite ? new Date(form.fechaLimite) : null;
    const ahora = new Date();
    ahora.setSeconds(0, 0);

    if (!form.nombre.trim()) {
      setErrores((prev) => ({
        ...prev,
        nombre: "El nombre es requerido para proceder.",
      }));
      return false;
    }

    if (fechaSeleccionada && Number.isNaN(fechaSeleccionada.getTime())) {
      setErrores((prev) => ({
        ...prev,
        fechaLimite: "La fecha límite no es válida.",
      }));
      return false;
    }

    if (fechaSeleccionada && fechaSeleccionada <= ahora) {
      setErrores((prev) => ({
        ...prev,
        fechaLimite: "La fecha límite debe ser posterior a la fecha actual.",
      }));
      return false;
    }

    if (miembros.length > 0 && !form.idUsuarioAsignado) {
      setErrores((prev) => ({
        ...prev,
        idUsuarioAsignado: "Debes seleccionar un miembro responsable.",
      }));
      return false;
    }
    return true;
  };

  // Escenario 8: el botón Guardar abre confirmación (previene doble clic)
  const handleGuardarClick = () => {
    if (loading) return;
    if (!validarTodo()) return;
    setMostrarConfirmacion(true);
  };

  // Confirmación real del guardado
  const handleConfirmarGuardado = async () => {
    setMostrarConfirmacion(false);
    await onGuardar(tarea.idTarea ?? tarea.id, {
      nombre: form.nombre.trim(),
      estado: form.estado,
      prioridad: form.prioridad,
      idUsuarioAsignado: form.idUsuarioAsignado ? Number(form.idUsuarioAsignado) : null,
      fechaLimite: form.fechaLimite
        ? new Date(form.fechaLimite).toISOString()
        : tarea.fechaLimite,
      descripcion: form.descripcion.trim(),
    });
  };

  // Escenario 7: cancelar descarta cambios
  const handleCancelar = () => {
    setMostrarConfirmacion(false);
    setHayCambios(false);
    onClose();
  };

  // ─── RENDER ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-40 flex items-center justify-center p-4"
        onClick={handleCancelar}
      >
        {/* ── Modal ── */}
        <div
          className="bg-white rounded-xl shadow-xl w-full max-w-lg z-50 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Header ── */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border">
            {/* Título editable o en lectura */}
            {bloqueo.todo ? (
              <h2 className="text-base font-semibold text-foreground flex-1 pr-4 truncate">
                {form.nombre}
              </h2>
            ) : (
              <div className="flex-1 pr-4">
                <input
                  type="text"
                  value={form.nombre}
                  onChange={handleChange("nombre")}
                  placeholder="Nombre de la tarea"
                  maxLength={MAX_TITULO}
                  disabled={loading}
                  className={`w-full text-base font-semibold text-foreground bg-transparent border-b-2 outline-none pb-1 transition-colors
                    ${errores.nombre
                      ? "border-error placeholder:text-error/50"
                      : "border-transparent focus:border-primary"
                    }`}
                />
                {errores.nombre && (
                  <p className="text-xs text-error mt-1 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {errores.nombre}
                  </p>
                )}
              </div>
            )}

            <button
              onClick={handleCancelar}
              disabled={loading}
              className="text-secondary hover:text-foreground transition-colors flex-shrink-0"
            >
              <X size={20} />
            </button>
          </div>

          {/* ── Banner modo lectura (Escenario 5) ── */}
          {bloqueo.todo && (
            <div className="mx-6 mt-4 flex items-center gap-2 bg-secondary/10 border border-secondary/20 rounded-lg px-3 py-2 text-xs text-secondary">
              <Lock size={13} />
              Esta tarea está completada y no puede modificarse.
            </div>
          )}

          {/* ── Cuerpo del formulario ── */}
          <div className="px-6 py-4 flex flex-col gap-4">

            {/* Fila: Estado + Prioridad */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-secondary uppercase tracking-wide">
                  Estado
                </label>
                <div className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground">
                  {estados.find((e) => e.nombre === form.estado)?.label || form.estado}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-secondary uppercase tracking-wide">
                  Prioridad
                </label>
                <div className="flex flex-wrap gap-2">
                  {prioridades.map((p) => {
                    const activa = form.prioridad === p.nombre;
                    return (
                      <button
                        key={p.nombre}
                        type="button"
                        onClick={() => seleccionarPrioridad(p.nombre)}
                        disabled={bloqueo.todo || loading}
                        className={`px-4 py-2 rounded-lg font-medium transition ${
                          activa
                            ? "bg-primary text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Fila: Asignado a + Fecha límite */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-secondary uppercase tracking-wide">
                  Asignado a
                </label>
                <select
                  value={form.idUsuarioAsignado}
                  onChange={handleChange("idUsuarioAsignado")}
                  disabled={bloqueo.todo || loading || miembros.length === 0}
                  className="border border-border rounded-lg px-3 py-2 text-sm text-foreground bg-white
                    focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                    disabled:bg-background disabled:text-secondary disabled:cursor-not-allowed transition-colors"
                >
                  <option value="">Selecciona un miembro</option>
                  {miembros.map((miembro) => (
                    <option key={miembro.usuarioId} value={miembro.usuarioId}>
                      {miembro.nombre}
                    </option>
                  ))}
                </select>
                {errores.idUsuarioAsignado && (
                  <p className="text-xs text-error mt-1 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {errores.idUsuarioAsignado}
                  </p>
                )}
              </div>

              {/* Escenario 4: fecha límite bloqueada en VENCIDA y COMPLETADA */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-secondary uppercase tracking-wide flex items-center gap-1">
                  Fecha límite
                  {bloqueo.fechaLimite && <Lock size={11} className="text-secondary/60" />}
                </label>
                <input
                  type="datetime-local"
                  value={form.fechaLimite}
                  onChange={handleChange("fechaLimite")}
                  disabled={bloqueo.fechaLimite || bloqueo.todo || loading}
                  min={obtenerMinDateTimeLocal()}
                  className="border border-border rounded-lg px-3 py-2 text-sm text-foreground bg-white
                    focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                    disabled:bg-background disabled:text-secondary disabled:cursor-not-allowed transition-colors"
                />
                {errores.fechaLimite && (
                  <p className="text-xs text-error mt-1 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {errores.fechaLimite}
                  </p>
                )}
              </div>
            </div>

            {/* Descripción */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-secondary uppercase tracking-wide">
                Descripción
              </label>
              <textarea
                value={form.descripcion}
                onChange={handleChange("descripcion")}
                disabled={bloqueo.todo || loading}
                placeholder="Descripción de la tarea (opcional)"
                rows={4}
                maxLength={MAX_DESCRIPCION}
                className="border border-border rounded-lg px-3 py-2 text-sm text-foreground bg-white resize-none
                  focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                  disabled:bg-background disabled:text-secondary disabled:cursor-not-allowed transition-colors"
              />
              <p className="text-xs text-secondary text-right">
                {form.descripcion.length}/{MAX_DESCRIPCION}
              </p>
            </div>

            {/* Banner cambios sin guardar */}
            {haycambios && !bloqueo.todo && (
              <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-xs text-yellow-700">
                <AlertCircle size={13} />
                Tienes cambios sin guardar
              </div>
            )}
          </div>

          {/* ── Footer con acciones ── */}
          <div className="px-6 pb-5 flex items-center gap-3">
            {!bloqueo.todo && (
              <Button
                variant="primary"
                onClick={handleGuardarClick}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Save size={15} />
                {loading ? "Guardando..." : "Guardar"}
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={handleCancelar}
              disabled={loading}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </div>

      {/* ── Modal de confirmación de guardado (Escenario 8) ── */}
      <ConfirmationModal
        isOpen={mostrarConfirmacion}
        icon={<Save size={24} className="text-primary" />}
        title="¿Guardar cambios?"
        description="Se actualizará la información de la tarea con los datos ingresados."
        confirmText="Guardar"
        cancelText="Volver"
        onConfirm={handleConfirmarGuardado}
        onCancel={() => setMostrarConfirmacion(false)}
        variant="primary"
      />
    </>
  );
}
