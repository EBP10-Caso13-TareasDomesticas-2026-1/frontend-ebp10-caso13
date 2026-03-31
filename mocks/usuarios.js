// Representa lo que devuelve el backend tras registro o consulta de perfil.
// Basado en RegistroUsuarioResponse + campos adicionales de la entidad Usuario.
// contrasena y pinSeguridad nunca se almacenan en plain text — en mocks se omiten.

export const usuarios = [
  {
    idUsuario: 1,
    nombre: "Camila Torres",
    correo: "camila.torres@homesync.com",
    telefono: "3001234567",
    fotoPerfil: "https://i.pravatar.cc/150?img=1",
    creadoEn: "2026-03-01T10:00:00.000Z",
  },
  {
    idUsuario: 2,
    nombre: "Daniel Sanchez",
    correo: "daniel.sanchez@homesync.com",
    telefono: "3109876543",
    fotoPerfil: "https://i.pravatar.cc/150?img=2",
    creadoEn: "2026-03-02T11:30:00.000Z",
  },
  {
    idUsuario: 3,
    nombre: "Salome Toro",
    correo: "salome.toro@homesync.com",
    telefono: "3157654321",
    fotoPerfil: "https://i.pravatar.cc/150?img=3",
    creadoEn: "2026-03-03T09:15:00.000Z",
  },
  {
    idUsuario: 4,
    nombre: "David Sanchez",
    correo: "david.sanchez@homesync.com",
    telefono: null,
    fotoPerfil: null, // caso real: usuario sin foto ni teléfono
    creadoEn: "2026-03-04T14:00:00.000Z",
  },
  
];
