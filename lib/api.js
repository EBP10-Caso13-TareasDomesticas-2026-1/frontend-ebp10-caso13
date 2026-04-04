// lib/api.js
// ─────────────────────────────────────────────────────────────
// Para cambiar a la API real:
//   1. USE_MOCK = false
//   2. .env.local → NEXT_PUBLIC_API_URL=http://localhost:8080
// ─────────────────────────────────────────────────────────────

export const USE_MOCK = false; // ← única línea a cambiar al tener el backend

export const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export async function apiRequest(endpoint, options = {}, token = null) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...(options.body && { body: JSON.stringify(options.body) }),
  });

  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const error = new Error(
      data?.mensaje || data?.message || `Error ${response.status}`,
    );
    error.status = response.status;
    throw error;
  }

  return data;
}
