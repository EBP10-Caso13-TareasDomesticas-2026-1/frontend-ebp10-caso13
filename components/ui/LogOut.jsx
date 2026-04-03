// Ubicación: /components/ui/LogOut.jsx

// Importamos Button para reutilizarlo en las acciones del modal
import Button from "@/components/ui/Button";
import Image from "next/image"
// "use client";
/*
  PROPS:
  - isOpen        (boolean)   Si es true el modal se muestra, si es false se oculta
  - icon          (JSX)       Ícono arriba del título. Ej: <img src="/logout.png" />
  - title         (string)    Título del modal. Ej: "¿Cerrar sesión?"
  - description   (string)    Texto explicativo debajo del título
  - confirmText   (string)    Texto del botón de confirmación. Default: "Confirmar"
  - cancelText    (string)    Texto del botón de cancelar. Default: "Cancelar"
  - onConfirm     (function)  Función que se ejecuta al confirmar
  - onCancel      (function)  Función que se ejecuta al cancelar
  - variant       (string)    Estilo del botón confirmar. Default: "primary"
                              Opciones: "primary" | "danger"
*/
export default function LogOut({
  isOpen = false,
  icon = <Image src="/salida.png" width={32} height={32} alt="logout icon"/>,
  title = "¿Cerrar Sesión?",
  description ="¿Estás seguro que deseas cerrar sesión? Tendrás que volver a ingresar tus credenciales para acceder.",
  confirmText = "Si, cerrar sesión",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
  variant = "primary",
}) {

  // ─── CONTROL DE VISIBILIDAD ────────────────────────────────────
  // Si isOpen es false, el componente no renderiza nada
  // "return null" en React significa "no mostrar nada en pantalla"
  if (!isOpen) return null;

  // ─── RENDER ───────────────────────────────────────────────────
  return (
    // ── FONDO OSCURO (OVERLAY) ──
    // Este div cubre TODA la pantalla con un fondo semitransparente
    // "fixed" → se queda fijo aunque el usuario haga scroll
    // "inset-0" → ocupa desde arriba-izquierda hasta abajo-derecha (toda la pantalla)
    // "z-50" → se pone encima de todo lo demás
    // "flex items-center justify-center" → centra el modal en la pantalla
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      // bg-black/50 → fondo negro con 50% de opacidad
      // El /50 es la sintaxis de Tailwind para opacidad
      onClick={onCancel}
      // Si el usuario hace click en el fondo oscuro, se cierra el modal
      // Es un comportamiento estándar de UX
    >

      {/* ── CONTENEDOR DEL MODAL ── */}
      {/* "relative" para que el contenido se posicione dentro */}
      {/* "max-w-sm" limita el ancho del modal */}
      {/* "w-full mx-4" para que en móvil tenga margen a los lados */}
      <div
        className="relative bg-white rounded-lg shadow-lg p-8 max-w-sm w-full mx-4 flex flex-col items-center gap-4"
        onClick={(e) => e.stopPropagation()}
        // e.stopPropagation() evita que el click dentro del modal
        // llegue al fondo oscuro y lo cierre accidentalmente
        // Sin esto, cualquier click dentro del modal lo cerraría
      >

        {/* ── ÍCONO ── */}
        {/* Solo se muestra si se pasó la prop icon */}
        {icon && (
          <div className="bg-error-light p-3 rounded-full">
            {/* Fondo rojo suave circular para el ícono */}
            {icon}
          </div>
        )}

        {/* ── TÍTULO ── */}
        {title && (
          <h3 className="text-center">{title}</h3>
        )}

        {/* ── DESCRIPCIÓN ── */}
        {description && (
          <p className="text-sm text-secondary text-center">{description}</p>
        )}

        {/* ── BOTONES ── */}
        {/* flex flex-col gap-2 → botones apilados verticalmente */}
        {/* w-full → cada botón ocupa todo el ancho del modal */}
        <div className="flex flex-col gap-2 w-full mt-2">

          {/* Botón de confirmación — usa la variante recibida */}
          <Button
            variant={variant}
            onClick={onConfirm}
            className="w-full"
          >
            {confirmText}
          </Button>

          {/* Botón de cancelar — siempre secundario */}
          <Button
            variant="secondary"
            onClick={onCancel}
            className="w-full"
          >
            {cancelText}
          </Button>

        </div>
      </div>
    </div>
  );
}


// ─── EJEMPLO DE USO ─────────────────────────────────────────────
//
// En la pantalla que use el modal necesitas un estado para controlarlo:
//
// const [showModal, setShowModal] = useState(false);
//
// <Modal
//   isOpen={showModal}
//   icon={<img src="/logout.png" width={24} height={24} />}
//   title="¿Cerrar sesión?"
//   description="Tendrás que volver a ingresar tus credenciales para acceder."
//   confirmText="Sí, cerrar sesión"
//   cancelText="Cancelar"
//   variant="danger"
//   onConfirm={() => handleLogout()}
//   onCancel={() => setShowModal(false)}
// />