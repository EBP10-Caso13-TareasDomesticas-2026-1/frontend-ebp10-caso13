// rolId: 1 = admin, 2 = miembro (ver roles.js)
// El primer miembro de cada grupo siempre es admin (quien crea el grupo)
// Usuario 2 (Daniel) pertenece a ambos grupos — caso real de múltiple membresía

export const miembrosGrupo = [
  {
    id: 1,
    usuarioId: 1,   // Camila — admin de Familia Torres
    grupoId: 1,
    rolId: 1,
    puntaje: 120,
    racha: 5,
    fechaUnion: "2026-03-05T08:00:00.000Z"
  },
  {
    id: 2,
    usuarioId: 2,   // Daniel — miembro de Familia Torres
    grupoId: 1,
    rolId: 2,
    puntaje: 80,
    racha: 3,
    fechaUnion: "2026-03-06T10:00:00.000Z"
  },
  {
    id: 3,
    usuarioId: 3,   // Salome — miembro de Familia Torres
    grupoId: 1,
    rolId: 2,
    puntaje: 45,
    racha: 1,
    fechaUnion: "2026-03-07T09:30:00.000Z"
  },
  {
    id: 4,
    usuarioId: 2,   // Daniel — admin de Apartamento 204
    grupoId: 2,
    rolId: 1,
    puntaje: 60,
    racha: 2,
    fechaUnion: "2026-03-10T17:00:00.000Z"
  },
  {
    
  }
];