"use client";

function getInitials(nombre) {
  if (!nombre) return "?";
  const parts = nombre.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return nombre[0].toUpperCase();
}

function getPodioIcon(puesto) {
  if (puesto === 1) return "🥇";
  if (puesto === 2) return "🥈";
  if (puesto === 3) return "🥉";
  return null;
}

export default function MemberCard({
  member,
  esAdmin,
  isCurrentUser,
  onDelete,
  onLeave,
  loadingDelete,
}) {
  const isAdminMember = member.rol?.nombre === "ADMINISTRADOR" || member.rolId === 1;
  const initials = getInitials(member.nombre);
  const podioIcon = getPodioIcon(member.puesto);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow gap-4">
      {/* Posición + Avatar + Info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Posición o Podio */}
        <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm">
          {podioIcon ? (
            <span className="text-2xl">{podioIcon}</span>
          ) : (
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 font-bold text-xs">
              {member.puesto}°
            </div>
          )}
        </div>

        {/* Avatar con iniciales */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 truncate">
            {member.nombre}
            {isAdminMember && (
              <span className="ml-2 text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded">
                Admin
              </span>
            )}
            {isCurrentUser && (
              <span className="ml-2 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                Tú
              </span>
            )}
          </p>
          <p className="text-xs text-gray-500 truncate">{member.correo}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-center flex-shrink-0">
        <div>
          <p className="text-xs text-gray-500">Puntos</p>
          <p className="font-bold text-lg text-gray-800">{member.puntaje}</p>
        </div>

        <div>
          <p className="text-xs text-gray-500">Tareas</p>
          <p className="font-bold text-lg text-blue-600">{member.tareasCompletadas}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {esAdmin && !isCurrentUser && !isAdminMember && (
          <button
            onClick={() => onDelete(member.id)}
            disabled={loadingDelete}
            className="px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Eliminar
          </button>
        )}

        {isCurrentUser && (
          <button
            onClick={onLeave}
            disabled={loadingDelete}
            className="px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Abandonar
          </button>
        )}
      </div>
    </div>
  );
}
