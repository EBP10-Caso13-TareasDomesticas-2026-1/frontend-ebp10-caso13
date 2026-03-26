import { useState } from "react";
import Input from "@/components/ui/Input";

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
      {showPassword ? <img src="/hide.ico" width={16} height={16} /> : <img src="/visible.ico" width={16} height={16} />}
    </button>
  );
  return (
    <div className={`relative ${className}`}>
      <Input
        label={label}
        placeholder={placeholder}
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={handleChange}
        error={error}
        disabled={disabled}
      ></Input>
      <div className="absolute right-3 top-[34px]">{eyeIcon}</div>
    </div>
  );
}
