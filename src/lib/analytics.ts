/**
 * Cookie-free analytics behind one function. Change the provider here and
 * nothing else in the app changes. Today: Umami Cloud (window.umami).
 */
export type AnalyticsEvent =
  | "market_open"
  | "official_link_click"
  | "directions_click"
  | "filter_change"
  | "install_prompt_shown"
  | "app_installed"
  | "lang_change";

export type AnalyticsProps = Record<string, string | number | boolean>;

export type AnalyticsProvider = { send: (event: AnalyticsEvent, props?: AnalyticsProps) => void };

let override: AnalyticsProvider | null = null;

/** For tests, or to swap the provider at runtime. */
export function setAnalyticsProvider(provider: AnalyticsProvider | null) {
  override = provider;
}

const umami: AnalyticsProvider = {
  send(event, props) {
    const w = globalThis as { umami?: { track: (e: string, p?: AnalyticsProps) => void } };
    w.umami?.track(event, props);
  },
};

export function track(event: AnalyticsEvent, props?: AnalyticsProps): void {
  try {
    (override ?? umami).send(event, props);
  } catch {
    // Analytics must never break the page (blocked script, offline, ...).
  }
}
