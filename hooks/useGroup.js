import { useContext } from "react";
import { GroupContext } from "@/context/GroupContext";

/**
 * useGroup
 * Hook wrapper de GroupContext.
 * Evita importar useContext + GroupContext en cada componente.
 *
 * Uso:
 *   const { grupo, rolActual, crearGrupo, unirseAlGrupo, cargarGrupo } = useGroup();
 *
 * Lanza error si se usa fuera de <GroupProvider>.
 */
export function useGroup() {
  const context = useContext(GroupContext);

  if (!context) {
    throw new Error("useGroup debe usarse dentro de <GroupProvider>");
  }

  return context;
}