/*
  PROPS:
  - label       (string)    Texto encima del input. Ej: "Correo electrónico"
  - placeholder (string)    Texto gris dentro del input vacío. Ej: "ejemplo@correo.com"
  - type        (string)    Tipo HTML del input. Default: "text"
                            Opciones: "text" | "email" | "password" | "tel"
                            Usar "tel" para el PIN — filtra solo números, máx 5 dígitos
  - value       (string)    Valor actual del input. Viene desde la pantalla padre
  - onChange    (function)  Se ejecuta cada vez que el usuario escribe
  - error       (string)    Mensaje de error debajo del input. Si está vacío, no se muestra
  - icon        (JSX)       Ícono a la izquierda. Ej: icon={<Mail size={16} />}
  - disabled    (boolean)   Si es true, el input no se puede editar. Default: false
  - className   (string)    Clases CSS extra opcionales desde afuera
*/
"use client";
export default function Input({
  label,
  placeholder = "",
  type = "text",
  value,
  onChange,
  error = "",
  icon,
  disabled = false,
  className = "",
}) {
  const handleChange = (e) => {
    if (!onChange) {
      return;
    } else if (type === "tel") {
      const onlyNumbers = e.target.value.replace(/\D/g, "").slice(0, 5);
      onChange({ target: { value: onlyNumbers } });
    } else {
      onChange(e);
    }
  };

  const inputClass = error ? "input-error" : "input-base";

  return (
    //Contenedor principal (label, ícono y campo)
    <div className={`flex flex-col gap-1 ${className}`}>
      {/* LABEL*/}
      {label && <label className="label-base"> {label} </label>}

      {/* ÍCONO */}
      <div className="relative">
        {/* "relative" permite posicionar el ícono dentro del input */}
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            {icon}
          </div>
        )}
        {/* EL INPUT (LA CAJITA QUE ES EL CAMPO DE TEXTO)*/}
        <input
          type={type}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`${inputClass} ${icon ? "pl-9" : ""}`}
        />
        {/* Agrega padding izquierdo si hay ícono, para que no se solapen */}
      </div>

      {/* Mensaje de error, solo se muestra si la prop "error" tiene contenido */}
      {error && (
        <p className="error-message">
          {error}
        </p> /*error-message se define en globals.css*/
      )}
    </div>
  );
}
