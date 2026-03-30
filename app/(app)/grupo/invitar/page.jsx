"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import AppLayout from "@/components/layout/AppLayout";
import Button from "@/components/ui/Button";
import InviteCodeCard from "@/components/ui/InviteCodeCard";

import { useAuth } from "@/hooks/useAuth";
import groupService from "@/services/groupService";

function generarCodigoLocal(codigoActual) {
  let intento = 0;
  while (intento < 1000) {
    const codigo = Math.random().toString(36).substring(2, 8).toUpperCase();
    if (codigo.length === 6 && codigo !== codigoActual) return codigo;
    intento += 1;
  }
  return codigoActual || "------";
}

export default function InvitarMiembrosPage() {
  const router = useRouter();
  const { isAuthenticated, token, logout, usuario } = useAuth();

  const [loading, setLoading] = useState(false);
  const [grupo, setGrupo] = useState(null);
  const [rolActual, setRolActual] = useState(null);
  const [codigo, setCodigo] = useState(null);
  const [toast, setToast] = useState(false);
  const [regenerando, setRegenerando] = useState(false);
  const [errorLocal, setErrorLocal] = useState(null);

  const esAdmin = useMemo(() => rolActual === "admin", [rolActual]);

  useEffect(() => {
    let alive = true;

    async function init() {
      setErrorLocal(null);
      if (!isAuthenticated) return;

      if (!usuario?.idUsuario) return;

      setLoading(true);
      try {
        const miembroData = await groupService.obtenerGrupoDeUsuario(
          usuario.idUsuario,
          token
        );
        if (!miembroData) {
          if (!alive) return;
          setGrupo(null);
          setRolActual(null);
          setCodigo(null);
          return;
        }

        const grupoData = miembroData.grupoId
          ? await groupService.obtenerGrupo(miembroData.grupoId, token)
          : miembroData;

        if (!alive) return;

        setGrupo(grupoData);
        setRolActual(miembroData.rolId === 1 ? "admin" : "miembro");
        setCodigo(grupoData?.codigoInvitacion ?? null);
      } catch (e) {
        if (alive) setErrorLocal(e.message ?? "No se pudo cargar el grupo");
      } finally {
        if (alive) setLoading(false);
      }
    }

    init();
    return () => {
      alive = false;
    };
  }, [isAuthenticated, usuario?.idUsuario, token]);

  const mostrarToast = () => {
    setToast(true);
    window.setTimeout(() => setToast(false), 1800);
  };

  const handleCardClickCapture = (e) => {
    const el = e.target;
    if (el instanceof HTMLElement && el.closest("button")) {
      mostrarToast();
    }
  };

  const handleRegenerar = async () => {
    if (!grupo?.id) return;
    setErrorLocal(null);
    setRegenerando(true);

    try {
      if (typeof groupService.regenerarCodigoInvitacion === "function") {
        const data = await groupService.regenerarCodigoInvitacion(grupo.id, token);
        setCodigo(data?.codigoInvitacion ?? codigo);
        return;
      }

      const nuevo = generarCodigoLocal(codigo);
      setCodigo(nuevo);
    } catch (e) {
      setErrorLocal(e.message ?? "No se pudo generar un nuevo código");
    } finally {
      setRegenerando(false);
    }
  };

  const navbarContent = (
    <>
      <Button
        variant="secondary"
        onClick={() => router.push("/perfil")}
        className="hidden sm:inline-flex"
      >
        Perfil
      </Button>
      <Button
        variant="primary"
        onClick={async () => {
          await logout();
          router.push("/login");
        }}
      >
        Cerrar sesión
      </Button>
    </>
  );

  return (
    <AppLayout navbarContent={navbarContent}>
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-foreground text-white text-sm px-4 py-2 rounded-md shadow-lg">
            Código copiado
          </div>
        </div>
      )}

      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-full max-w-2xl">
          <div className="flex flex-col items-center text-center gap-2">
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
                  d="M16 11c1.66 0 3-1.34 3-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M8 11c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  opacity="0.7"
                />
                <path
                  d="M16 13c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M6 13.4C4.03 14.12 2 15.37 2 17v2h4"
                  stroke="currentColor"
                  strokeWidth="2"
                  opacity="0.7"
                />
              </svg>
            </div>

            <h1>Invitar miembros</h1>
            <p className="text-sm text-primary font-medium">
              {grupo?.nombre ?? "—"}
            </p>
          </div>

          <div className="mt-8 flex flex-col items-center gap-5">
            {!isAuthenticated ? (
              <div className="card-outlined w-full max-w-md text-center">
                <h3 className="mb-2">Necesitas iniciar sesión</h3>
                <p className="text-sm text-secondary mb-4">
                  Esta vista es solo para usuarios autenticados.
                </p>
                <Button className="w-full" onClick={() => router.push("/login")}>
                  Ir a iniciar sesión
                </Button>
              </div>
            ) : loading ? (
              <div className="card-outlined w-full max-w-md text-center">
                <p className="text-sm text-secondary">Cargando…</p>
              </div>
            ) : !esAdmin ? (
              <div className="card-outlined w-full max-w-md text-center">
                <h3 className="mb-2">Acceso restringido</h3>
                <p className="text-sm text-secondary">
                  Solo el administrador puede ver o generar el código de invitación.
                </p>
                <Button
                  variant="secondary"
                  className="mt-4 w-full"
                  onClick={() => router.push("/bienvenida")}
                >
                  Volver
                </Button>
              </div>
            ) : (
              <>
                <div onClickCapture={handleCardClickCapture} className="w-full max-w-md">
                  <InviteCodeCard code={codigo ?? "------"} className="w-full" />
                </div>

                <div className="text-center text-xs text-secondary max-w-md">
                  Comparte este código con los miembros de tu hogar para que puedan unirse y
                  empezar a colaborar.
                </div>

                <Button
                  className="w-full max-w-md py-3"
                  onClick={() => router.push("/bienvenida")}
                >
                  Ir al tablero →
                </Button>

                <button
                  type="button"
                  className="text-sm text-primary hover:text-primary-hover"
                  onClick={() => router.push("/bienvenida")}
                >
                  Omitir por ahora
                </button>

                <button
                  type="button"
                  disabled={regenerando}
                  className="mt-2 text-xs text-secondary hover:text-foreground disabled:opacity-50"
                  onClick={handleRegenerar}
                >
                  {regenerando ? "Generando nuevo código…" : "Generar nuevo código"}
                </button>

                <p className="text-[11px] text-secondary text-center max-w-md">
                  Podrás invitar a más personas más adelante desde la configuración de tu
                  residencia.
                </p>
              </>
            )}

            {errorLocal && (
              <div className="w-full max-w-md">
                <p className="text-sm text-error text-center">{errorLocal}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
