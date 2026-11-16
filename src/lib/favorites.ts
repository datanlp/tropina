"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Favourite markets, kept only in this browser (localStorage): no account,
 * no cookie, nothing sent anywhere.
 */
const KEY = "tropina:favorites";
const listeners = new Set<() => void>();

export function parseFavorites(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export function toggleFavorite(list: readonly string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

function read(): string {
  try {
    return localStorage.getItem(KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** `[favourite ids, toggle]`. Empty during server rendering and hydration. */
export function useFavorites(): [string[], (id: string) => void] {
  const raw = useSyncExternalStore(subscribe, read, () => "[]");
  const toggle = useCallback((id: string) => {
    const next = toggleFavorite(parseFavorites(read()), id);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // Private mode or storage full: the star just does not stick.
    }
    for (const l of listeners) l();
  }, []);
  return [parseFavorites(raw), toggle];
}
