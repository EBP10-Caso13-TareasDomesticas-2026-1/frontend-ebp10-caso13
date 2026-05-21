// Ubicación: /app/test/page.jsx
// Para verla: http://localhost:3000/test

"use client";

import { useState } from "react";
import LogOut from "@/components/ui/LogOut";
import Button from "@/components/ui/Button";

export default function TestPage() {

  const [showModal, setShowModal] = useState(false);

  return (
    <div className="p-8 flex flex-col gap-4 max-w-sm">

      <h1>Testing: Modal</h1>

      <Button variant="danger" onClick={() => setShowModal(true)}>
        Cerrar sesión
      </Button>

      <LogOut
        isOpen={showModal}
        onConfirm={() => {
          alert("✅ Confirmado — aquí iría el logout real");
          setShowModal(false);
        }}
        onCancel={() => setShowModal(false)}
      />

    </div>
  );
}
