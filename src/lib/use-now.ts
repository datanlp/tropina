"use client";

import { useSyncExternalStore } from "react";

const MINUTE = 60_000;

function subscribe(onChange: () => void) {
  const id = setInterval(onChange, MINUTE);
  return () => clearInterval(id);
}

/**
 * Current time, rounded to the minute, on the client only. `null` during
 * server rendering and hydration: pages stay static and time-based UI
 * (filters, "open now") fills in right after load.
 */
export function useNow(): Date | null {
  const minute = useSyncExternalStore(
    subscribe,
    () => Math.floor(Date.now() / MINUTE),
    () => null,
  );
  return minute === null ? null : new Date(minute * MINUTE);
}
