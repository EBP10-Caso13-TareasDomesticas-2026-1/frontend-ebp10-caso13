// services/roleService.js
// Roles — Información de roles disponibles

import { USE_MOCK, apiRequest, delay } from "@/lib/api";
import { roles } from "@/mocks/roles";

const mock = {
  // Obtener lista de roles
  async obtenerRoles(_token) {
    await delay(200);
    return roles;
  },
};

const api = {
  async obtenerRoles(token) {
    return apiRequest(
      "/roles",
      { method: "GET" },
      token
    );
  },
};

const roleService = USE_MOCK ? mock : api;
export default roleService;
