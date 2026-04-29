"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * ProtectedRoute
 * 
 * Wraps a component and only renders it if user is authenticated.
 * Why wait for hydration? Next.js renders on server where localStorage is empty.
 * Without isHydrated, we'd redirect to /login during SSR, causing hydration mismatch.
 * Why use router.replace()? It removes the protected route from browser history,
 * preventing users from navigating back to it after logging in.
 *
 * Usage:
 * <ProtectedRoute>
 *   <Dashboard />
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

  // Defensive check: if not authenticated, don't render
  // (redirect should have already happened in the effect)
  if (!isAuthenticated) {
    return null;
  }

  return children;
}
