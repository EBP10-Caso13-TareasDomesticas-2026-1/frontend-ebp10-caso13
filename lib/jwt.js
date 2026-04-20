/**
 * jwt.js - Minimal JWT utility for expiration checks
 * 
 * Design principle: FAIL-SAFE
 * If we CAN'T verify the token (malformed, missing exp, parsing error),
 * we assume it's VALID and let the backend reject it later.
 * Why? It's safer to let ONE bad request reach the backend than to lock out
 * a user with a valid token due to a parsing bug on the client.
 */

function parseJWT(token) {
  try {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    // Base64 URL-safe decode: JWT uses - and / instead of + and /
    let payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    payload += "=".repeat((4 - (payload.length % 4)) % 4);

    const decoded = atob(payload);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/**
 * Checks if JWT has expired.
 * @returns {boolean} true if expired, false if valid or error (fail-safe)
 */
export function isTokenExpired(token) {
  const payload = parseJWT(token);
  if (!payload?.exp) return false; // Fail-safe: assume valid if no exp field
  return Date.now() >= payload.exp * 1000;
}

/**
 * Returns milliseconds until token expires.
 * @returns {number} ms until expiry, 0 if already expired, Infinity if no exp field
 */
export function getTimeUntilExpiry(token) {
  const payload = parseJWT(token);
  if (!payload?.exp) return Infinity; // Fail-safe: assume no expiry if missing

  const expirationMs = payload.exp * 1000;
  const timeRemaining = expirationMs - Date.now();

  return Math.max(0, timeRemaining);
}
