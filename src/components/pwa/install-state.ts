/** Browser-side state for the install suggestion. Every access is guarded:
    storage can be blocked (private mode), and nothing here may break a page. */

export const OPENED = "tropina:cards-opened";
const DISMISSED = "tropina:install-dismissed";

type DeferredPrompt = Event & { prompt: () => Promise<void> };

let deferred: DeferredPrompt | null = null;
const listeners = new Set<() => void>();

export function captureInstallPrompt(event: Event) {
  event.preventDefault();
  deferred = event as DeferredPrompt;
  listeners.forEach((l) => l());
}

export function installPromptAvailable(): boolean {
  return deferred !== null;
}

export function onInstallPromptChange(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function showInstallPrompt(): Promise<void> {
  const prompt = deferred;
  deferred = null;
  await prompt?.prompt();
}

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {}
}

/**
 * The same as rememberCardOpened, as an inline script for the card's HTML: it
 * runs while the page is parsed, so a visit counts even if the reader leaves
 * before the page becomes interactive.
 */
export function rememberCardScript(id: string): string {
  const key = JSON.stringify(OPENED);
  const card = JSON.stringify(id).replace(/</g, "\\u003c");
  return `try{var a=JSON.parse(localStorage.getItem(${key})||"[]");if(a.indexOf(${card})<0){a.push(${card});localStorage.setItem(${key},JSON.stringify(a))}}catch(e){}`;
}

/** Remembers the card and returns how many different cards were opened. */
export function rememberCardOpened(id: string): number {
  let ids: string[] = [];
  try {
    ids = JSON.parse(read(OPENED) ?? "[]");
  } catch {}
  if (!ids.includes(id)) ids.push(id);
  write(OPENED, JSON.stringify(ids));
  return ids.length;
}

export function installDismissed(): boolean {
  return read(DISMISSED) === "1";
}

export function dismissInstall() {
  write(DISMISSED, "1");
}

export function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as { standalone?: boolean }).standalone === true
  );
}
