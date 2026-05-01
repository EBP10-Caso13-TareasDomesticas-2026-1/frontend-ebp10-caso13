"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import TaskColumn from "@/components/ui/TaskColumn";
import Button from "@/components/ui/Button";
import LogOut from "@/components/ui/LogOut";
import { useAuth } from "@/hooks/useAuth";
import { useGroup } from "@/hooks/useGroup";
import taskService from "@/services/taskService";

function TableroContent() {
  const router = useRouter();
  const { usuario, token, logout } = useAuth();
  const { grupo, rolActual, loading: loadingGroup } = useGroup();

  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingEstado, setLoadingEstado] = useState(false);
  const [error, setError] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const esAdmin =
    rolActual === "admin" ||
    grupo?.miembros?.some(
      (miembro) =>
        miembro.usuarioId === usuario?.idUsuario &&
        (miembro.rol?.nombre === 'ADMINISTRADOR')
    );

  const enriquecerTareasConMiembros = (tareasData, miembros = []) => {
    return tareasData.map((tarea) => {
      const usuarioAsignado = miembros.find(
        (m) => m.usuarioId === tarea.idUsuarioAsignado,
      );

      return {
        ...tarea,
        asignadoA: usuarioAsignado
          ? {
            id: usuarioAsignado.usuarioId,
            nombre: usuarioAsignado.nombre,
            correo: usuarioAsignado.correo,
            fotoPerfil: usuarioAsignado.fotoPerfil,
          }
          : null,
      };
    });
  };

  // ─── Cargar tareas y enriquecerlas ───────────────────────────

  useEffect(() => {
    const cargarTareas = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      if (loadingGroup) {
        return;
      }

      if (!grupo?.id) {
        setLoading(false);
        router.replace("/bienvenida");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Obtener tareas del grupo
        const tareasData = await taskService.obtenerTareasGrupo(
          grupo.id,
          token,
        );

        // Enriquecer tareas con miembros ya disponibles en GroupContext
        const tareasEnriquecidas = enriquecerTareasConMiembros(
          tareasData,
          grupo.miembros || [],
        );

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

  // ─── Lógica de ordenamiento y clasificación ──────────────────

  const getPrioridadNum = (prioridad) => {
    const map = { ALTA: 1, MEDIA: 2, BAJA: 3 };
    return map[prioridad] || 99;
  };

  const ordenarTareas = (listaTareas) => {
    return [...listaTareas].sort((a, b) => {
      // 1. Por prioridad (mayor urgencia primero)
      const prioridadDiff =
        getPrioridadNum(a.prioridad) - getPrioridadNum(b.prioridad);
      if (prioridadDiff !== 0) return prioridadDiff;

      // 2. Por fecha límite (más cercana primero)
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
      (t) => t.estado === "PENDIENTE" || t.estado === "VENCIDA",
    );
    const enProgreso = listaTareas.filter((t) => t.estado === "EN_PROGRESO");
    const completadas = listaTareas.filter((t) => t.estado === "COMPLETADA");

    return {
      pendientes: ordenarTareas(pendientes),
      enProgreso: ordenarTareas(enProgreso),
      completadas: ordenarTareas(completadas),
    };
  };

  const { pendientes, enProgreso, completadas } = clasificarTareas(tareas);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  // ─── Manejar cambio de estado (optimistic UI) ─────────────────

  const onCambiarEstado = async (idTarea, nuevoEstado, fechaLimite = null) => {
    const prevTareas = tareas;

    try {
      setLoadingEstado(true);
      setError(null);

      // 1. Optimistic update
      setTareas((prev) =>
        prev.map((t) =>
          t.idTarea === idTarea
            ? {
              ...t,
              estado: nuevoEstado,
              ...(fechaLimite ? { fechaLimite } : {}),
            }
            : t
        )
      );

      // 2. Llamar al backend
      await taskService.actualizarTarea(
        idTarea,
        {
          estado: nuevoEstado,
          ...(fechaLimite ? { fechaLimite } : {}),
        },
        token,
      );
    } catch (err) {
      console.error("Error cambiando estado:", err);
      setError("No se pudo actualizar la tarea. Intenta nuevamente.");

      // Intentar sincronizar con datos reales; si falla, hacer rollback estable
      try {
        const tareasData = await taskService.obtenerTareasGrupo(
          grupo.id,
          token,
        );
        const tareasEnriquecidas = enriquecerTareasConMiembros(
          tareasData,
          grupo?.miembros || [],
        );
        setTareas(tareasEnriquecidas);
      } catch (reloadError) {
        console.error("Error recargando tareas tras fallo:", reloadError);
        setTareas(prevTareas);
      }
    } finally {
      setLoadingEstado(false);
    }
  };

  // ─── Navbar content ───────────────────────────────────────────

  const navbarContent = (
    <div className="flex items-center gap-4">
      <span className="text-sm text-gray-600">
        {grupo?.nombre}
      </span>
      <Button variant="secondary" disabled onClick={() => { }}>
        Perfil
      </Button>
      <Button variant="primary" onClick={() => setShowLogoutModal(true)}>
        Cerrar sesión
      </Button>
    </div>
  );

  // ─── Renderizar ──────────────────────────────────────────────

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
              <Button
                variant="secondary"
                onClick={() => {
                  console.log("Grupo:", grupo);
                  const codigo = grupo.codigoInvitacion || grupo.miembros?.[0]?.grupo?.codigoInvitacion || grupo.grupo?.codigoInvitacion || "";
                  router.push(`/grupo/invitar?codigo=${codigo}`);
                }}
                className="w-full sm:w-auto"
              >
              Invitar miembros
              </Button>
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Loading */}
        {(loading || loadingGroup) ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-gray-500">Cargando tareas...</div>
          </div>
        ) : (
          /* Kanban board */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <TaskColumn
              titulo="Pendientes"
              tareas={pendientes}
              esAdmin={esAdmin}
              usuarioId={usuario?.idUsuario}
              onCambiarEstado={onCambiarEstado}
              loading={loadingEstado}
            />

            <TaskColumn
              titulo="En progreso"
              tareas={enProgreso}
              esAdmin={esAdmin}
              usuarioId={usuario?.idUsuario}
              onCambiarEstado={onCambiarEstado}
              loading={loadingEstado}
            />

            <TaskColumn
              titulo="Completadas"
              tareas={completadas}
              esAdmin={esAdmin}
              usuarioId={usuario?.idUsuario}
              onCambiarEstado={onCambiarEstado}
              loading={loadingEstado}
            />
          </div>
        )}
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

export default function TableroPage() {
  return (
    <ProtectedRoute>
      <TableroContent />
    </ProtectedRoute>
  );
}
