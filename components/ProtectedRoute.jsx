"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * ProtectedRoute
 * Componente que protege rutas autenticadas.
 * - Espera a que el cliente se hidrate (AuthContext cargó desde localStorage)
 * - Si el usuario NO tiene token, usa router.replace() para redirigir sin ensuciar el historial
 *
 * Uso:
 * <ProtectedRoute>
 *   <MiComponente />
 * </ProtectedRoute>
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isHydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Solo redirigir después de que el cliente esté hidratado
    if (!isHydrated) return;

    if (!isAuthenticated) {
      // router.replace() no deja la ruta protegida en el historial
      router.replace("/login");
    }
  }, [isAuthenticated, isHydrated, router]);

  // Mientras se hidrata, no renderizar nada
  if (!isHydrated) {
    return null;
  }

  // Si está autenticado, renderizar el contenido
  if (!isAuthenticated) {
    return null;
  }

  return children;
}
