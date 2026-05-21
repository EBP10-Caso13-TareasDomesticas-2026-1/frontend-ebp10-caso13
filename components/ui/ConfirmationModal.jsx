// Modal genérico de confirmación para acciones sensibles
// Reutilizable para: logout, eliminar miembro, eliminar tarea, guardar cambios, abandonar grupo, etc.

import Button from "@/components/ui/Button";

/*
  PROPS:
  - isOpen               (boolean)   Si es true el modal se muestra, si es false se oculta
  - icon                 (JSX)       Ícono arriba del título. Ej: <img src="/logout.png" />
  - title                (string)    Título del modal. Ej: "¿Cerrar sesión?"
  - description          (string)    Texto explicativo debajo del título
  - confirmText          (string)    Texto del botón de confirmación. Default: "Confirmar"
  - cancelText           (string)    Texto del botón de cancelar. Default: "Cancelar"
  - onConfirm            (function)  Función que se ejecuta al confirmar
  - onCancel             (function)  Función que se ejecuta al cancelar
  - variant              (string)    Estilo del botón confirmar. Default: "primary"
                                     Opciones: "primary" | "danger"

  PROPS OPCIONALES (para selector de miembro):
  - showMemberSelector   (boolean)   Si es true, renderiza un selector de miembro
  - members              (array)     Lista de objetos {id, nombre} disponibles para elegir
  - selectedMemberId     (string/number)  ID del miembro seleccionado
  - onMemberChange       (function)  Callback cuando cambia la selección de miembro
*/
export default function ConfirmationModal({
  isOpen = false,
  icon,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
  variant = "primary",
  showMemberSelector = false,
  members = [],
  selectedMemberId,
  onMemberChange,
}) {

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onCancel}
    >
      <div
        className="relative bg-white rounded-lg shadow-lg p-8 max-w-sm w-full mx-4 flex flex-col items-center gap-4"
        onClick={(e) => e.stopPropagation()}
      >

        {icon && (
          <div className="bg-error-light p-3 rounded-full">
            {icon}
          </div>
        )}

        {title && (
          <h3 className="text-center">{title}</h3>
        )}

        {description && (
          <p className="text-sm text-secondary text-center">{description}</p>
        )}

        {showMemberSelector && members.length > 0 && (
          <select
            value={selectedMemberId || ""}
            onChange={(e) => onMemberChange?.(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Seleccionar miembro como nuevo admin...</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.nombre}
              </option>
            ))}
          </select>
        )}

        <div className="flex flex-col gap-2 w-full mt-2">
          <Button
            variant={variant}
            onClick={onConfirm}
            className="w-full"
          >
            {confirmText}
          </Button>

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
