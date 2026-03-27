/*
Componente Botón
props:
    children = contenido a mostrar dentro del botón.
    variant = estilo del botón, por defecto es primary
    disabled = si el botón está deshabilitado, por defecto es false
    type = tipo HTML del botón "button" es botón normal, "submit" es para formularios
    onClick = función que se ejecuta al hacer click
    className = clases CSS opcionales, por defecto va vacío
*/
"use client";
export default function Button({
  children,
  variant = "primary",
  type = "button",
  disabled = false,
  onClick,
  className = "",
}) {
  const variants = {
    primary: "btn-primary", // Azul — acción principal
    secondary: "btn-secondary", // Blanco con borde — acción secundaria
    danger: "btn-danger", // Rojo — acciones peligrosas
  };

  const variantClass = variants[variant] || "btn-primary";

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${variantClass} ${className}`}
    >
      {children}
    </button>
  );
}
