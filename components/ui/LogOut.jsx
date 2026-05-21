// Alias del componente ConfirmationModal pre-configurado para logout
// Mantiene compatibilidad con código existente

import ConfirmationModal from "@/components/ui/ConfirmationModal";
import Image from "next/image";

export default function LogOut(props) {
  return (
    <ConfirmationModal
      icon={<Image src="/salida.png" width={32} height={32} alt="logout icon" />}
      title="¿Cerrar Sesión?"
      description="¿Estás seguro que deseas cerrar sesión? Tendrás que volver a ingresar tus credenciales para acceder."
      confirmText="Si, cerrar sesión"
      cancelText="Cancelar"
      variant="danger"
      {...props}
    />
  );
}
