"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CenteredLayout from "@/components/layout/CenteredLayout";
import Input from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";
import Button from "@/components/ui/Button";

import authService from "@/services/authService";

import {
  validarCorreo,
  validarContrasenaRegistro,
} from "@/lib/validators";

import { useRateLimit } from "@/hooks/useRateLimit";

const RATE_LIMIT_KEY_INTENTOS = "hs_recuperar_intentos";
const RATE_LIMIT_KEY_BLOQUEO = "hs_recuperar_bloqueo_hasta";

const MAX_INTENTOS = 3;
const VENTANA_MS = 10 * 60 * 1000; // 10 minutos
const BLOQUEO_MS = 15 * 60 * 1000; // 15 minutos

export default function RecuperarContrasenaPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    correo: "",
    pin: "",
    nuevaContrasena: "",
    confirmarContrasena: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [globalError, setGlobalError] = useState("");

  const {
    bloqueado,
    bloqueoHasta,
    registrarIntento,
    limpiarIntentos,
    formatearTiempo,
  } = useRateLimit(
    MAX_INTENTOS,
    VENTANA_MS / 60000,
    BLOQUEO_MS / 60000,
    RATE_LIMIT_KEY_INTENTOS,
    RATE_LIMIT_KEY_BLOQUEO);

  const handleChange = (field) => (e) => {
    let value = e.target.value;

    // PIN: solo números y máximo 5 caracteres
    if (field === "pin") {
      value = value.replace(/\D/g, "").slice(0, 5);
    }

    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));

    setGlobalError("");
  };

  const validate = () => {
    const newErrors = {};

    // Correo
    const correoError = validarCorreo(form.correo);
    if (correoError) {
      newErrors.correo = correoError;
    }

    // PIN
    if (!form.pin.trim()) {
      newErrors.pin = "El PIN de seguridad es obligatorio.";
    } else if (!/^\d{5}$/.test(form.pin)) {
      newErrors.pin =
        "El PIN debe tener exactamente 5 dígitos numéricos.";
    }

    // Nueva contraseña
    const passwordError = validarContrasenaRegistro(
      form.nuevaContrasena
    );

    if (passwordError) {
      newErrors.nuevaContrasena = passwordError;
    }

    // Confirmar contraseña
    if (!form.confirmarContrasena.trim()) {
      newErrors.confirmarContrasena =
        "Debes confirmar la contraseña.";
    } else if (
      form.nuevaContrasena !== form.confirmarContrasena
    ) {
      newErrors.confirmarContrasena =
        "Las contraseñas no coinciden.";
    }

    return newErrors;
  };

  const handleSubmit = async () => {
    setGlobalError("");
    setSuccessMsg("");

    if (bloqueado) return;

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      await authService.recuperarContrasena({
        correo: form.correo,
        pinSeguridad: form.pin,
        nuevaContrasena: form.nuevaContrasena,
        confirmarContrasena: form.confirmarContrasena,
      });

      limpiarIntentos();

      setSuccessMsg(
        "Contraseña actualizada exitosamente. Redirigiendo..."
      );

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error) {
      const intentosBloqueado = registrarIntento();

      if (intentosBloqueado) {
        setGlobalError(
          `Demasiados intentos fallidos. Intenta de nuevo en ${formatearTiempo(
            BLOQUEO_MS
          )}.`
        );
      } else {
        setGlobalError(
          "No fue posible restablecer la contraseña. Verifica tus datos e intenta de nuevo."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/login");
  };

  const tiempoRestante =
    bloqueado && bloqueoHasta
      ? formatearTiempo(bloqueoHasta)
      : null;

  return (
    <CenteredLayout>
      <div className="bg-white rounded-2xl shadow-md px-10 py-10 w-full max-w-lg">
        
        {/* Encabezado */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Recuperar Contraseña
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Ingresa tu correo electrónico y pin de seguridad para
            restablecerla
          </p>
        </div>

        {/* Éxito */}
        {successMsg && (
          <div className="mb-5 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3">
            {successMsg}
          </div>
        )}

        {/* Bloqueo */}
        {bloqueado && tiempoRestante && (
          <div className="mb-5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
            Acceso bloqueado temporalmente. Intenta de nuevo en{" "}
            <span className="font-semibold">
              {tiempoRestante}
            </span>.
          </div>
        )}

        {/* Error global */}
        {globalError && !bloqueado && (
          <div className="mb-5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
            {globalError}
          </div>
        )}

        {/* Formulario */}
        <div className="flex flex-col gap-5">

          <Input
            label="Correo electrónico"
            placeholder="ejemplo@correo.com"
            type="email"
            value={form.correo}
            onChange={handleChange("correo")}
            error={errors.correo}
            disabled={loading || bloqueado}
          />

          <PasswordInput
            label="Pin de seguridad"
            placeholder="•••••"
            value={form.pin}
            onChange={handleChange("pin")}
            error={errors.pin}
            disabled={loading || bloqueado}
          />

          <PasswordInput
            label="Nueva contraseña"
            placeholder="••••••••"
            value={form.nuevaContrasena}
            onChange={handleChange("nuevaContrasena")}
            error={errors.nuevaContrasena}
            disabled={loading || bloqueado}
          />

          <PasswordInput
            label="Confirmar contraseña"
            placeholder="••••••••"
            value={form.confirmarContrasena}
            onChange={handleChange("confirmarContrasena")}
            error={errors.confirmarContrasena}
            disabled={loading || bloqueado}
          />
        </div>

        {/* Botones */}
        <div className="flex flex-col gap-3 mt-8">

          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={loading || bloqueado}
          >
            {loading
              ? "Cambiando contraseña..."
              : "Cambiar Contraseña"}
          </Button>

          <Button
            variant="secondary"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancelar
          </Button>
        </div>
      </div>
    </CenteredLayout>
  );
}