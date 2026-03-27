"use client";
import { useState } from "react";
import LogOut from "@/components/ui/LogOut";

export default function TestModal() {
  const [isOpen, setIsOpen] = useState(false);

  const handleConfirm = () => {
    console.log("Confirmó cerrar sesión");
    setIsOpen(false);
  };

  const handleCancel = () => {
    console.log("Canceló");
    setIsOpen(false);
  };

  return (
    <div className="h-screen flex items-center justify-center bg-background">

      {/* Botón para abrir el modal */}
      <button
        onClick={() => setIsOpen(true)}
        className="bg-primary text-white px-4 py-2 rounded-md"
      >
        Abrir Modal
      </button>

      {/* Tu modal */}
      <LogOut
        isOpen={isOpen}
        title="¿Cerrar sesión?"
        description="Esta acción cerrará tu sesión actual."
        confirmText="Sí, salir"
        cancelText="Cancelar"
        variant="primary"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />

    </div>
  );
}