/**
 * jwt.js - Utility mínima para chequear expiración de JWT
 * Fail-safe: si parsing falla, asume token válido
 */

function parseJWT(token) {
  try {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    // Convertir Base64 URL a Base64 standard y agregar padding si falta
    let payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    payload += "=".repeat((4 - (payload.length % 4)) % 4);

    const decoded = atob(payload);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/**
 * Chequea si JWT está expirado
 * @returns {boolean} true si expirado, false si válido o error
 */
export function isTokenExpired(token) {
  const payload = parseJWT(token);
  if (!payload?.exp) return false; // Fail-safe: asumir válido
  return Date.now() >= payload.exp * 1000;
}

/**
 * Retorna tiempo (ms) hasta expiración del token
 * @returns {number} ms hasta expiración, o 0 si ya expiró, Infinity si sin exp
 */
export function getTimeUntilExpiry(token) {
  const payload = parseJWT(token);
  if (!payload?.exp) return Infinity; // Fail-safe: sin exp = no expira

  const expirationMs = payload.exp * 1000;
  const timeRemaining = expirationMs - Date.now();

  return Math.max(0, timeRemaining);
}
