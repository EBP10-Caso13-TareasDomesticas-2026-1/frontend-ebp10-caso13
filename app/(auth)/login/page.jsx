"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";

import CenteredLayout from "@/components/layout/CenteredLayout";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";
import { useAuth } from "@/hooks/useAuth";
import { useGroup } from "@/hooks/useGroup";

// ─── CONSTANTES ──────────────────────────────────────────────────────────────

const MAX_INTENTOS = 5;
const BLOQUEO_MS = 15 * 60 * 1000; // 15 minutos en ms
const STORAGE_KEY_INTENTOS = "hs_login_intentos";
const STORAGE_KEY_BLOQUEO = "hs_login_bloqueo_hasta";

// ─── VALIDACIONES ────────────────────────────────────────────────────────────

function validarCorreo(valor) {
  if (!valor.trim()) return "El correo electrónico es obligatorio.";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(valor)) return "Ingresa un correo electrónico válido.";
  return "";
}

function validarContrasena(valor) {
  if (!valor) return "La contraseña es obligatoria.";
  return "";
}

// ─── HELPERS DE BLOQUEO (localStorage) ──────────────────────────────────────
// El bloqueo se maneja en frontend con mocks. Cuando se conecte al backend,
// este puede retornar HTTP 429/423 y este bloqueo local quedaría como respaldo.

function obtenerEstadoBloqueo() {
  try {
    const bloqueoHasta = parseInt(localStorage.getItem(STORAGE_KEY_BLOQUEO) || "0", 10);
    const intentos = parseInt(localStorage.getItem(STORAGE_KEY_INTENTOS) || "0", 10);
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
    const intentos = parseInt(localStorage.getItem(STORAGE_KEY_INTENTOS) || "0", 10) + 1;
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
    // silencioso
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

  // ACOPLAMIENTO: login() viene de AuthContext vía useAuth.
  // Guarda { usuario, token } en el estado del contexto internamente.
  // ⚠️ PENDIENTE: confirmar con Camila si login() retorna la sesión o void.
  // Si retorna void, el flujo es correcto: cargarGrupo() lee del AuthContext.
  const { login } = useAuth();

  // ACOPLAMIENTO: cargarGrupo() viene de GroupContext vía useGroup.
  // NO recibe parámetros — toma usuario y token del AuthContext internamente.
  // Retorna { ok: true } si encontró grupo, { ok: false, error } si no.
  const { cargarGrupo } = useGroup();

  // ── Estado del formulario ──
  const [form, setForm] = useState({ correo: "", contrasena: "" });
  const [errores, setErrores] = useState({ correo: "", contrasena: "" });

  // ── Estado general ──
  const [loading, setLoading] = useState(false);
  const [errorGlobal, setErrorGlobal] = useState("");

  // ── Estado de bloqueo ──
  const [bloqueado, setBloqueado] = useState(false);
  const [bloqueoHasta, setBloqueoHasta] = useState(null);
  const [tiempoRestante, setTiempoRestante] = useState("");

  // ── Verificar bloqueo persistido al montar (sobrevive recarga) ──
  useEffect(() => {
    const estado = obtenerEstadoBloqueo();
    if (estado.bloqueado) {
      setBloqueado(true);
      setBloqueoHasta(estado.hasta);
    }
  }, []);

  // ── Countdown visible del bloqueo ──
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

  // ─── HANDLERS ──────────────────────────────────────────────────────────────

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
    // Escenario 4: bloqueo activo → no intentar
    if (loading || bloqueado) return;
    // Escenario 5: campos vacíos → mostrar errores por campo
    if (!validarTodo()) return;

    setLoading(true);
    setErrorGlobal("");

    try {
      // Escenario 1/2/3: login via AuthContext.
      // Internamente llama a authService.iniciarSesion y guarda
      // { usuario, token } en el estado del contexto.
      const resultadoLogin = await login({
        correo: form.correo.trim(),
        contrasena: form.contrasena,
      });

      if (!resultadoLogin.ok) {
        const estado = registrarIntentoFallido();
        if (estado.bloqueado) {
          // Escenario 4: 5 intentos alcanzados → bloquear cuenta
          setBloqueado(true);
          setBloqueoHasta(estado.hasta);
          setErrorGlobal(
            "Tu cuenta ha sido bloqueada temporalmente por múltiples intentos fallidos. Intenta de nuevo más tarde."
          );
        } else {
          // Escenario 2 y 3: mensaje genérico (nunca revelar cuál campo falló)
          setErrorGlobal("El correo o la contraseña son incorrectos.");
        }
        setLoading(false);
        return;
      }

      // Login exitoso → limpiar intentos fallidos acumulados
      limpiarIntentos();

      // Escenario 1 vs 6: verificar membresía en grupo.
      // cargarGrupo() lee usuario y token del AuthContext (ya actualizados).
      const resultado = await cargarGrupo();

      if (resultado.ok) {
        // Escenario 1: tiene grupo → tablero principal
        router.push("/bienvenida"); // TODO:en el siguiente Sprint se cambia por dashboard
      } else if (resultado.noGrupo) {
        // Escenario 6: sin grupo → pantalla de bienvenida
        router.push("/bienvenida");
      } else {
        // Error inesperado al consultar grupo
        setErrorGlobal(resultado.error || "No se pudo cargar la información del grupo.");
        setLoading(false);
        return;
      }
    } catch (error) {
      // Solo llega aquí si login() lanzó excepción (credenciales incorrectas)
      const estado = registrarIntentoFallido();

      if (estado.bloqueado) {
        // Escenario 4: 5 intentos alcanzados → bloquear cuenta
        setBloqueado(true);
        setBloqueoHasta(estado.hasta);
        setErrorGlobal(
          "Tu cuenta ha sido bloqueada temporalmente por múltiples intentos fallidos. Intenta de nuevo más tarde."
        );
      } else {
        // Escenario 2 y 3: mensaje genérico (nunca revelar cuál campo falló)
        setErrorGlobal("El correo o la contraseña son incorrectos.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ─── NAVBAR CONTENT ────────────────────────────────────────────────────────

  const navbarContent = (
    <Button
      variant="primary"
      onClick={() => router.push("/registro")}
      className="text-sm"
    >
      Registrarse
    </Button>
  );

  // ─── RENDER ────────────────────────────────────────────────────────────────

  return (
    <CenteredLayout navbarContent={navbarContent}>
      <div className="flex flex-col items-center gap-6 w-full">

        {/* ── Encabezado ── */}
        <div className="flex flex-col items-center gap-1 mt-2">
          <h1 className="text-2xl font-bold text-foreground">Iniciar sesión</h1>
          <p className="text-sm text-secondary text-center">
            Gestiona tus tareas del hogar de forma sencilla
          </p>
        </div>

        {/* ── Error global / Bloqueo ── */}
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

        {/* ── Formulario ── */}
        <div className="flex flex-col gap-4 w-full">

          {/* Correo electrónico */}
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

          {/* Contraseña */}
          <div className="flex flex-col gap-1">
            <PasswordInput
              label="Contraseña"
              placeholder="••••••••"
              value={form.contrasena}
              onChange={handleChange("contrasena")}
              error={errores.contrasena}
              disabled={loading || bloqueado}
            />
            {/* ¿Olvidaste tu contraseña? — Placeholder para futura HU */}
            <div className="flex justify-end">
              <button
                type="button"
                className="text-xs text-secondary hover:text-primary hover:underline transition-colors"
                onClick={() => {
                  /* TODO: HU de recuperación de contraseña */
                }}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </div>
        </div>

        {/* ── Botón de login ── */}
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={loading || bloqueado}
          className="w-full"
        >
          {loading ? "Iniciando sesión..." : "Iniciar sesión"}
        </Button>

        {/* ── Separador ── */}
        <div className="flex items-center gap-3 w-full">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-secondary uppercase tracking-wide">
            O BIEN
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* ── Link a registro ── */}
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
