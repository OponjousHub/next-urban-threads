export const PENDING_PAYMENT_TIMEOUT_MINUTES = 30;

export const PENDING_PAYMENT_TIMEOUT_MS =
  PENDING_PAYMENT_TIMEOUT_MINUTES * 60 * 1000;

export function isPendingPaymentExpired(createdAt: Date): boolean {
  return Date.now() - createdAt.getTime() >= PENDING_PAYMENT_TIMEOUT_MS;
}
