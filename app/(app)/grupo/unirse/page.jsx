"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import LogOut from "@/components/ui/LogOut";
import { useAuth } from "@/hooks/useAuth";
import { useGroup } from "@/hooks/useGroup";
import { useRateLimit } from "@/hooks/useRateLimit";
import groupService from "@/services/groupService";

/**
 * HUS-022: Unirse a un grupo familiar
 * 
 * Permite que un usuario registrado se una a un grupo existente
 * ingresando un código de invitación válido de 6 caracteres.
 */
function UnirseAlGrupoContent() {
  const router = useRouter();
  const { usuario, logout, token } = useAuth();
  const { unirseAlGrupo, loading: loadingGrupo, error: errorGrupo } = useGroup();
  const { bloqueado, bloqueoHasta, registrarIntento, limpiarIntentos, formatearTiempo } = useRateLimit(
    10, // maxIntentos
    5, // ventanaMinutos
    15, // bloqueoMinutos
    "hs_unirse_intentos",
    "hs_unirse_bloqueo_hasta"
  );

  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hasGroup, setHasGroup] = useState(false);
  const [membershipLoading, setMembershipLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  useEffect(() => {
    let active = true;

    async function checkMembership() {
      if (!mounted || !usuario?.idUsuario || !token) {
        setHasGroup(false);
        return;
      }

      // Verificar bloqueo por rate limiting
      if (bloqueado) return;

      setMembershipLoading(true);
      setError("");

      try {
        const miembroData = await groupService.obtenerGrupoDeUsuario(
          usuario.idUsuario,
          token,
        );
        if (!active) return;

        if (miembroData) {
          setHasGroup(true);
        } else {
          setHasGroup(false);
        }
      } catch (err) {
        if (!active) return;
        setHasGroup(false);
      } finally {
        if (active) setMembershipLoading(false);
      }
    }

    checkMembership();
    return () => {
      active = false;
    };
  }, [mounted, usuario?.idUsuario, token, bloqueado]);

  const navbarContent = mounted ? (
    <>
      <Button variant="primary" onClick={() => setShowLogoutModal(true)}>
        Cerrar sesión
      </Button>
    </>
  ) : null;

  /**
   * Valida que el código tenga exactamente 6 caracteres (alfanuméricos)
   */
  const validarCodigo = (valor) => {
    const regex = /^[A-Z0-9]{6}$/;
    return regex.test(valor);
  };

  /**
   * Maneja el envío del formulario
   */
  const handleUnirse = async (e) => {
    e.preventDefault();
    setError("");

    // Verificar bloqueo
    if (bloqueado) {
      return;
    }

    // Validación básica
    if (!codigo.trim()) {
      setError("Por favor, ingresa el código de invitación.");
      return;
    }

    if (!validarCodigo(codigo.toUpperCase())) {
      setError("El código debe tener 6 caracteres alfanuméricos (ej: ABC123).");
      registrarIntento();
      return;
    }

    setLoading(true);

    try {
      // Llamar al contexto de grupo para unirse
      const resultado = await unirseAlGrupo(codigo.toUpperCase());

      if (resultado.ok) {
        // Éxito: limpiar intentos y redirigir
        limpiarIntentos();
        router.push("/tablero");
      } else {
        // Error del contexto: registrar intento fallido
        const mensajeError = resultado.error || "El código de invitación no es válido.";
        setError(mensajeError);
        registrarIntento();
      }
    } catch (err) {
      // Error no manejado
      setError("Error inesperado al unirse al grupo.");
      registrarIntento();
    } finally {
      setLoading(false);
    }
  };

  /**
   * Maneja el clic en "Cancelar"
   */
  const handleCancelar = () => {
    router.push("/bienvenida");
  };

  if (!mounted) {
    return (
      <AppLayout navbarContent={null}>
        <div className="min-h-[70vh] flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-xl">
            <div className="card-outlined p-6 text-center">
              <p className="text-sm text-secondary">Cargando sesión…</p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <>
      <AppLayout navbarContent={navbarContent}>
        <div className="min-h-[70vh] flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-xl">
            <div className="flex flex-col items-center text-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center border border-border">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-primary"
                >
                  <path
                    d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M4 20c0-2.21 1.79-4 4-4h8c2.21 0 4 1.79 4 4"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <h1>Unirse a un grupo familiar</h1>
              <p className="text-sm text-primary font-medium">
                Ingresa el código de 6 caracteres de la invitación
              </p>
            </div>

            <form onSubmit={handleUnirse} className="card-outlined p-6 space-y-6">
              {membershipLoading && (
                <div className="text-sm text-secondary text-center">
                  Verificando tu grupo familiar…
                </div>
              )}

              {hasGroup && !membershipLoading && (
                <div className="rounded-lg bg-primary/10 border border-primary text-primary px-4 py-3 text-sm">
                  Ya perteneces a un grupo familiar. No puedes unirte a otro grupo.
                </div>
              )}

              {bloqueado && !membershipLoading && (
                <div className="rounded-lg bg-error/10 border border-error text-error px-4 py-3 text-sm">
                  <p className="font-medium mb-1">Demasiados intentos fallidos</p>
                  <p>Se ha excedido el número de intentos permitidos. Intenta de nuevo en {bloqueoHasta ? formatearTiempo(bloqueoHasta) : "unos momentos"}.</p>
                </div>
              )}

              <div className="space-y-4">
                <Input
                  label="Código de invitación"
                  placeholder="ABC123"
                  type="text"
                  value={codigo}
                  onChange={(e) => {
                    const valor = e.target.value.toUpperCase().slice(0, 6);
                    setCodigo(valor);
                    setError("");
                  }}
                  disabled={loading || loadingGrupo || membershipLoading || hasGroup || bloqueado}
                />
                <p className="text-xs text-secondary">
                  Formato: 6 caracteres alfanuméricos (ej: ABC123)
                </p>
              </div>

              {error && (
                <div className="rounded-lg bg-error/10 border border-error text-error px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              {errorGrupo && !error && (
                <div className="rounded-lg bg-error/10 border border-error text-error px-4 py-3 text-sm">
                  {errorGrupo}
                </div>
              )}

              <div className="flex flex-col gap-3">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || loadingGrupo || membershipLoading || hasGroup || bloqueado || !codigo.trim()}
                >
                  {loading || loadingGrupo ? "Procesando..." : "Unirse al Grupo"}
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  disabled={loading || loadingGrupo || membershipLoading}
                  onClick={handleCancelar}
                  className="w-full"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      </AppLayout>

      {mounted && (
        <LogOut
          isOpen={showLogoutModal}
          title="¿Cerrar sesión?"
          description="Se cerrará tu sesión en HomeSync."
          confirmText="Cerrar sesión"
          cancelText="Cancelar"
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutModal(false)}
          variant="danger"
        />
      )}
    </>
  );
}

export default function UnirseAlGrupoPage() {
  return (
    <ProtectedRoute>
      <UnirseAlGrupoContent />
    </ProtectedRoute>
  );
}

