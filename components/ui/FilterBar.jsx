"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, X, Check } from "lucide-react";
import { estados as estadosList } from "@/mocks/estados";
import { prioridades as prioridadesList } from "@/mocks/prioridades";

function badgeClase(item, tipo) {
  if (tipo === "estado") {
    if (item.nombre === "PENDIENTE") return "badge-secondary";
    if (item.nombre === "EN_PROGRESO") return "badge-primary";
    if (item.nombre === "COMPLETADA") return "badge-success";
    if (item.nombre === "VENCIDA") return "badge-error";
  }
  if (tipo === "prioridad") {
    if (item.nombre === "ALTA") return "badge-error";
    if (item.nombre === "MEDIA") return "badge-secondary";
    if (item.nombre === "BAJA") return "bg-blue-100 text-blue-700 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
  }
  if (tipo === "miembro") return "badge-primary";
  return "badge-secondary";
}

export default function FilterBar({ filtros, onChangeFiltros, miembros = [] }) {
  const [menuAbierto, setMenuAbierto] = useState(null);
  const barraRef = useRef(null);

  useEffect(() => {
    function clickAfuera(e) {
      if (barraRef.current && !barraRef.current.contains(e.target)) {
        setMenuAbierto(null);
      }
    }
    document.addEventListener("mousedown", clickAfuera);
    return () => document.removeEventListener("mousedown", clickAfuera);
  }, []);

  const tieneFiltros =
    filtros.estados.length > 0 ||
    filtros.prioridades.length > 0 ||
    filtros.miembros.length > 0;

  const limpiar = () => onChangeFiltros({ estados: [], prioridades: [], miembros: [] });

  const toggle = (tipo) => setMenuAbierto(menuAbierto === tipo ? null : tipo);

  const toggleOpcion = (tipo, id) => {
    const arr = filtros[tipo];
    const next = arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id];
    onChangeFiltros({ ...filtros, [tipo]: next });
  };

  const alternarTodos = (tipo, opciones, campoId) => {
    const actual = filtros[tipo];
    if (actual.length === opciones.length) {
      onChangeFiltros({ ...filtros, [tipo]: [] });
    } else {
      onChangeFiltros({ ...filtros, [tipo]: opciones.map((o) => o[campoId]) });
    }
  };

  const miembrosOpciones = miembros.map((m) => ({
    id: m.usuarioId,
    label: m.nombre,
  }));

  const chips = [];
  filtros.estados.forEach((nombre) => {
    const e = estadosList.find((x) => x.nombre === nombre);
    if (e) chips.push({ key: `e-${e.id}`, label: e.label, tipo: "estados", id: e.nombre, badgeTipo: "estado", item: e });
  });
  filtros.prioridades.forEach((nombre) => {
    const p = prioridadesList.find((x) => x.nombre === nombre);
    if (p) chips.push({ key: `p-${p.id}`, label: p.label, tipo: "prioridades", id: p.nombre, badgeTipo: "prioridad", item: p });
  });
  filtros.miembros.forEach((id) => {
    const m = miembrosOpciones.find((x) => x.id === id);
    if (m) chips.push({ key: `m-${m.id}`, label: m.label, tipo: "miembros", id: m.id, badgeTipo: "miembro", item: m });
  });

  return (
    <div ref={barraRef} className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {[
          {
            tipo: "estados",
            label: "Estado",
            opciones: estadosList.map((e) => ({ id: e.nombre, label: e.label, item: e })),
            badgeTipo: "estado",
            campoId: "nombre",
          },
          {
            tipo: "prioridades",
            label: "Prioridad",
            opciones: prioridadesList.map((p) => ({ id: p.nombre, label: p.label, item: p })),
            badgeTipo: "prioridad",
            campoId: "nombre",
          },
          {
            tipo: "miembros",
            label: "Miembro",
            opciones: miembrosOpciones,
            badgeTipo: "miembro",
            campoId: "id",
          },
        ].map(({ tipo, label, opciones, badgeTipo, campoId }) => {
          const seleccionados = filtros[tipo];
          const count = seleccionados.length;
          const abierto = menuAbierto === tipo;

          return (
            <div key={tipo} className="relative">
              <button
                type="button"
                onClick={() => toggle(tipo)}
                className={`btn-secondary flex items-center gap-2 text-sm ${
                  count > 0 ? "border-primary text-primary" : ""
                }`}
              >
                {count > 0 ? `${label} (${count})` : label}
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${abierto ? "rotate-180" : ""}`}
                />
              </button>

              {abierto && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-border rounded-md shadow-lg z-50 py-1">
                  <button
                    type="button"
                    onClick={() => alternarTodos(tipo, opciones, campoId)}
                    className="w-full text-left px-3 py-2 text-xs text-secondary hover:bg-background border-b border-border"
                  >
                    {count === opciones.length ? "Deseleccionar todos" : "Seleccionar todos"}
                  </button>
                  <div className="max-h-48 overflow-y-auto">
                    {opciones.map((op) => {
                      const sel = seleccionados.includes(op.id);
                      return (
                        <button
                          key={op.id}
                          type="button"
                          onClick={() => toggleOpcion(tipo, op.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-background"
                        >
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                              sel ? "bg-primary border-primary" : "border-secondary-light"
                            }`}
                          >
                            {sel && <Check size={12} className="text-white" />}
                          </div>
                          <span className={badgeClase(op.item || op, badgeTipo)}>
                            {op.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {tieneFiltros && (
          <button
            type="button"
            onClick={limpiar}
            className="btn-secondary text-xs text-error hover:bg-error-light hover:border-error"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {tieneFiltros && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-secondary font-medium">Filtros activos:</span>
          {chips.map((chip) => (
            <span
              key={chip.key}
              className={`${badgeClase(chip.item, chip.badgeTipo)} flex items-center gap-1 cursor-pointer`}
              onClick={() => toggleOpcion(chip.tipo, chip.id)}
            >
              {chip.label}
              <X size={12} />
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
