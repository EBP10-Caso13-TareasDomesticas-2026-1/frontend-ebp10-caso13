"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserCheck, Mail, Lock, Shield } from "lucide-react";

import CenteredLayout from "@/components/layout/CenteredLayout";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";
import authService from "@/services/authService";

// ─── VALIDACIONES ────────────────────────────────────────────────────────────

function validarNombre(valor) {
  if (!valor.trim()) return "El nombre es obligatorio.";
  if (valor.length > 50) return "El nombre no puede superar los 50 caracteres.";
  return "";
}

function validarCorreo(valor) {
  if (!valor.trim()) return "El correo electrónico es obligatorio.";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(valor)) return "Ingresa un correo electrónico válido.";
  return "";
}

function validarContrasena(valor) {
  if (!valor) return "La contraseña es obligatoria.";
  const errores = [];
  if (valor.length < 8) errores.push("mínimo 8 caracteres");
  if (!/[A-Z]/.test(valor)) errores.push("al menos una mayúscula");
  if (!/[0-9]/.test(valor)) errores.push("al menos un número");
  if (!/[^A-Za-z0-9]/.test(valor)) errores.push("al menos un carácter especial");
  if (errores.length > 0) return `La contraseña requiere: ${errores.join(", ")}.`;
  return "";
}

function validarConfirmarContrasena(contrasena, confirmar) {
  if (!confirmar) return "Confirmar la contraseña es obligatorio.";
  if (contrasena !== confirmar) return "Las contraseñas no coinciden.";
  return "";
}

function validarPin(valor) {
  if (!valor) return "El pin de seguridad es obligatorio.";
  if (!/^\d{5}$/.test(valor))
    return "El pin de seguridad debe ser numérico y tener exactamente 5 cifras.";
  return "";
}

// ─── PÁGINA ──────────────────────────────────────────────────────────────────

export default function RegistroPage() {
  const router = useRouter();

  // ── Estado del formulario ──
  const [form, setForm] = useState({
    nombre: "",
    correo: "",
    contrasena: "",
    confirmarContrasena: "",
    pin: "",
  });

  // ── Errores por campo ──
  const [errores, setErrores] = useState({
    nombre: "",
    correo: "",
    contrasena: "",
    confirmarContrasena: "",
    pin: "",
  });

  // ── Estado general ──
  const [loading, setLoading] = useState(false);
  const [errorGlobal, setErrorGlobal] = useState("");
  const [exito, setExito] = useState(false);

  // ─── HANDLERS ──────────────────────────────────────────────────────────────

  const handleChange = (campo) => (e) => {
    const valor = e.target.value;

    // Bloquear nombre si supera 50 caracteres (escenario 6)
    if (campo === "nombre" && valor.length > 50) {
      setErrores((prev) => ({
        ...prev,
        nombre: "Has alcanzado el límite de 50 caracteres.",
      }));
      return;
    }

    setForm((prev) => ({ ...prev, [campo]: valor }));

    // Limpiar error del campo al editar
    setErrores((prev) => ({ ...prev, [campo]: "" }));
    setErrorGlobal("");
  };

  const validarTodo = () => {
    const nuevosErrores = {
      nombre: validarNombre(form.nombre),
      correo: validarCorreo(form.correo),
      contrasena: validarContrasena(form.contrasena),
      confirmarContrasena: validarConfirmarContrasena(
        form.contrasena,
        form.confirmarContrasena
      ),
      pin: validarPin(form.pin),
    };
    setErrores(nuevosErrores);
    return Object.values(nuevosErrores).every((e) => e === "");
  };

  const handleSubmit = async () => {
    // Evitar múltiples clics (escenario 10)
    if (loading) return;

    if (!validarTodo()) return;

    setLoading(true);
    setErrorGlobal("");

    try {
      await authService.registrarUsuario({
        nombre: form.nombre.trim(),
        correo: form.correo.trim(),
        contrasena: form.contrasena,
        pinSeguridad: form.pin,
      });

      // Registro exitoso (escenario 1)
      setExito(true);
      setTimeout(() => {
        router.push("/login");
      }, 1800);
    } catch (error) {
      // Correo ya registrado (escenario 2)
      if (
        error?.status === 409 ||
        error?.message?.toLowerCase().includes("correo") ||
        error?.message?.toLowerCase().includes("registrado")
      ) {
        setErrores((prev) => ({
          ...prev,
          correo:
            "Este correo ya está registrado. Intenta iniciar sesión.",
        }));
      } else {
        setErrorGlobal(
          error?.message || "Ocurrió un error inesperado. Intenta de nuevo."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ─── NAVBAR CONTENT ────────────────────────────────────────────────────────

  const navbarContent = (
    <a
      href="/login"
      className="text-sm font-medium text-primary hover:underline"
    >
      Iniciar sesión
    </a>
  );

  // ─── RENDER ────────────────────────────────────────────────────────────────

  return (
    <CenteredLayout navbarContent={navbarContent}>
      <div className="flex flex-col items-center gap-6 w-full">

        {/* ── Ícono y encabezado ── */}
        <div className="flex flex-col items-center gap-2 mt-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <UserCheck size={28} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Crear cuenta</h1>
          <p className="text-sm text-secondary text-center">
            Únete a tu hogar en HomeSync
          </p>
        </div>

        {/* ── Mensaje de éxito ── */}
        {exito && (
          <div className="w-full rounded-md bg-success/10 border border-success px-4 py-3 text-sm text-success text-center">
            ¡Cuenta creada con éxito! Redirigiendo...
          </div>
        )}

        {/* ── Error global ── */}
        {errorGlobal && (
          <div className="w-full rounded-md bg-error-light border border-error px-4 py-3 text-sm text-error text-center">
            {errorGlobal}
          </div>
        )}

        {/* ── Formulario ── */}
        <div className="flex flex-col gap-4 w-full">

          {/* Nombre completo */}
          <Input
            label="Nombre completo"
            placeholder="Ej. Juan Pérez"
            value={form.nombre}
            onChange={handleChange("nombre")}
            error={errores.nombre}
            icon={<UserCheck size={16} className="text-secondary" />}
            disabled={loading || exito}
          />

          {/* Correo electrónico */}
          <Input
            label="Correo electrónico"
            placeholder="correo@ejemplo.com"
            type="email"
            value={form.correo}
            onChange={handleChange("correo")}
            error={errores.correo}
            icon={<Mail size={16} className="text-secondary" />}
            disabled={loading || exito}
          />

          {/* Contraseña */}
          <PasswordInput
            label="Contraseña"
            placeholder="••••••••"
            value={form.contrasena}
            onChange={handleChange("contrasena")}
            error={errores.contrasena}
            disabled={loading || exito}
          />

          {/* Confirmar contraseña */}
          <PasswordInput
            label="Confirmar contraseña"
            placeholder="••••••••"
            value={form.confirmarContrasena}
            onChange={handleChange("confirmarContrasena")}
            error={errores.confirmarContrasena}
            disabled={loading || exito}
          />

          {/* Pin de seguridad */}
          <Input
            label="Pin de Seguridad (5 dígitos)"
            placeholder="•••••"
            type="tel"
            value={form.pin}
            onChange={handleChange("pin")}
            error={errores.pin}
            icon={<Shield size={16} className="text-secondary" />}
            disabled={loading || exito}
          />
        </div>

        {/* ── Botón de registro ── */}
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={loading || exito}
          className="w-full"
        >
          {loading ? "Registrando..." : "Registrarse →"}
        </Button>

        {/* ── Link a login ── */}
        <p className="text-sm text-secondary">
          ¿Ya tienes cuenta?{" "}
          <a
            href="/login"
            className="text-primary font-medium hover:underline"
          >
            Inicia sesión
          </a>
        </p>

      </div>
    </CenteredLayout>
  );
}
