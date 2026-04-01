"use client";
import { useState } from "react";
import Input from "@/components/ui/Input";
import Image from "next/image"
import { Eye, EyeOff } from "lucide-react";
/*
  PROPS:
  - label       (string)    Texto encima del input. Ej: "Contraseña"
  - placeholder (string)    Texto gris dentro del input vacío
  - value       (string)    Valor actual. Viene desde la pantalla padre
  - onChange    (function)  Se ejecuta cada vez que el usuario escribe
  - error       (string)    Mensaje de error debajo del input
  - disabled    (boolean)   Si es true, el input no se puede editar. Default: false
  - className   (string)    Clases CSS extra opcionales desde afuera
 
  NOTA: No tiene prop "type" porque siempre es "password" o "text"
  según el estado interno showPassword. Eso lo maneja el componente solo.
*/
export default function PasswordInput({
  label,
  placeholder = "",
  value,
  onChange,
  error = "",
  disabled = false,
  className = "",
}) {
  const [showPassword, setShowPassword] = useState(false);
  const eyeIcon = (
    <button
      type="button"
      // "type=button" es importante — evita que este botón
      // envíe el formulario accidentalmente al hacer click
      onClick={() => setShowPassword(!showPassword)}
      className="text-secondary hover:text-foreground transition-colors"
    >
      {/* Muestra un ícono diferente según si la contraseña es visible */}
      {showPassword ? <EyeOff size={16} /> : <Eye size={16}/>}
    </button>
  );
  return (
    <div className={`relative ${className}`}>
      <Input
        label={label}
        placeholder={placeholder}
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        error={error}
        disabled={disabled}
      ></Input>
      <div className="absolute right-3 top-[34px]">{eyeIcon}</div>
    </div>
  );
}
