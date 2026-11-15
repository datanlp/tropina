/** When to suggest installing Tropina: after the second market card, once. */
export function shouldOfferInstall(s: {
  cardsOpened: number;
  dismissed: boolean;
  standalone: boolean;
}): boolean {
  return s.cardsOpened >= 2 && !s.dismissed && !s.standalone;
}

/**
 * iOS (and iPadOS, which reports itself as a Mac but has touch) has no install
 * prompt, so it gets instructions. Everyone else uses `beforeinstallprompt`.
 */
export function installPlatform(userAgent: string, maxTouchPoints: number): "ios" | "other" {
  if (/iPhone|iPad|iPod/.test(userAgent)) return "ios";
  if (/Macintosh/.test(userAgent) && maxTouchPoints > 1) return "ios";
  return "other";
}
