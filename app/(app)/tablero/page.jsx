"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import TaskColumn from "@/components/ui/TaskColumn";
import TaskDetailModal from "@/components/ui/TaskDetailModal";
import TaskEditModal from "@/components/ui/TaskEditModal";
import Button from "@/components/ui/Button";
import LogOut from "@/components/ui/LogOut";
import FilterBar from "@/components/ui/FilterBar";
import { useAuth } from "@/hooks/useAuth";
import { useGroup } from "@/hooks/useGroup";
import taskService from "@/services/taskService";
import { estados as estadosList } from "@/mocks/estados";
import { prioridades as prioridadesList } from "@/mocks/prioridades";
import { FileSearch } from "lucide-react";

function TableroContent() {
  const router = useRouter();
  const { usuario, token, logout } = useAuth();
  const { grupo, rolActual, loading: loadingGroup } = useGroup();

  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingEstado, setLoadingEstado] = useState(false);
  const [error, setError] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [filtros, setFiltros] = useState({ estados: [], prioridades: [], miembros: [] });

  // ─── Estado para TaskDetailModal ─────────────────────────────
  const [tareaSeleccionada, setTareaSeleccionada] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [tareaEnEdicion, setTareaEnEdicion] = useState(null);
  const [loadingEliminar, setLoadingEliminar] = useState(false);
  const [loadingEdicion, setLoadingEdicion] = useState(false);

  const esAdmin =
    rolActual === "admin" ||
    grupo?.miembros?.some((miembro) => {
      if (miembro.usuarioId !== usuario?.idUsuario) return false;
      if (miembro.rolId === 1) return true;
      const nombre = (miembro.rol?.nombre || "").toString().toLowerCase();
      return nombre === "admin" || nombre === "administrador";
    });

  const enriquecerTareasConMiembros = (tareasData, miembros = []) => {
    return tareasData.map((tarea) => {
      const usuarioAsignado = miembros.find(
        (m) => m.usuarioId === tarea.idUsuarioAsignado
      );

      // Si no encontramos al miembro en la lista pero la tarea ya tiene
      // `asignadoA`, interpretamos que es un ex-miembro y lo marcamos.
      if (!usuarioAsignado && tarea.asignadoA) {
        return {
          ...tarea,
          asignadoA: {
            ...tarea.asignadoA,
            esExMiembro: true,
          },
        };
      }

      return {
        ...tarea,
        asignadoA: usuarioAsignado
          ? {
              id: usuarioAsignado.usuarioId,
              nombre: usuarioAsignado.nombre,
              correo: usuarioAsignado.correo,
              fotoPerfil: usuarioAsignado.fotoPerfil,
              esExMiembro: false,
            }
          : tarea.asignadoA || null,
      };
    });
  };

  // ─── Cargar tareas ───────────────────────────────────────────

  useEffect(() => {
    const cargarTareas = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      if (loadingGroup) return;
      if (!grupo?.id) {
        setLoading(false);
        router.replace("/bienvenida");
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const tareasData = await taskService.obtenerTareasGrupo(
          grupo.id,
          token
        );
        // Enriquecer tareas con miembros y normalizar IDs de estado/prioridad
        const tareasEnriquecidas = enriquecerTareasConMiembros(
          tareasData,
          grupo.miembros || []
        ).map((t) => {
          const estadoNombre = String(t.estado || "").toUpperCase().trim();
          const prioridadNombre = String(t.prioridad || "").toUpperCase().trim();
          const estadoObj = estadosList.find(
            (e) => String(e.nombre || "").toUpperCase().trim() === estadoNombre
          );
          const prioridadObj = prioridadesList.find(
            (p) => String(p.nombre || "").toUpperCase().trim() === prioridadNombre
          );
          return {
            ...t,
            estadoId: estadoObj?.id ?? null,
            prioridadId: prioridadObj?.id ?? null,
          };
        });
        setTareas(tareasEnriquecidas);
      } catch (err) {
        console.error("Error cargando tareas:", err);
        setError(err.message || "Error al cargar tareas");
      } finally {
        setLoading(false);
      }
    };
    cargarTareas();
  }, [grupo?.id, grupo?.miembros, token, router, loadingGroup]);

  // ─── Helpers de ordenamiento ─────────────────────────────────

  const getPrioridadNum = (prioridad) => {
    const map = { ALTA: 1, MEDIA: 2, BAJA: 3 };
    return map[prioridad] || 99;
  };

  const ordenarTareas = (listaTareas) => {
    return [...listaTareas].sort((a, b) => {
      const prioridadDiff =
        getPrioridadNum(a.prioridad) - getPrioridadNum(b.prioridad);
      if (prioridadDiff !== 0) return prioridadDiff;
      if (a.fechaLimite && b.fechaLimite) {
        return new Date(a.fechaLimite) - new Date(b.fechaLimite);
      }
      if (a.fechaLimite) return -1;
      if (b.fechaLimite) return 1;
      return 0;
    });
  };

  const clasificarTareas = (listaTareas) => {
    const pendientes = listaTareas.filter(
      (t) => t.estado === "PENDIENTE" || t.estado === "VENCIDA"
    );
    const enProgreso = listaTareas.filter((t) => t.estado === "EN_PROGRESO");
    const completadas = listaTareas.filter((t) => t.estado === "COMPLETADA");
    return {
      pendientes: ordenarTareas(pendientes),
      enProgreso: ordenarTareas(enProgreso),
      completadas: ordenarTareas(completadas),
    };
  };

  const tareasFiltradas = useMemo(() => {
    const estadosIds = filtros.estados.map((i) => String(i));
    const prioridadesIds = filtros.prioridades.map((i) => String(i));
    const miembrosIds = filtros.miembros.map((i) => String(i));

    return tareas.filter((t) => {
      if (estadosIds.length > 0 && !estadosIds.includes(String(t.estadoId))) return false;
      if (prioridadesIds.length > 0 && !prioridadesIds.includes(String(t.prioridadId))) return false;
      if (miembrosIds.length > 0 && !miembrosIds.includes(String(t.idUsuarioAsignado))) return false;
      return true;
    });
  }, [tareas, filtros]);

  const tieneFiltrosActivos =
    filtros.estados.length > 0 || filtros.prioridades.length > 0 || filtros.miembros.length > 0;

  const { pendientes, enProgreso, completadas } = clasificarTareas(tareasFiltradas);

  // ─── Handlers ────────────────────────────────────────────────

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const onCambiarEstado = async (idTarea, nuevoEstado, fechaLimite = null) => {
    const prevTareas = tareas;
    try {
      setLoadingEstado(true);
      setError(null);
      setTareas((prev) =>
        prev.map((t) =>
          t.idTarea === idTarea
            ? { ...t, estado: nuevoEstado, ...(fechaLimite ? { fechaLimite } : {}) }
            : t
        )
      );
      await taskService.actualizarTarea(
        idTarea,
        { estado: nuevoEstado, ...(fechaLimite ? { fechaLimite } : {}) },
        token
      );
    } catch (err) {
      console.error("Error cambiando estado:", err);
      setError("No se pudo actualizar la tarea. Intenta nuevamente.");
      try {
        const tareasData = await taskService.obtenerTareasGrupo(grupo.id, token);
        const tareasEnriquecidas = enriquecerTareasConMiembros(
          tareasData,
          grupo?.miembros || []
        );
        setTareas(tareasEnriquecidas);
      } catch {
        setTareas(prevTareas);
      }
    } finally {
      setLoadingEstado(false);
    }
  };
  /**
   * Abre el modal de detalle al hacer clic en una tarjeta.
   * Solo el admin puede ver acciones de eliminar/editar (controlado en TaskDetailModal).
   */
  const handleAbrirDetalle = (tarea) => {
    setTareaSeleccionada(tarea);
    setShowDetailModal(true);
  };

  const handleCerrarDetalle = () => {
    setShowDetailModal(false);
    setTareaSeleccionada(null);
  };

  const handleAbrirEdicion = (tarea) => {
    setTareaEnEdicion(tarea);
    setShowDetailModal(false);
    setShowEditModal(true);
  };

  const handleCerrarEdicion = () => {
    setShowEditModal(false);
    setTareaEnEdicion(null);
    if (tareaSeleccionada) {
      setShowDetailModal(true);
    }
  };

  const handleGuardarEdicion = async (idTarea, datosActualizados) => {
    const prevTareas = tareas;
    try {
      setLoadingEdicion(true);
      setError(null);

      const tareaActualizada = await taskService.actualizarTarea(
        idTarea,
        datosActualizados,
        token
      );

      const tareaConMiembros = enriquecerTareasConMiembros(
        [tareaActualizada],
        grupo?.miembros || []
      )[0];

      setTareas((prev) =>
        prev.map((t) => (t.idTarea === idTarea ? { ...t, ...tareaConMiembros } : t))
      );
      setTareaSeleccionada(tareaConMiembros);
      setTareaEnEdicion(null);
      setShowEditModal(false);
      setShowDetailModal(true);
    } catch (err) {
      console.error("Error guardando tarea:", err);
      setError(err.message || "No se pudo guardar la tarea. Intenta nuevamente.");
      setTareas(prevTareas);
      throw err;
    } finally {
      setLoadingEdicion(false);
    }
  };

  /**
   * HUS-007: Eliminar tarea (soft delete).
   * Validación de rol admin se hace también aquí (HA-02: guardia frontend).
   * Si no es admin, la función no procede y muestra error de acceso denegado.
   */
  const handleEliminarTarea = async (idTarea) => {
    // Guardia de seguridad frontend (HA-02)
    if (!esAdmin) {
      setError("Acceso denegado. Solo el administrador puede eliminar tareas.");
      return;
    }

    const prevTareas = tareas;
    try {
      setLoadingEliminar(true);
      setError(null);

      // Optimistic update: ocultar la tarea del tablero inmediatamente
      setTareas((prev) => prev.filter((t) => t.idTarea !== idTarea));

      // Llamada al servicio de soft delete
      await taskService.eliminarTarea(idTarea, token);
    } catch (err) {
      console.error("Error eliminando tarea:", err);

      const mensajeError =
        err?.status === 403 || err?.status === 401
          ? "Acceso denegado."
          : "No se pudo eliminar la tarea. Intenta nuevamente.";

      setError(mensajeError);

      // Rollback del optimistic update
      try {
        const tareasData = await taskService.obtenerTareasGrupo(grupo.id, token);
        const tareasEnriquecidas = enriquecerTareasConMiembros(
          tareasData,
          grupo?.miembros || []
        );
        setTareas(tareasEnriquecidas);
      } catch {
        setTareas(prevTareas);
      }

      // Re-lanzar para que TaskDetailModal capture y cierre el modal de confirmación
      throw err;
    } finally {
      setLoadingEliminar(false);
    }
  };

  // ─── Navbar content ───────────────────────────────────────────
  const navbarContent = (
    <div className="flex items-center gap-4">
      <span className="text-sm text-gray-600">{grupo?.nombre}</span>
      <Button
        variant="secondary"
        onClick={() => router.push("/grupo/detalles")}
      >
        Detalles del Grupo
      </Button>
      <Button variant="primary" onClick={() => setShowLogoutModal(true)}>
        Cerrar sesión
      </Button>
    </div>
  );

  // ─── Render ──────────────────────────────────────────────────

  return (
    <AppLayout navbarContent={navbarContent} fullWidth>
      <div className="w-full py-8 px-4 md:px-6">
        {/* Encabezado */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Tablero de Tareas
            </h1>
            <p className="text-gray-600">
              {esAdmin
                ? "Gestiona todas las tareas del hogar"
                : "Organiza y gestiona tus tareas asignadas"}
            </p>
          </div>

          {esAdmin && (
            <div className="flex gap-2 w-full sm:w-auto flex-col sm:flex-row">
              <Button
                variant="primary"
                onClick={() => router.push("/tarea/crear")}
                className="w-full sm:w-auto"
              >
                + Nueva Tarea
              </Button>
            </div>
          )}
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="mb-6">
          <FilterBar
            filtros={filtros}
            onChangeFiltros={setFiltros}
            miembros={grupo?.miembros || []}
          />
        </div>

        

        {/* Sin resultados */}
        {!loading && !loadingGroup && tareasFiltradas.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-lg border border-border">
            <FileSearch size={48} className="text-secondary-light mb-4" />
            <h3 className="text-lg font-semibold text-secondary mb-1">
              {tieneFiltrosActivos
                ? "No hay tareas que coincidan con los filtros"
                : "No hay tareas en el tablero"}
            </h3>
            <p className="text-sm text-secondary-light max-w-md">
              {tieneFiltrosActivos
                ? "Intenta modificar o limpiar los filtros para ver mas resultados."
                : "Crea una nueva tarea para comenzar a organizar tu hogar."}
            </p>
          </div>
        )}

        {/* Loading */}
        {loading || loadingGroup ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-gray-500">Cargando tareas...</div>
          </div>
        ) : (
          /* Tablero Kanban */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <TaskColumn
              titulo="Pendientes"
              tareas={pendientes}
              esAdmin={esAdmin}
              usuarioId={usuario?.idUsuario}
              onCambiarEstado={onCambiarEstado}
              onVerDetalle={handleAbrirDetalle}
              loading={loadingEstado}
            />
            <TaskColumn
              titulo="En progreso"
              tareas={enProgreso}
              esAdmin={esAdmin}
              usuarioId={usuario?.idUsuario}
              onCambiarEstado={onCambiarEstado}
              onVerDetalle={handleAbrirDetalle}
              loading={loadingEstado}
            />
            <TaskColumn
              titulo="Completadas"
              tareas={completadas}
              esAdmin={esAdmin}
              usuarioId={usuario?.idUsuario}
              onCambiarEstado={onCambiarEstado}
              onVerDetalle={handleAbrirDetalle}
              loading={loadingEstado}
            />
          </div>
        )}
      </div>

      {/* Modal de detalle de tarea (HU-010 + HUS-007) */}
      <TaskDetailModal
        isOpen={showDetailModal}
        tarea={tareaSeleccionada}
        esAdmin={esAdmin}
        loading={loadingEliminar}
        onClose={handleCerrarDetalle}
        onEliminar={handleEliminarTarea}
        onEditar={handleAbrirEdicion}
      />

      <TaskEditModal
        isOpen={showEditModal}
        tarea={tareaEnEdicion}
        miembros={grupo?.miembros || []}
        loading={loadingEdicion}
        onClose={handleCerrarEdicion}
        onGuardar={handleGuardarEdicion}
      />

      {/* Modal logout */}
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

export default function TableroPage() {
  return (
    <ProtectedRoute>
      <TableroContent />
    </ProtectedRoute>
  );
}
