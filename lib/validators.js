/**
 * validators.js
 * Funciones de validación centralizadas para formularios
 * Importar y usar en páginas de autenticación
 */

// ─── Email ────────────────────────────────────────────────────────────────
export function validarCorreo(valor) {
  const valorNormalizado = valor.trim();
  if (!valorNormalizado) return "El correo electrónico es obligatorio.";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(valorNormalizado)) return "Ingresa un correo electrónico válido.";
  return "";
}

// ─── Contraseña simple (para login) ────────────────────────────────────────
export function validarContrasenaLogin(valor) {
  if (!valor) return "La contraseña es obligatoria.";
  return "";
}

// ─── Contraseña compleja (para registro) ──────────────────────────────────
export function validarContrasenaRegistro(valor) {
  if (!valor) return "La contraseña es obligatoria.";
  const errores = [];
  if (valor.length < 8) errores.push("mínimo 8 caracteres");
  if (!/[A-Z]/.test(valor)) errores.push("al menos una mayúscula");
  if (!/[0-9]/.test(valor)) errores.push("al menos un número");
  if (!/[^A-Za-z0-9]/.test(valor)) errores.push("al menos un carácter especial");
  if (errores.length > 0) return `La contraseña requiere: ${errores.join(", ")}.`;
  return "";
}

// ─── Confirmar contraseña ──────────────────────────────────────────────────
export function validarConfirmarContrasena(contrasena, confirmar) {
  if (!confirmar) return "Confirmar la contraseña es obligatorio.";
  if (contrasena !== confirmar) return "Las contraseñas no coinciden.";
  return "";
}

// ─── Nombre ───────────────────────────────────────────────────────────────
export function validarNombre(valor) {
  const nombre = valor.trim();
  if (!nombre) return "El nombre es obligatorio.";
  if (nombre.length > 50) return "El nombre no puede superar los 50 caracteres.";
  return "";
}

// ─── PIN de seguridad ─────────────────────────────────────────────────────
export function validarPin(valor) {
  if (!valor) return "El pin de seguridad es obligatorio.";
  if (!/^\d{5}$/.test(valor))
    return "El pin de seguridad debe ser numérico y tener exactamente 5 cifras.";
  return "";
}
