"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

import AppLayout from "@/components/layout/AppLayout";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

// Carga dinámica para evitar el error de "use client" mal ubicado en LogOut.jsx
const LogOut = dynamic(() => import("@/components/ui/LogOut"), { ssr: false });

export default function BienvenidaPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/login"); // TODO: ajustar si la ruta de login cambia
  };

  // ─── CONTENIDO DE LA NAVBAR ───────────────────────────────────
  const navbarContent = (
    <>
      <Button
        variant="secondary"
        disabled
        onClick={() => router.push("/perfil")} // TODO: actualizar cuando exista pantalla de perfil
      >
        <span className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
            />
          </svg>
          Perfil
        </span>
      </Button>

      <Button
        variant="primary"
        onClick={() => setShowLogoutModal(true)}
      >
        <span className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H2.25"
            />
          </svg>
          Cerrar sesión
        </span>
      </Button>
    </>
  );

  // ─── RENDER ───────────────────────────────────────────────────
  return (
    <>
      <AppLayout navbarContent={navbarContent}>
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-4">

          {/* Título y subtítulo */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-3">
              Bienvenido/a
            </h1>
            <p className="text-secondary text-base max-w-xs mx-auto">
              Organiza las tareas de tu hogar con tu familia en un solo lugar.
            </p>
          </div>

          {/* Tarjeta con acciones */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-sm p-2 flex flex-col gap-1">

            {/* TODO: actualizar ruta cuando Alejandro Toro defina la pantalla de HU-004 */}
            <Button
              variant="primary"
              className="w-full"
              onClick={() => router.push("/grupo/crear")}
            >
              ⊕ Crear grupo
            </Button>

            {/* TODO: actualizar ruta cuando Daniel Salas defina la pantalla de HU-005 */}
            <Button
              variant="secondary"
              className="w-full"
              disabled
              onClick={() => router.push("/grupo/unirse")}
            >
              Unirse a un Grupo
            </Button>

          </div>
        </div>
      </AppLayout>

      {/* Modal de confirmación de cierre de sesión */}
      <LogOut
        isOpen={showLogoutModal}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </>
  );
}
