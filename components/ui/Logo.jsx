/*
  PROPS:
  - size   (string)  Tamaño del logo. Default: "md"
                     Opciones: "sm" | "md" | "lg"
  - className (string) Clases CSS extra opcionales desde afuera
*/
"use client";
export default function Logo({ size = "md", className = "" }) {

  // ─── TAMAÑOS ───────────────────────────────────────────────────
  // Dependiendo del tamaño, cambian el ícono y el texto
  // Esto permite usar el logo en diferentes contextos:
  // "sm" → navbar de pantallas pequeñas
  // "md" → navbar normal (el más usado)
  // "lg" → pantalla de bienvenida o splash screen
  const sizes = {
    sm: { img: 24, text: "text-base" },
    md: { img: 32, text: "text-lg"   },
    lg: { img: 48, text: "text-2xl"  },
  };

  // Busca el tamaño correspondiente. Si no existe, usa "md"
  const currentSize = sizes[size] || sizes.md;

  // ─── RENDER ───────────────────────────────────────────────────
  return (
    // "inline-flex" pone la imagen y el texto en la misma línea
    // "items-center" los centra verticalmente
    <div className={`inline-flex items-center gap-2 ${className}`}>

      {/* Imagen del logo */}
      {/* Por ahora usamos un placeholder de color primary */}
      {/* Cuando esté el archivo real, reemplaza este div por: */}
      {/* <img src="/logo.png" width={currentSize.img} height={currentSize.img} alt="HomeSync logo" /> */}
      <div
        style={{ width: currentSize.img, height: currentSize.img }}
        className="bg-primary rounded-md flex items-center justify-center text-white font-bold text-xs"
      >
        H
        {/* "H" de HomeSync como placeholder visual */}
        {/* Se ve como un cuadrado azul con la letra H */}
      </div>

      {/* Texto "HomeSync" */}
      <span className={`${currentSize.text} font-bold text-foreground`}>
        HomeSync
      </span>

    </div>
  );
}
