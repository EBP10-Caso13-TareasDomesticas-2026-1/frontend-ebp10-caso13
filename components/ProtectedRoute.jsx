"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * ProtectedRoute
 * Componente que protege rutas autenticadas.
 * - Espera a que AuthContext esté inicializado
 * - Si el usuario NO tiene token, redirige a /login
 *
 * Uso:
 * <ProtectedRoute>
 *   <MiComponente />
 * </ProtectedRoute>
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isInitialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Solo redirigir después de que el contexto esté listo
    if (!isInitialized) return;

    if (!isAuthenticated) {
      router.push("/login?sesion_expirada=true");
    }
  }, [isAuthenticated, isInitialized, router]);

  // Mientras se inicializa, no renderizar nada
  if (!isInitialized) {
    return null;
  }

  // Si está autenticado, renderizar el contenido
  if (!isAuthenticated) {
    return null;
  }

  return children;
}
