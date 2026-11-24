/**
 * Alias route: POST /api/webhook/pakasir
 *
 * The canonical handler lives at /api/payments/pakasir/webhook. Pakasir's
 * dashboard is commonly configured with the shorter `/api/webhook/pakasir`
 * shape, so we expose the same handler at both paths instead of making the
 * operator re-register a URL.
 *
 * There is exactly one implementation: this file only re-exports it, so the
 * secret check, amount verification and idempotent settlement cannot drift
 * between the two routes.
 */
export { POST, dynamic } from '@/app/api/payments/pakasir/webhook/route'
