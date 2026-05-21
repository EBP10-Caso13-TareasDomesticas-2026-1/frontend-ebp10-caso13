// services/authService.js
// HU-001 — User registration  |  HU-002 — Login  |  HU-003 — Logout
//
// Why mock delays? Frontend needs realistic latency to test loading states
// and avoid UI bugs that only appear with network latency.
// Note: iniciarSesion accepts only { correo }, not password.
// Why? The backend validates the password and returns a token only if it matches.
// Frontend never sees the plain password; it's sent directly to backend for validation.

import { USE_MOCK, apiRequest, delay } from "@/lib/api";
import { usuarios } from "@/mocks/usuarios";

const mock = {
  registrarUsuario: async ({ nombre, correo }) => {
    await delay(600); // Simulate network latency
    if (usuarios.some((u) => u.correo === correo))
      throw new Error("El correo ya está registrado.");
    return { idUsuario: usuarios.length + 1, nombre, correo, mensaje: "Usuario registrado exitosamente." };
  },

  iniciarSesion: async ({ correo }) => {
    await delay(600); // Simulate network latency
    const usuario = usuarios.find((u) => u.correo === correo);
    if (!usuario) throw new Error("Correo o contraseña incorrectos.");
    return { idUsuario: usuario.idUsuario, nombre: usuario.nombre, correo: usuario.correo, token: `mock_token_${usuario.idUsuario}`, mensaje: "Inicio de sesión exitoso." };
  },

  cerrarSesion: async () => {
    await delay(300); // Simulate network latency
    return { mensaje: "Sesión cerrada exitosamente." };
  },

  // HUS-018 — Recuperar contraseña
  // Nota: Rate limit se maneja en pantalla con useRateLimit(), no en servicio
  recuperarContrasena: async ({ correo, pin, nuevaContrasena }) => {
    await delay(600);

    // Validar que el correo existe
    const usuario = usuarios.find((u) => u.correo === correo);
    if (!usuario) throw new Error("Correo no registrado.");

    // Simular validación de PIN (en mock, validar que es numérico de 5 dígitos)
    if (!pin || !/^\d{5}$/.test(pin)) {
      throw new Error("PIN inválido.");
    }

    // Validar que la nueva contraseña no venga vacía
    if (!nuevaContrasena || !nuevaContrasena.trim()) {
      throw new Error("La nueva contraseña es obligatoria.");
    }

    // En mock no persistimos contraseñas en frontend; solo simulamos éxito.
    return { mensaje: "Contraseña actualizada exitosamente." };
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
        headers: { "Content-Type": "application/json" },
        body: data,
        cache: "no-store",
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

  async recuperarContrasena(data) {
    return apiRequest(
      "/usuarios/recuperar-contrasena",
      {
        method: "PUT",
        body: data,
      }
    );
  },
};

const authService = USE_MOCK ? mock : api;
export default authService;