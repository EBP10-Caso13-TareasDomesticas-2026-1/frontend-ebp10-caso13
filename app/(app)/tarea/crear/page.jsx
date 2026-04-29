"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import LogOut from "@/components/ui/LogOut";
import { useAuth } from "@/hooks/useAuth";
import { useGroup } from "@/hooks/useGroup";
import taskService from "@/services/taskService";
import { getPrioridades } from "@/lib/taskHelpers";

const MAX_TITULO_LENGTH = 50;
const MAX_DESCRIPCION_LENGTH = 180;

function CrearTareaContent() {
  const router = useRouter();
  const { usuario, token, logout } = useAuth();
  const { grupo, miembros, rolActual, loading: groupLoading, cargarGrupo } = useGroup();
  // ─── Estado del formulario ───────────────────────────────────────
  const [titulo, setTitulo] = useState("");
  const [asignadoA, setAsignadoA] = useState("");
  const [prioridad, setPrioridad] = useState("MEDIA");
  const [fechaLimite, setFechaLimite] = useState("");
  const [descripcion, setDescripcion] = useState("");

  // ─── Estado de validación y UI ───────────────────────────────────
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loadingAttempted, setLoadingAttempted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ─── Cargar grupo si no está disponible ──────────────────────────
  const needsToLoad = mounted && !grupo && usuario && token;
  
  useEffect(() => {
    if (needsToLoad && !loadingAttempted) {
      setLoadingAttempted(true);
      cargarGrupo(usuario.idUsuario, token);
    } else if (mounted && grupo && !loadingAttempted) {
      // Si ya existe grupo al montar, marcar intento como completado
      setLoadingAttempted(true);
    }
  }, [needsToLoad, loadingAttempted, usuario, token, cargarGrupo, mounted, grupo]);

  // ─── Verificar que sea administrador ───────────────────────────
  const esAdmin = rolActual === "admin";

  // Si no tiene grupo o no es admin, redirigir
  useEffect(() => {
    if (!mounted || !loadingAttempted) return;
    
    // Si estamos cargando, esperar
    if (groupLoading) return;

    // Ya intentamos cargar y terminó
    // Si no tiene grupo, ir a bienvenida
    if (!grupo?.id) {
      router.replace("/bienvenida");
    }
    // Si tiene grupo pero no es admin, ir a tablero
    else if (!esAdmin) {
      router.replace("/tablero");
    }
  }, [loadingAttempted, groupLoading, grupo, esAdmin, mounted, router]);

  // ─── Handlers ─────────────────────────────────────────────────────

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const validateForm = () => {
    const newErrors = {};

    // Título obligatorio y longitud
    if (!titulo.trim()) {
      newErrors.titulo = "El nombre de la tarea es obligatorio.";
    } else if (titulo.length > MAX_TITULO_LENGTH) {
      newErrors.titulo = `El título no puede superar ${MAX_TITULO_LENGTH} caracteres.`;
    }

    // Miembro responsable obligatorio
    if (!asignadoA) {
      newErrors.asignadoA = "Debes seleccionar un miembro responsable.";
    }

    // Fecha límite obligatoria
    if (!fechaLimite) {
      newErrors.fechaLimite = "La fecha y hora límite es obligatoria.";
    } else {
      // Validar que la fecha sea posterior a la actual
      // Parsear manualmente datetime-local para evitar problemas de zona horaria
      const [fecha, hora] = fechaLimite.split("T");
      const [year, month, day] = fecha.split("-").map(Number);
      const [hours, minutes] = hora.split(":").map(Number);
      
      // Crear fecha en zona horaria local
      const fechaSeleccionada = new Date(year, month - 1, day, hours, minutes, 0, 0);
      
      // Ahora actual truncado a minutos para consistencia
      const ahora = new Date();
      ahora.setSeconds(0, 0);
      
      if (fechaSeleccionada <= ahora) {
        newErrors.fechaLimite = "La fecha y hora límite debe ser posterior a la actual.";
      }
    }

    // Descripción longitud (opcional, pero si existe debe respetar límite)
    if (descripcion.length > MAX_DESCRIPCION_LENGTH) {
      newErrors.descripcion = `La descripción no puede superar ${MAX_DESCRIPCION_LENGTH} caracteres.`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCrearTarea = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Convertir fechaLimite a ISO (normalizar zona horaria)
      const fechaISO = new Date(fechaLimite).toISOString();

      const dataTarea = {
        nombre: titulo.trim(),
        descripcion: descripcion.trim() || null,
        idUsuarioAsignado: Number(asignadoA),
        prioridad,
        fechaLimite: fechaISO,
      };

      await taskService.crearTarea(dataTarea, token, usuario.idUsuario);

      // Mostrar mensaje de confirmación (opcional: podrías usar un toast)
      // Por ahora, redirigimos directamente al tablero
      router.push("/tablero");
    } catch (error) {
      setErrors({
        submit: error.message || "Error al crear la tarea. Intenta nuevamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = () => {
    router.push("/tablero");
  };

  // ─── Obtener fecha/hora mínima permitida ───────────────────────
  const getMinDateTime = () => {
    const ahora = new Date();
    ahora.setSeconds(0, 0); // Truncar a minutos
    
    // Convertir a formato YYYY-MM-DDTHH:mm (datetime-local)
    const year = ahora.getFullYear();
    const month = String(ahora.getMonth() + 1).padStart(2, "0");
    const day = String(ahora.getDate()).padStart(2, "0");
    const hours = String(ahora.getHours()).padStart(2, "0");
    const minutes = String(ahora.getMinutes()).padStart(2, "0");
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // ─── Renderizado ──────────────────────────────────────────────────

  if (!mounted || groupLoading || !esAdmin) {
    return null;
  }

  const prioridades = getPrioridades();
  const miembrosDisponibles = miembros || [];

  return (
    <AppLayout
      navbarContent={
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {grupo?.nombre}
          </span>
          <Button variant="secondary" disabled onClick={() => {}}>
            Perfil
          </Button>
          <Button variant="primary" onClick={() => setShowLogoutModal(true)}>
            Cerrar sesión
          </Button>
        </div>
      }
    >
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="form-container">
          <div className="flex flex-col items-center gap-6 w-full">
            {/* ─── Encabezado ─────────────────────────────────────── */}
            <div className="flex flex-col items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">Nueva Tarea</h1>
              <p className="text-sm text-secondary text-center">
                Organiza las tareas del hogar
              </p>
            </div>

            {/* ─── Formulario ─────────────────────────────────────── */}
            <form onSubmit={handleCrearTarea} className="flex flex-col gap-4 w-full">
          {/* ─── NOMBRE DE LA TAREA ─────────────────────────────────── */}
          <div>
            <Input
              label="Nombre de la tarea"
              placeholder="Ej. Limpiar la cocina"
              type="text"
              value={titulo}
              onChange={(e) => {
                const newValue = e.target.value.slice(0, MAX_TITULO_LENGTH);
                setTitulo(newValue);
                if (errors.titulo) setErrors({ ...errors, titulo: "" });
              }}
              error={errors.titulo || ""}
              maxLength={MAX_TITULO_LENGTH}
              disabled={loading}
            />
            <p className="text-xs text-secondary mt-1">
              {titulo.length}/{MAX_TITULO_LENGTH}
            </p>
          </div>
          <div>
            <label htmlFor="asignado-a" className="block label-base mb-2">
              Asignado a
            </label>
            <select
              id="asignado-a"
              value={asignadoA}
              onChange={(e) => {
                setAsignadoA(e.target.value);
                if (errors.asignadoA) setErrors({ ...errors, asignadoA: "" });
              }}
              disabled={loading}
              className={errors.asignadoA ? "input-error" : "input-base"}
            >
              <option value="">Selecciona un miembro</option>
              {miembrosDisponibles.map((miembro) => (
                <option key={miembro.usuarioId} value={miembro.usuarioId}>
                  {miembro.nombre}
                </option>
              ))}
            </select>
            {errors.asignadoA && (
              <p className="error-message">{errors.asignadoA}</p>
            )}
          </div>

          {/* ─── PRIORIDAD ──────────────────────────────────────────── */}
          <div>
            <label htmlFor="prioridad" className="block label-base mb-2">
              Prioridad
            </label>
            <div className="flex gap-2 justify-center">
              {prioridades.map((prio) => (
                <button
                  key={prio.nombre}
                  type="button"
                  onClick={() => setPrioridad(prio.nombre)}
                  disabled={loading}
                  className={`px-6 py-2 rounded font-medium transition ${
                    prioridad === prio.nombre
                      ? "bg-primary text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {prio.label}
                </button>
              ))}
            </div>
          </div>

          {/* ─── FECHA Y HORA LÍMITE ────────────────────────────────── */}
          <div>
            <label htmlFor="fecha-limite" className="block label-base mb-2">
              Fecha y hora límite
            </label>
            <input
              id="fecha-limite"
              type="datetime-local"
              value={fechaLimite}
              onChange={(e) => {
                setFechaLimite(e.target.value);
                if (errors.fechaLimite) setErrors({ ...errors, fechaLimite: "" });
              }}
              disabled={loading}
              min={getMinDateTime()}
              className={errors.fechaLimite ? "input-error" : "input-base"}
            />
            {errors.fechaLimite && (
              <p className="error-message">{errors.fechaLimite}</p>
            )}
          </div>

          {/* ─── DESCRIPCIÓN (OPCIONAL) ───────────────────────────── */}
          <div>
            <label htmlFor="descripcion" className="block label-base mb-2">
              Descripción (opcional)
            </label>
            <textarea
              id="descripcion"
              placeholder="Detalles adicionales sobre la tarea..."
              value={descripcion}
              onChange={(e) => {
                const newValue = e.target.value.slice(0, MAX_DESCRIPCION_LENGTH);
                setDescripcion(newValue);
                if (errors.descripcion) setErrors({ ...errors, descripcion: "" });
              }}
              disabled={loading}
              maxLength={MAX_DESCRIPCION_LENGTH}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none ${
                errors.descripcion
                  ? "border-error focus:ring-error"
                  : "border-gray-300 focus:ring-primary"
              } disabled:bg-gray-100 disabled:cursor-not-allowed`}
            />
            <p className="text-xs text-secondary mt-1">
              {descripcion.length}/{MAX_DESCRIPCION_LENGTH}
            </p>
            {errors.descripcion && (
              <p className="error-message">{errors.descripcion}</p>
            )}
          </div>

          {/* ─── ERRORES GENERALES ──────────────────────────────────── */}
          {errors.submit && (
            <div className="bg-error-light border border-error text-error p-3 rounded">
              {errors.submit}
            </div>
          )}

          {/* ─── BOTONES ────────────────────────────────────────────── */}
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full mt-2"
          >
            {loading ? "Creando tarea..." : "Crear Tarea"}
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={handleCancelar}
            disabled={loading}
            className="w-full"
          >
            Cancelar
          </Button>
            </form>
          </div>
        </div>
      </div>

      {/* ─── MODAL LOGOUT ───────────────────────────────────────────── */}
      <LogOut
        isOpen={showLogoutModal}
        title="Cerrar sesión"
        description="¿Deseas cerrar sesión?"
        confirmText="Cerrar sesión"
        cancelText="Cancelar"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
        variant="danger"
      />
    </AppLayout>
  );
}

export default function CrearTareaPage() {
  return (
    <ProtectedRoute>
      <CrearTareaContent />
    </ProtectedRoute>
  );
}
