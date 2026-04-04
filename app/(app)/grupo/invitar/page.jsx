"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import AppLayout from "@/components/layout/AppLayout";
import Button from "@/components/ui/Button";
import InviteCodeCard from "@/components/ui/InviteCodeCard";
import { useAuth } from "@/hooks/useAuth";

const LogOut = dynamic(() => import("@/components/ui/LogOut"), {
  ssr: false,
});

function InvitarGrupoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, logout } = useAuth();
  const codigo = searchParams.get("codigo");
  const [mounted, setMounted] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

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

  const content = useMemo(() => {
    if (!isAuthenticated) {
      return (
        <div className="card-outlined p-6 text-center">
          <h3 className="mb-3">Necesitas iniciar sesión</h3>
          <p className="text-sm text-secondary mb-6">
            Solo los usuarios registrados pueden ver el código de invitación.
          </p>
          <Button className="w-full" onClick={() => router.push("/login")}>
            Ir a iniciar sesión
          </Button>
        </div>
      );
    }

    if (!codigo) {
      return (
        <div className="card-outlined p-6 text-center">
          <h3 className="mb-3">Código no disponible</h3>
          <p className="text-sm text-secondary mb-6">
            No se recibió un código de invitación. Regresa a la pantalla de
            crear grupo.
          </p>
          <Button
            className="w-full"
            onClick={() => router.push("/grupo/crear")}
          >
            Volver a crear grupo
          </Button>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center gap-6">
        <InviteCodeCard code={codigo} className="w-full max-w-md" />
        <p className="text-center text-sm text-secondary max-w-md">
          Comparte este código con los miembros de tu hogar para que puedan
          unirse.
        </p>
        <Button
          className="w-full max-w-md"
          disabled
          onClick={() => router.push("/dashboard")}
        >
          Ir al tablero →
        </Button>
      </div>
    );
  }, [codigo, isAuthenticated, router]);

  if (!mounted) {
    return (
      <AppLayout navbarContent={null}>
        <div className="min-h-[70vh] flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-2xl">
            <div className="card-outlined p-6 text-center">
              <p className="text-sm text-secondary">Cargando sesión…</p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (<>
    <AppLayout navbarContent={navbarContent}>
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
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
                  d="M5 12h14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M12 5v14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h1>Código de invitación</h1>
            <p className="text-sm text-primary font-medium">
              Comparte el código con los miembros de tu hogar.
            </p>
          </div>

          {content}
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

function InvitarFallback() {
  return (
    <AppLayout navbarContent={null}>
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          <div className="card-outlined p-6 text-center">
            <p className="text-sm text-secondary">Cargando…</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default function InvitarGrupoPage() {
  return (
    <Suspense fallback={<InvitarFallback />}>
      <InvitarGrupoContent />
    </Suspense>
  );
}
