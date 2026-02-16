/** Single source for ship_id format. Always SHP-{UUID}. */
export function generateShipId(): string {
  return `SHP-${crypto.randomUUID()}`;
}
