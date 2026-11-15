/** Directions link that opens Google Maps (app or web) with the market as destination. */
export function directionsUrl({ lat, lng }: { lat: number; lng: number }): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}
