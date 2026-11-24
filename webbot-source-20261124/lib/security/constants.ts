/**
 * Security constants that both the server and the browser need.
 *
 * This module must stay dependency-free. `lib/security/csrf.ts` implements token
 * verification with `node:crypto`, so a client component importing a constant
 * from there would drag Node built-ins into the browser bundle and break the
 * build (webpack cannot resolve the `node:` scheme). Constants live here and are
 * re-exported from the server modules for convenience.
 */

/** Session cookie name. */
export const SESSION_COOKIE = 'ng_session'

/** CSRF cookie name — readable by JS by design (double-submit pattern). */
export const CSRF_COOKIE = 'ng_csrf'

/** Header the client copies the CSRF cookie into. */
export const CSRF_HEADER = 'x-csrf-token'

/** Methods that do not require CSRF validation. */
export const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])
