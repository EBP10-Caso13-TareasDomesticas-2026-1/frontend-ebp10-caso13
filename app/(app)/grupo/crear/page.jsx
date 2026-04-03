"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import AppLayout from "@/components/layout/AppLayout";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import groupService from "@/services/groupService";

const MAX_NAME_LENGTH = 50;
const LogOut = dynamic(() => import("@/components/ui/LogOut"), { ssr: false });

export default function CrearGrupoPage() {
  const router = useRouter();
  const { isAuthenticated, usuario, token, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [membershipLoading, setMembershipLoading] = useState(false);
  const [hasGroup, setHasGroup] = useState(false);
  const [mounted, setMounted] = useState(false);

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
      if (!isAuthenticated || !usuario?.idUsuario) {
        setHasGroup(false);
        return;
      }

      setMembershipLoading(true);
      setInfo("");
      setError("");

      try {
        const miembroData = await groupService.obtenerGrupoDeUsuario(
          usuario.idUsuario,
          token,
        );
        if (!active) return;

        if (miembroData) {
          setHasGroup(true);
          setInfo(
            "Ya perteneces a un grupo familiar. Debes abandonar tu grupo actual para poder crear uno nuevo.",
          );
        } else {
          setHasGroup(false);
        }
      } catch (err) {
        if (!active) return;
        const mensaje =
          err?.message || "No se pudo verificar tu grupo familiar.";
        setError(mensaje);
      } finally {
        if (active) setMembershipLoading(false);
      }
    }

    checkMembership();
    return () => {
      active = false;
    };
  }, [isAuthenticated, usuario?.idUsuario, token]);

  const navbarContent = mounted ? (
    <>
      <Button
        variant="secondary"
        disabled
        onClick={() => router.push("/perfil")}
        className="hidden sm:inline-flex"
      >
        Perfil
      </Button>
      {isAuthenticated ? (
        <Button variant="primary" onClick={() => setShowLogoutModal(true)}>
          Cerrar sesión
        </Button>
      ) : (
        <Button variant="primary" onClick={() => router.push("/login")}>
          Iniciar sesión
        </Button>
      )}
    </>
  ) : null;

  const handleNombreChange = (event) => {
    const value = event.target.value.slice(0, MAX_NAME_LENGTH);
    setNombre(value);
    if (value.length === MAX_NAME_LENGTH) {
      setError("El nombre es demasiado largo");
    } else {
      setError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setInfo("");

    const trimmed = nombre.trim();
    if (!trimmed) {
      setError("El nombre del grupo es obligatorio");
      return;
    }

    if (trimmed.length > MAX_NAME_LENGTH) {
      setError("El nombre es demasiado largo");
      return;
    }

    if (hasGroup) {
      setError(
        "Ya perteneces a un grupo familiar. Debes abandonar tu grupo actual para poder crear uno nuevo.",
      );
      return;
    }

    setLoading(true);

    try {
      const grupoCreado = await groupService.crearGrupo(
        { nombre: trimmed },
        token,
      );
      router.push(
        `/grupo/invitar?codigo=${encodeURIComponent(grupoCreado.codigoInvitacion)}`,
      );
    } catch (err) {
      setError(err?.message || "No se pudo crear el grupo.");
    } finally {
      setLoading(false);
    }
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

  return ( <>
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
            <h1>Crear grupo familiar</h1>
            <p className="text-sm text-primary font-medium">
              Organiza las tareas de tu hogar con tu familia.
            </p>
          </div>

          {!isAuthenticated ? (
            <div className="card-outlined p-6 text-center">
              <h3 className="mb-3">Necesitas iniciar sesión</h3>
              <p className="text-sm text-secondary mb-6">
                Inicia sesión para crear tu grupo familiar y convertirte en
                administrador.
              </p>
              <Button className="w-full" onClick={() => router.push("/login")}>
                Ir a iniciar sesión
              </Button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="card-outlined p-6 space-y-6"
            >
              <div className="space-y-4">
                <Input
                  label="Nombre del grupo"
                  placeholder="Ej. Casa Familia Pérez"
                  value={nombre}
                  onChange={handleNombreChange}
                  error={error}
                  disabled={loading || membershipLoading || hasGroup}
                />
                <p className="text-xs text-secondary">
                  Máximo {MAX_NAME_LENGTH} caracteres.
                </p>
              </div>

              {membershipLoading && (
                <div className="text-sm text-secondary text-center">
                  Verificando tu grupo familiar…
                </div>
              )}

              {info && !error && (
                <div className="rounded-lg bg-primary/10 border border-primary text-primary px-4 py-3 text-sm">
                  {info}
                </div>
              )}

              {error && (
                <div className="rounded-lg bg-error/10 border border-error text-error px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-3">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || membershipLoading || hasGroup}
                >
                  {loading ? "Creando grupo…" : "Crear"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={() => router.push("/bienvenida")}
                >
                  Volver a bienvenida
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </AppLayout>
    <LogOut
  isOpen={showLogoutModal}
  onConfirm={handleLogout}
  onCancel={() => setShowLogoutModal(false)}
/> </>
  );
}
