"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserCheck, Mail, Shield } from "lucide-react";

import CenteredLayout from "@/components/layout/CenteredLayout";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";
import {
  validarNombre,
  validarCorreo,
  validarContrasenaRegistro as validarContrasena,
  validarConfirmarContrasena,
  validarPin,
} from "@/lib/validators";
import authService from "@/services/authService";


export default function RegistroPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    nombre: "",
    correo: "",
    contrasena: "",
    confirmarContrasena: "",
    pin: "",
  });

  const [errores, setErrores] = useState({
    nombre: "",
    correo: "",
    contrasena: "",
    confirmarContrasena: "",
    pin: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorGlobal, setErrorGlobal] = useState("");
  const [exito, setExito] = useState(false);


  const handleChange = (campo) => (e) => {
    const valor = e.target.value;

    setForm((prev) => ({ ...prev, [campo]: valor }));

    // Validar nombre en tiempo real usando la función centralizada
    if (campo === "nombre") {
      const error = validarNombre(valor);
      setErrores((prev) => ({ ...prev, nombre: error }));
    } else {
      setErrores((prev) => ({ ...prev, [campo]: "" }));
    }
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

      // Successful registration redirects to login after 1.8s
      setExito(true);
      setTimeout(() => {
        router.push("/login");
      }, 1800);
    } catch (error) {
      // Email already registered or other error
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


  const navbarContent = (
    <a
      href="/login"
      className="text-sm font-medium text-primary hover:underline"
    >
      Iniciar sesión
    </a>
  );

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
            maxLength={50}
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
