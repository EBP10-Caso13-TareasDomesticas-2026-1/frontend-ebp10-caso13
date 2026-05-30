// Ubicación: /app/test/page.jsx
// Para verla: http://localhost:3000/test

"use client";

import { useState } from "react";
import LogOut from "@/components/ui/LogOut";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import Button from "@/components/ui/Button";
import Image from "next/image";

export default function TestPage() {

  const [showLogout, setShowLogout] = useState(false);
  const [showDeleteMember, setShowDeleteMember] = useState(false);
  const [showDeleteTask, setShowDeleteTask] = useState(false);
  const [showLeaveGroupAdmin, setShowLeaveGroupAdmin] = useState(false);
  const [selectedNewAdmin, setSelectedNewAdmin] = useState("");

  const mockMembers = [
    { id: 1, nombre: "Ana López" },
    { id: 2, nombre: "Juan García" },
    { id: 3, nombre: "María Rodríguez" },
  ];

  return (
    <div className="p-8 space-y-6 max-w-2xl">

      <h1 className="text-2xl font-bold">Testing: ConfirmationModal con SVGs</h1>

      {/* Logout */}
      <div className="border-l-4 border-blue-500 pl-4">
        <h2 className="font-semibold mb-2">1. Logout (alias LogOut)</h2>
        <Button variant="danger" onClick={() => setShowLogout(true)}>
          Probar Logout
        </Button>
        <LogOut
          isOpen={showLogout}
          onConfirm={() => {
            alert("✅ Sesión cerrada");
            setShowLogout(false);
          }}
          onCancel={() => setShowLogout(false)}
        />
      </div>

      {/* Eliminar Miembro */}
      <div className="border-l-4 border-red-500 pl-4">
        <h2 className="font-semibold mb-2">2. Eliminar Miembro</h2>
        <Button variant="danger" onClick={() => setShowDeleteMember(true)}>
          Probar Eliminar Miembro
        </Button>
        <ConfirmationModal
          isOpen={showDeleteMember}
          icon={<Image src="/usuario-eliminar.svg" width={32} height={32} alt="delete member" />}
          title="¿Eliminar a Ana López?"
          description="Esta acción revocará su acceso al grupo familiar."
          confirmText="Eliminar miembro"
          cancelText="Cancelar"
          variant="danger"
          onConfirm={() => {
            alert("✅ Miembro eliminado");
            setShowDeleteMember(false);
          }}
          onCancel={() => setShowDeleteMember(false)}
        />
      </div>

      {/* Eliminar Tarea */}
      <div className="border-l-4 border-orange-500 pl-4">
        <h2 className="font-semibold mb-2">3. Eliminar Tarea</h2>
        <Button variant="danger" onClick={() => setShowDeleteTask(true)}>
          Probar Eliminar Tarea
        </Button>
        <ConfirmationModal
          isOpen={showDeleteTask}
          icon={<Image src="/papelera.svg" width={32} height={32} alt="delete task" />}
          title="¿Eliminar tarea?"
          description="Esta acción no se puede deshacer. La tarea será eliminada permanentemente."
          confirmText="Eliminar tarea"
          cancelText="Cancelar"
          variant="danger"
          onConfirm={() => {
            alert("✅ Tarea eliminada");
            setShowDeleteTask(false);
          }}
          onCancel={() => setShowDeleteTask(false)}
        />
      </div>

      {/* Abandonar Grupo como Admin */}
      <div className="border-l-4 border-purple-500 pl-4">
        <h2 className="font-semibold mb-2">4. Abandonar Grupo (Admin con selector)</h2>
        <Button variant="danger" onClick={() => setShowLeaveGroupAdmin(true)}>
          Probar Abandonar Grupo
        </Button>
        <ConfirmationModal
          isOpen={showLeaveGroupAdmin}
          icon={<Image src="/salida-grupo.svg" width={32} height={32} alt="leave group" />}
          title="¿Abandonar grupo?"
          description="Como administrador, debes designar a otro miembro como nuevo admin."
          confirmText="Abandonar grupo"
          cancelText="Cancelar"
          variant="danger"
          showMemberSelector={true}
          members={mockMembers}
          selectedMemberId={selectedNewAdmin}
          onMemberChange={setSelectedNewAdmin}
          onConfirm={() => {
            if (!selectedNewAdmin) {
              alert("⚠️ Debes seleccionar un nuevo admin");
              return;
            }
            alert(`✅ Nuevo admin asignado a: ${mockMembers.find(m => m.id == selectedNewAdmin)?.nombre}`);
            setShowLeaveGroupAdmin(false);
            setSelectedNewAdmin("");
          }}
          onCancel={() => {
            setShowLeaveGroupAdmin(false);
            setSelectedNewAdmin("");
          }}
        />
      </div>

    </div>
  );
}
