"use client";

export default function StatsCard({ ranking, stats }) {
  if (!stats) {
    return (
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          ⭐ Mi Desempeño
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/20 rounded-lg p-4 text-center">
            <p className="text-sm opacity-90">Posición</p>
            <p className="text-3xl font-bold">—</p>
          </div>
          <div className="bg-white/20 rounded-lg p-4 text-center">
            <p className="text-sm opacity-90">Puntaje</p>
            <p className="text-3xl font-bold">—</p>
          </div>
          <div className="bg-white/20 rounded-lg p-4 text-center">
            <p className="text-sm opacity-90">Tareas Completadas</p>
            <p className="text-3xl font-bold">—</p>
          </div>
        </div>
      </div>
    );
  }

  const position = ranking?.puesto || "—";

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        ⭐ Mi Desempeño
      </h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/20 rounded-lg p-4 text-center">
          <p className="text-sm opacity-90">Posición</p>
          <p className="text-3xl font-bold">{position}°</p>
        </div>
        <div className="bg-white/20 rounded-lg p-4 text-center">
          <p className="text-sm opacity-90">Puntaje</p>
          <p className="text-3xl font-bold">{stats.puntaje}</p>
        </div>
        <div className="bg-white/20 rounded-lg p-4 text-center">
          <p className="text-sm opacity-90">Tareas Completadas</p>
          <p className="text-3xl font-bold">{ranking?.tareasCompletadas || 0}</p>
        </div>
      </div>
    </div>
  );
}
