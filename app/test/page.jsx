// Ubicación: /app/test/page.jsx
// Para verla: http://localhost:3000/test

"use client";

import InviteCodeCard from "@/components/ui/InviteCodeCard";

export default function TestPage() {
  return (
    <div className="p-8 flex flex-col gap-6 max-w-sm">

      <h1>Testing: InviteCodeCard</h1>

      {/* Código de prueba */}
      <InviteCodeCard code="2026-XYZ" />

      {/* Otro código para verificar que la prop funciona */}
      <InviteCodeCard code="ABCD-123" />

    </div>
  );
}