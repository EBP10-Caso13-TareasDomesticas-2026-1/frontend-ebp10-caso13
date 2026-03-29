"use client";
import { useState } from "react";
import Button from "@/components/ui/Button";
/*
  PROPS:
  - code      (string)    El código de invitación a mostrar. Ej: "2026-XYZ"
  - className (string)    Clases CSS extra opcionales desde afuera
*/
export default function InviteCodeCard({ code, className = "" }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      alert("No se pudo copiar. Cópialo manualmente: " + code);
    }
  };

  return (
    <div
      className={`card-outlined flex flex-col items-center gap-3 p-6 ${className}`}
    >
      <p className="text-xs font-semibold text-secondary uppercase tracking-widest">
        CÓDIGO DE INVITACIÓN
      </p>
      <p className="text-3xl font-bold text-primary">{code}</p>
      <p className="text-xs text-secondary">
        Código activo para nuevos miembros
      </p>
      <Button variant="secondary"
      onClick={handleCopy}
      className={copied ? "border-success text-success" : "border-primary text-primary"}
      >
        {copied ? "✓ ¡Copiado!" : "⎘ Copiar código"}
      </Button>
    </div>
  )
}
