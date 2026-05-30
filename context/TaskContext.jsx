"use client";

import { createContext, useState, useCallback } from "react";
import tareaService from "@/services/tareaService";

const TaskContext = createContext(null);

export function TaskProvider({ children }) {
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cargarTareas = useCallback(async (grupoId, token) => {
    setLoading(true);
    setError(null);
    try {
      const data = await tareaService.obtenerTareasDeGrupo(grupoId, token);
      setTareas(data);
      return { ok: true };
    } catch (err) {
      const mensaje = err.message ?? "Error al cargar las tareas";
      setError(mensaje);
      return { ok: false, error: mensaje };
    } finally {
      setLoading(false);
    }
  }, []);

  const limpiarTareas = useCallback(() => {
    setTareas([]);
    setError(null);
  }, []);

  const value = {
    tareas,
    loading,
    error,
    cargarTareas,
    limpiarTareas,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export { TaskContext };
