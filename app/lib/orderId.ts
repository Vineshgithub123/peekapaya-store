export function encodeOrderId(orderId: string) {
  return btoa(orderId)
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/, '');
}

export function decodeOrderId(encodedOrderId: string) {
  const base64 = encodedOrderId.replaceAll('-', '+').replaceAll('_', '/');
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  return atob(base64 + padding);
}
