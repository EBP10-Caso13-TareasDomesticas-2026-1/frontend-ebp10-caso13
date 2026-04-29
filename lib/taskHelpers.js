// lib/taskHelpers.js
// Helpers para trabajar con tareas internamente en el frontend
// Estados, prioridades y mapeos a propiedades visuales

import { estados } from "@/mocks/estados";
import { prioridades } from "@/mocks/prioridades";

/**
 * Obtiene el label y color de un estado
 * @param {string} estado - Nombre del estado (ej: "PENDIENTE")
 * @returns {{ label: string, color: string }}
 */
export function getEstadoInfo(estado) {
  const info = estados.find((e) => e.nombre === estado);
  return info ? { label: info.label, color: info.color } : { label: estado, color: "#999" };
}

/**
 * Obtiene el label de una prioridad
 * @param {string} prioridad - Nombre de la prioridad (ej: "ALTA")
 * @returns {{ label: string }}
 */
export function getPrioridadInfo(prioridad) {
  const info = prioridades.find((p) => p.nombre === prioridad);
  return info ? { label: info.label } : { label: prioridad };
}

/**
 * Obtiene la lista de estados disponibles
 * Útil para combos/filtros en el tablero
 * @returns {Array} estados con { nombre, label, color }
 */
export function getEstados() {
  return estados;
}

/**
 * Obtiene la lista de prioridades disponibles
 * Útil para combos en crear tarea
 * @returns {Array} prioridades con { nombre, label }
 */
export function getPrioridades() {
  return prioridades;
}
