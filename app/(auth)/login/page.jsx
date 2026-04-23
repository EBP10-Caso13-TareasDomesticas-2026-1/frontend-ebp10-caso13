"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";

import CenteredLayout from "@/components/layout/CenteredLayout";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";
import { validarCorreo, validarContrasenaLogin as validarContrasena } from "@/lib/validators";
import { useAuth } from "@/hooks/useAuth";
import { useGroup } from "@/hooks/useGroup";
import { useRateLimit } from "@/hooks/useRateLimit";

// Why implement lockout on frontend? Prevent brute-force attacks on weak credentials
// while mocks are used. When backend is live, it may return HTTP 429 (rate limit).
// This client-side lockout serves as first defense and UX feedback.

// ─── PÁGINA ──────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter();

  // Rate limiting: 5 intentos en 5 minutos, bloqueo de 15 minutos
  const { bloqueado, bloqueoHasta, registrarIntento, limpiarIntentos, formatearTiempo, tick } = useRateLimit(
    5, // maxIntentos
    5, // ventanaMinutos
    15, // bloqueoMinutos
    "hs_login_intentos",
    "hs_login_bloqueo_hasta"
  );

  // Why destructure from useAuth instead of calling useContext directly?
  // AuthContext is an implementation detail. useAuth provides the stable interface.
  // If we swap context libraries later, only useAuth needs updating, not this page.
  const { login } = useAuth();

  // Why read login result then call cargarGrupo separately?
  // cargarGrupo needs the token immediately to decide routing (group exists vs no group).
  // We return idUsuario + token from login() so LoginPage can orchestrate the flow.
  const { cargarGrupo } = useGroup();

  const [form, setForm] = useState({ correo: "", contrasena: "" });
  const [errores, setErrores] = useState({ correo: "", contrasena: "" });
  const [loading, setLoading] = useState(false);
  const [errorGlobal, setErrorGlobal] = useState("");
  const [lockoutMessage, setLockoutMessage] = useState("");

  // Actualizar mensaje de bloqueo cada segundo para mostrar countdown
  useEffect(() => {
    if (bloqueado && bloqueoHasta) {
      setLockoutMessage(
        "Tu cuenta ha sido bloqueada temporalmente por múltiples intentos fallidos. Intenta de nuevo en " +
          formatearTiempo(bloqueoHasta) +
          ".",
      );
    } else {
      setLockoutMessage("");
    }
  }, [bloqueado, bloqueoHasta, formatearTiempo, tick]);

  const handleChange = (campo) => (e) => {
    setForm((prev) => ({ ...prev, [campo]: e.target.value }));
    setErrores((prev) => ({ ...prev, [campo]: "" }));
    setErrorGlobal("");
  };

  const validarTodo = () => {
    const nuevosErrores = {
      correo: validarCorreo(form.correo),
      contrasena: validarContrasena(form.contrasena),
    };
    setErrores(nuevosErrores);
    return Object.values(nuevosErrores).every((e) => e === "");
  };

  const handleSubmit = async () => {
    // Prevent multiple simultaneous submissions or attempts while locked
    if (loading || bloqueado) return;
    // Validate all fields and show per-field errors (Scenario 5)
    if (!validarTodo()) return;

    setLoading(true);
    setErrorGlobal("");

    try {
      // Attempt login. AuthContext persists token to localStorage internally.
      const resultadoLogin = await login({
        correo: form.correo.trim(),
        contrasena: form.contrasena,
      });

      if (!resultadoLogin.ok) {
        const quedoBloqueado = registrarIntento();
        if (quedoBloqueado) {
          setErrorGlobal("");
        } else {
          // Generic message for failed login (Scenarios 2 & 3 - never reveal which field failed)
          setErrorGlobal("El correo o la contraseña son incorrectos.");
        }
        return;
      }

      // Successful login: clear failed attempts
      limpiarIntentos();

      // Route based on group membership: user with group → dashboard, no group → welcome
      const resultado = await cargarGrupo(
        resultadoLogin.idUsuario,
        resultadoLogin.token,
      );

      if (resultado.ok) {
        router.push("/bienvenida"); // TODO:en el siguiente Sprint se cambia por dashboard
      } else if (resultado.noGrupo) {
        router.push("/bienvenida");
      } else {
        // Error inesperado al consultar grupo
        setErrorGlobal(
          resultado.error || "No se pudo cargar la información del grupo.",
        );
        return;
      }
    } catch (error) {
      // Lockout check: only reached if login() throws exception
      const quedoBloqueado = registrarIntento();

      if (quedoBloqueado) {
        setErrorGlobal("");
      } else {
        // Generic message for failed login (never reveal which field failed)
        setErrorGlobal("El correo o la contraseña son incorrectos.");
      }
    } finally {
      setLoading(false);
    }
  };

  const navbarContent = (
    <Button
      variant="primary"
      onClick={() => router.push("/registro")}
      className="text-sm"
    >
      Registrarse
    </Button>
  );

  return (
    <CenteredLayout navbarContent={navbarContent}>
      <div className="flex flex-col items-center gap-6 w-full">
        <div className="flex flex-col items-center gap-1 mt-2">
          <h1 className="text-2xl font-bold text-foreground">Iniciar sesión</h1>
          <p className="text-sm text-secondary text-center">
            Gestiona tus tareas del hogar de forma sencilla
          </p>
        </div>

        {/* Error message and lockout countdown */}
        {lockoutMessage ? (
          <div className="w-full rounded-md bg-error-light border border-error px-4 py-3 text-sm text-error text-center">
            {lockoutMessage}
          </div>
        ) : errorGlobal ? (
          <div className="w-full rounded-md bg-error-light border border-error px-4 py-3 text-sm text-error text-center">
            {errorGlobal}
          </div>
        ) : null}

        {/* Login form */}
        <form
          className="flex flex-col gap-4 w-full"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <Input
            label="Correo electrónico"
            placeholder="ejemplo@correo.com"
            type="email"
            value={form.correo}
            onChange={handleChange("correo")}
            error={errores.correo}
            icon={<Mail size={16} className="text-secondary" />}
            disabled={loading || bloqueado}
          />

  {/* Contraseña con opción de recuperación */}
          <div className="flex flex-col gap-1">
            <PasswordInput
              label="Contraseña"
              placeholder="••••••••"
              value={form.contrasena}
              onChange={handleChange("contrasena")}
              error={errores.contrasena}
              disabled={loading || bloqueado}
            />
            <div className="flex justify-end">
              <button
                type="button"
                className="text-xs text-secondary hover:text-primary hover:underline transition-colors"
                onClick={() => {
                  /* TODO: Future HU for password recovery */
                }}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </div>
          <Button
            type="submit"
            variant="primary"
            disabled={loading || bloqueado}
            className="w-full"
          >
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </Button>
        </form>

        <div className="flex items-center gap-3 w-full">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-secondary uppercase tracking-wide">
            O BIEN
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <p className="text-sm text-secondary">
          ¿No tienes cuenta?{" "}
          <a
            href="/registro"
            className="text-primary font-medium hover:underline"
          >
            Regístrate
          </a>
        </p>
      </div>
    </CenteredLayout>
  );
}
