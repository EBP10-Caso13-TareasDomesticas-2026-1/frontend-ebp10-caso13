"use client";

import { X } from "lucide-react";
import FilterDropdown from "./FilterDropdown";
import { estados as estadosList } from "@/mocks/estados";
import { prioridades as prioridadesList } from "@/mocks/prioridades";

function getBadgeClass(item, type) {
  if (type === "estado") {
    if (item.nombre === "PENDIENTE") return "badge-secondary";
    if (item.nombre === "EN PROGRESO") return "badge-primary";
    if (item.nombre === "COMPLETADA") return "badge-success";
    if (item.nombre === "VENCIDA") return "badge-error";
  }
  if (type === "prioridad") {
    if (item.nombre === "Alta") return "badge-error";
    if (item.nombre === "Media") return "badge-secondary";
    if (item.nombre === "Baja") return "bg-blue-100 text-blue-700 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
  }
  if (type === "miembro") {
    return "badge-primary";
  }
  return "badge-secondary";
}

export default function FilterBar({
  filtros,
  onChangeFiltros,
  miembros = [],
}) {
  const tieneFiltrosActivos =
    filtros.estados.length > 0 ||
    filtros.prioridades.length > 0 ||
    filtros.miembros.length > 0;

  const limpiarFiltros = () => {
    onChangeFiltros({ estados: [], prioridades: [], miembros: [] });
  };

  const quitarFiltro = (tipo, id) => {
    onChangeFiltros({
      ...filtros,
      [tipo]: filtros[tipo].filter((fid) => fid !== id),
    });
  };

  const miembrosOptions = miembros.map((m) => ({
    id: m.usuarioId || m.idUsuario || m.id,
    nombre: m.nombre,
    fotoPerfil: m.fotoPerfil || null,
  }));

  const resolvedEstados = filtros.estados
    .map((id) => estadosList.find((e) => e.id === id))
    .filter(Boolean);

  const resolvedPrioridades = filtros.prioridades
    .map((id) => prioridadesList.find((p) => p.id === id))
    .filter(Boolean);

  const resolvedMiembros = filtros.miembros
    .map((id) => miembrosOptions.find((m) => m.id === id))
    .filter(Boolean);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <FilterDropdown
          label="Estado"
          options={estadosList}
          selected={filtros.estados}
          onChange={(val) => onChangeFiltros({ ...filtros, estados: val })}
          type="estado"
        />
        <FilterDropdown
          label="Prioridad"
          options={prioridadesList}
          selected={filtros.prioridades}
          onChange={(val) => onChangeFiltros({ ...filtros, prioridades: val })}
          type="prioridad"
        />
        <FilterDropdown
          label="Miembro"
          options={miembrosOptions}
          selected={filtros.miembros}
          onChange={(val) => onChangeFiltros({ ...filtros, miembros: val })}
          type="miembro"
        />

        {tieneFiltrosActivos && (
          <button
            type="button"
            onClick={limpiarFiltros}
            className="btn-secondary text-xs text-error hover:bg-error-light hover:border-error"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {tieneFiltrosActivos && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-secondary font-medium">
            Filtros activos:
          </span>
          {resolvedEstados.map((item) => (
            <span
              key={`est-${item.id}`}
              className={`${getBadgeClass(item, "estado")} flex items-center gap-1 cursor-pointer`}
              onClick={() => quitarFiltro("estados", item.id)}
            >
              {item.nombre}
              <X size={12} />
            </span>
          ))}
          {resolvedPrioridades.map((item) => (
            <span
              key={`pri-${item.id}`}
              className={`${getBadgeClass(item, "prioridad")} flex items-center gap-1 cursor-pointer`}
              onClick={() => quitarFiltro("prioridades", item.id)}
            >
              {item.nombre}
              <X size={12} />
            </span>
          ))}
          {resolvedMiembros.map((item) => (
            <span
              key={`mbr-${item.id}`}
              className={`${getBadgeClass(item, "miembro")} flex items-center gap-1 cursor-pointer`}
              onClick={() => quitarFiltro("miembros", item.id)}
            >
              {item.nombre}
              <X size={12} />
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
