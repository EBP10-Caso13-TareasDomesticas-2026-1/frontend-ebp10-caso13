// services/authService.js
// HU-001 — Registro  |  HU-002 — Login  |  HU-003 — Logout

import { USE_MOCK, apiRequest, delay } from "@/lib/api";
import { usuarios } from "@/mocks/usuarios";

const mock = {
  registrarUsuario: async ({ nombre, correo }) => {
    await delay(600);
    if (usuarios.some((u) => u.correo === correo))
      throw new Error("El correo ya está registrado.");
    return { idUsuario: usuarios.length + 1, nombre, correo, mensaje: "Usuario registrado exitosamente." };
  },

  iniciarSesion: async ({ correo }) => {
    await delay(600);
    const usuario = usuarios.find((u) => u.correo === correo);
    if (!usuario) throw new Error("Correo o contraseña incorrectos.");
    return { idUsuario: usuario.idUsuario, nombre: usuario.nombre, correo: usuario.correo, token: `mock_token_${usuario.idUsuario}`, mensaje: "Inicio de sesión exitoso." };
  },

  cerrarSesion: async () => {
    await delay(300);
    return { mensaje: "Sesión cerrada exitosamente." };
  },
};

const api = {
  async registrarUsuario(data) {
    return apiRequest(
      "/usuarios/registro",
      {
        method: "POST",
        body: data,
      }
    );
  },

  async iniciarSesion(data) {
    const res = await apiRequest(
      "/usuarios/login",
      {
        method: "POST",
        body: data,
      }
    );

    return {
      idUsuario: res.idUsuario,
      nombre: res.nombre,
      correo: res.correo,
      token: res.token,
      mensaje: res.mensaje,
    };
  },

  async cerrarSesion(token) {
    return apiRequest(
      "/sesiones/logout",
      {
        method: "POST",
      },
      token
    );
  },
};

const authService = USE_MOCK ? mock : api;
export default authService;