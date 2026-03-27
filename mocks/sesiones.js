// Representa la respuesta de InicioSesionResponse.
// El token es un JWT simulado con estructura válida (header.payload.signature).
// En pantallas de login, usar mockSesionActiva como usuario autenticado.

export const sesiones = [
  {
    idUsuario: 1,
    nombre: "Camila Torres",
    correo: "camila.torres@homesync.com",
    token: "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.mock_signature_camila",
    mensaje: "Inicio de sesión exitoso"
  },
  {
    idUsuario: 2,
    nombre: "Daniel Sanchez",
    correo: "daniel.sanchez@homesync.com",
    token: "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIyIn0.mock_signature_daniel",
    mensaje: "Inicio de sesión exitoso"
  }
];

// Usuario autenticado por defecto para desarrollo de pantallas protegidas
export const mockSesionActiva = sesiones[0];  