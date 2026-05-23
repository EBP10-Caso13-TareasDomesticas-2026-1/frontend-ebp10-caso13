"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

function getBadgeClass(option, type) {
  if (type === "estado") {
    if (option.nombre === "PENDIENTE") return "badge-secondary";
    if (option.nombre === "EN_PROGRESO") return "badge-primary";
    if (option.nombre === "COMPLETADA") return "badge-success";
    if (option.nombre === "VENCIDA") return "badge-error";
  }
  if (type === "prioridad") {
    if (option.nombre === "ALTA") return "badge-error";
    if (option.nombre === "MEDIA") return "badge-secondary";
    if (option.nombre === "BAJA") return "bg-blue-100 text-blue-700 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
  }
  return "badge-secondary";
}

export default function FilterDropdown({
  label,
  options = [],
  selected = [],
  onChange,
  type = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (id) => {
    const next = selected.includes(id)
      ? selected.filter((s) => s !== id)
      : [...selected, id];
    onChange(next);
  };

  const toggleAll = () => {
    if (selected.length === options.length) {
      onChange([]);
    } else {
      onChange(options.map((o) => o.id));
    }
  };

  const count = selected.length;
  const buttonLabel = count > 0 ? `${label} (${count})` : label;

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`btn-secondary flex items-center gap-2 text-sm ${
          count > 0 ? "border-primary text-primary" : ""
        }`}
      >
        {buttonLabel}
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-border rounded-md shadow-lg z-50 py-1">
          <button
            type="button"
            onClick={toggleAll}
            className="w-full text-left px-3 py-2 text-xs text-secondary hover:bg-background border-b border-border"
          >
            {selected.length === options.length
              ? "Deseleccionar todos"
              : "Seleccionar todos"}
          </button>
          <div className="max-h-48 overflow-y-auto">
            {options.map((option) => {
              const isSelected = selected.includes(option.id);
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => toggleOption(option.id)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-background transition-colors"
                >
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                      isSelected
                        ? "bg-primary border-primary"
                        : "border-secondary-light"
                    }`}
                  >
                    {isSelected && <Check size={12} className="text-white" />}
                  </div>
                  <span className={getBadgeClass(option, type)}>
                    {option.label || option.nombre}
                  </span>
                  {option.fotoPerfil && (
                    <span
                      className="w-5 h-5 rounded-full bg-cover bg-center flex-shrink-0"
                      style={{ backgroundImage: `url(${option.fotoPerfil})` }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
