// Ubicación: /app/test/page.jsx
// Para verla: http://localhost:3000/test

"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";

export default function TestPage() {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [pin, setPin] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [confirmar, setConfirmar] = useState("");

  return (
    <div className="p-8 flex flex-col gap-6 max-w-sm">

      <h1>Testing: Input y PasswordInput</h1>

      {/* ── INPUT NORMAL ── */}
      <h2>Input</h2>

      <Input
        label="Nombre completo"
        placeholder="Ej. Juan Pérez"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />

      <Input
        label="Correo electrónico"
        type="email"
        placeholder="ejemplo@correo.com"
        value={correo}
        onChange={(e) => setCorreo(e.target.value)}
        error="El correo no es válido"
      />

      <Input
        label="Pin de Seguridad (5 dígitos)"
        type="tel"
        placeholder="•••••"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
      />

      {/* ── PASSWORD INPUT ── */}
      <h2>PasswordInput</h2>

      <PasswordInput
        label="Contraseña"
        placeholder="••••••••"
        value={contrasena}
        onChange={(e) => setContrasena(e.target.value)}
      />

      <PasswordInput
        label="Confirmar contraseña"
        placeholder="••••••••"
        value={confirmar}
        onChange={(e) => setConfirmar(e.target.value)}
        error="Las contraseñas no coinciden"
      />

      {/* Valores en tiempo real */}
      <div className="card-outlined text-sm flex flex-col gap-1">
        <p><strong>nombre:</strong> {nombre || "—"}</p>
        <p><strong>correo:</strong> {correo || "—"}</p>
        <p><strong>pin:</strong> {pin || "—"}</p>
        <p><strong>contraseña:</strong> {contrasena || "—"}</p>
        <p><strong>confirmar:</strong> {confirmar || "—"}</p>
      </div>

    </div>
  );
}