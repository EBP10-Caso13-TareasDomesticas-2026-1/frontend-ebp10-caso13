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

const MAX_INTENTOS = 5;
const BLOQUEO_MS = 15 * 60 * 1000; // 15 minutos en ms
const STORAGE_KEY_INTENTOS = "hs_login_intentos";
const STORAGE_KEY_BLOQUEO = "hs_login_bloqueo_hasta";

// Why implement lockout on frontend? Prevent brute-force attacks on weak credentials
// while mocks are used. When backend is live, it may return HTTP 429 (rate limit).
// This client-side lockout serves as first defense and UX feedback.

function obtenerEstadoBloqueo() {
  try {
    const bloqueoHasta = parseInt(
      localStorage.getItem(STORAGE_KEY_BLOQUEO) || "0",
      10,
    );
    const intentos = parseInt(
      localStorage.getItem(STORAGE_KEY_INTENTOS) || "0",
      10,
    );
    const ahora = Date.now();
    if (bloqueoHasta && ahora < bloqueoHasta) {
      return { bloqueado: true, hasta: bloqueoHasta, intentos };
    }
    if (bloqueoHasta && ahora >= bloqueoHasta) {
      localStorage.removeItem(STORAGE_KEY_BLOQUEO);
      localStorage.removeItem(STORAGE_KEY_INTENTOS);
    }
    return { bloqueado: false, hasta: null, intentos };
  } catch {
    return { bloqueado: false, hasta: null, intentos: 0 };
  }
}

function registrarIntentoFallido() {
  try {
    const intentos =
      parseInt(localStorage.getItem(STORAGE_KEY_INTENTOS) || "0", 10) + 1;
    localStorage.setItem(STORAGE_KEY_INTENTOS, String(intentos));
    if (intentos >= MAX_INTENTOS) {
      const hasta = Date.now() + BLOQUEO_MS;
      localStorage.setItem(STORAGE_KEY_BLOQUEO, String(hasta));
      return { bloqueado: true, hasta, intentos };
    }
    return { bloqueado: false, hasta: null, intentos };
  } catch {
    return { bloqueado: false, hasta: null, intentos: 0 };
  }
}

function limpiarIntentos() {
  try {
    localStorage.removeItem(STORAGE_KEY_INTENTOS);
    localStorage.removeItem(STORAGE_KEY_BLOQUEO);
  } catch {
    // Silently fail if localStorage is blocked (e.g., private browsing mode)
  }
}

function formatearTiempoRestante(hasta) {
  const diff = Math.max(0, hasta - Date.now());
  const minutos = Math.floor(diff / 60000);
  const segundos = Math.floor((diff % 60000) / 1000);
  return `${minutos}:${String(segundos).padStart(2, "0")}`;
}

// ─── PÁGINA ──────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter();

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
  const [bloqueado, setBloqueado] = useState(false);
  const [bloqueoHasta, setBloqueoHasta] = useState(null);
  const [tiempoRestante, setTiempoRestante] = useState("");

  // ── Restore lockout from localStorage on mount (survives page reloads) ──
  useEffect(() => {
    const estado = obtenerEstadoBloqueo();
    if (estado.bloqueado) {
      setBloqueado(true);
      setBloqueoHasta(estado.hasta);
    }
  }, []);

  // Why countdown timer on interval? User needs to see time passing.
  // Without this, lockout message would be static and confusing (bad UX).
  useEffect(() => {
    if (!bloqueado || !bloqueoHasta) return;
    const tick = () => {
      const diff = bloqueoHasta - Date.now();
      if (diff <= 0) {
        setBloqueado(false);
        setBloqueoHasta(null);
        setTiempoRestante("");
        limpiarIntentos();
        setErrorGlobal("");
      } else {
        setTiempoRestante(formatearTiempoRestante(bloqueoHasta));
      }
    };
    tick();
    const intervalo = setInterval(tick, 1000);
    return () => clearInterval(intervalo);
  }, [bloqueado, bloqueoHasta]);

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
        const estado = registrarIntentoFallido();
        if (estado.bloqueado) {
          // User has exceeded max attempts (Scenario 4)
          setBloqueado(true);
          setBloqueoHasta(estado.hasta);
          setErrorGlobal(
            "Tu cuenta ha sido bloqueada temporalmente por múltiples intentos fallidos. Intenta de nuevo más tarde.",
          );
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
      const estado = registrarIntentoFallido();

      if (estado.bloqueado) {
        setBloqueado(true);
        setBloqueoHasta(estado.hasta);
        setErrorGlobal(
          "Tu cuenta ha sido bloqueada temporalmente por múltiples intentos fallidos. Intenta de nuevo más tarde.",
        );
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
        {errorGlobal && (
          <div className="w-full rounded-md bg-error-light border border-error px-4 py-3 text-sm text-error text-center">
            {errorGlobal}
            {bloqueado && tiempoRestante && (
              <span className="block mt-1 font-semibold">
                Tiempo restante: {tiempoRestante}
              </span>
            )}
          </div>
        )}

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
