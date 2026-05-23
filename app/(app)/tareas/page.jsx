"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useGroup } from "@/hooks/useGroup";
import { useTasks } from "@/hooks/useTasks";
import AppLayout from "@/components/layout/AppLayout";
import Button from "@/components/ui/Button";
import FilterBar from "@/components/ui/FilterBar";
import TaskBoard from "@/components/ui/TaskBoard";
import { FileSearch } from "lucide-react";

export default function TareasPage() {
  const router = useRouter();
  const { usuario, isAuthenticated, logout } = useAuth();
  const { grupo, miembros, cargarGrupo } = useGroup();
  const { tareas, loading, error, cargarTareas } = useTasks();

  const [filtros, setFiltros] = useState({
    estados: [],
    prioridades: [],
    miembros: [],
  });

  const inicializarDatos = useCallback(async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    await cargarGrupo();
  }, [isAuthenticated, router, cargarGrupo]);

  useEffect(() => {
    inicializarDatos();
  }, [inicializarDatos]);

  useEffect(() => {
    if (grupo) {
      cargarTareas(grupo.id);
    }
  }, [grupo, cargarTareas]);

  const todasLasTareasFiltradas = useMemo(() => {
    return tareas.filter((tarea) => {
      if (
        filtros.estados.length > 0 &&
        !filtros.estados.includes(tarea.estadoId)
      )
        return false;
      if (
        filtros.prioridades.length > 0 &&
        !filtros.prioridades.includes(tarea.prioridadId)
      )
        return false;
      if (
        filtros.miembros.length > 0 &&
        !filtros.miembros.includes(tarea.asignadoA)
      )
        return false;
      return true;
    });
  }, [tareas, filtros]);

  const tieneFiltrosActivos =
    filtros.estados.length > 0 ||
    filtros.prioridades.length > 0 ||
    filtros.miembros.length > 0;

  const miembrosFiltro = useMemo(() => {
    if (grupo?.miembros) return grupo.miembros;
    if (!miembros || miembros.length === 0) return [];
    return miembros.filter((m) => m && m.nombre);
  }, [grupo, miembros]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const navbarContent = (
    <>
      {usuario && (
        <span className="text-sm text-secondary">
          {usuario.nombre}
        </span>
      )}
      <Button variant="secondary" onClick={handleLogout} className="text-sm">
        Cerrar sesión
      </Button>
    </>
  );

  if (!isAuthenticated) return null;

  return (
    <AppLayout navbarContent={navbarContent}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2>Tablero de tareas</h2>
            {grupo && (
              <p className="text-sm text-secondary mt-1">
                Grupo: {grupo.nombre}
              </p>
            )}
          </div>
        </div>

        <FilterBar
          filtros={filtros}
          onChangeFiltros={setFiltros}
          miembros={miembrosFiltro}
        />

        {loading && (
          <div className="flex justify-center py-12">
            <p className="text-secondary">Cargando tareas...</p>
          </div>
        )}

        {error && (
          <div className="card bg-error-light text-error text-sm text-center py-6">
            {error}
          </div>
        )}

        {!loading && !error && todasLasTareasFiltradas.length === 0 && (
          <div className="card flex flex-col items-center justify-center py-12 text-center">
            <FileSearch size={48} className="text-secondary-light mb-4" />
            <h3 className="text-lg font-semibold text-secondary mb-1">
              {tieneFiltrosActivos
                ? "No hay tareas que coincidan con los filtros"
                : "No hay tareas en el tablero"}
            </h3>
            <p className="text-sm text-secondary-light max-w-md">
              {tieneFiltrosActivos
                ? "Intenta modificar o limpiar los filtros para ver más resultados."
                : "Cuando se creen tareas en tu grupo familiar, aparecerán aquí organizadas por estado."}
            </p>
          </div>
        )}

        {!loading && !error && todasLasTareasFiltradas.length > 0 && (
          <TaskBoard tareas={todasLasTareasFiltradas} />
        )}
      </div>
    </AppLayout>
  );
}
