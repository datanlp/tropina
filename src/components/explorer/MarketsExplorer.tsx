"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { HeroScene } from "@/components/HeroScene";
import { track } from "@/lib/analytics";
import { useFavorites } from "@/lib/favorites";
import { type MarketFilter, matchesFilter } from "@/lib/schedule";
import { useNow } from "@/lib/use-now";
import { MarketSheet } from "./MarketSheet";
import type { MarketPin } from "./types";

// MapLibre needs the browser (WebGL), so it is loaded on the client only.
const MarketMap = dynamic(() => import("./MarketMap"), { ssr: false });

/**
 * Phones start with "both": the map on top and the list under it. The switch
 * then shows only the map (full screen) or only the list.
 */
type View = "both" | "list" | "map";

export function MarketsExplorer({ pins }: { pins: MarketPin[] }) {
  const t = useTranslations("Explorer");
  const [selected, setSelected] = useState<string | null>(null);
  const [view, setView] = useState<View>("both");
  const [filter, setFilter] = useState<MarketFilter>("all");
  const tf = useTranslations("Filters");
  const now = useNow();
  const mapBox = useRef<HTMLElement>(null);
  const loadMap = useMapWhenVisible(mapBox);
  const [favorites, toggleFavorite] = useFavorites();

  // Until the client knows the time, show everything (static HTML).
  const shown = now ? pins.filter((p) => matchesFilter(p.schedule, filter, now)) : pins;
  const selectedPin = shown.find((p) => p.id === selected);
  const filters: [MarketFilter, string][] = [
    ["open-now", tf("openNow")],
    ["weekend", tf("weekend")],
    ["all", tf("all")],
  ];

  return (
    <div className="explorer" data-view={view}>
      <fieldset className="filters">
        <legend>{tf("legend")}</legend>
        {filters.map(([value, label]) => (
          <label key={value}>
            <FilterIcon filter={value} />
            <input
              className="filters__radio"
              type="radio"
              name="market-filter"
              value={value}
              checked={filter === value}
              onChange={() => {
                setFilter(value);
                track("filter_change", { filter: value });
              }}
            />
            {label}
          </label>
        ))}
      </fieldset>

      <div className="explorer__switch" role="group" aria-label={t("viewSwitch")}>
        {(["map", "list"] as const).map((v) => (
          <button
            key={v}
            type="button"
            aria-pressed={view === v}
            onClick={() => setView(view === v ? "both" : v)}
          >
            <ViewIcon view={v} />
            {v === "map" ? t("viewMap") : t("viewList")}
          </button>
        ))}
      </div>

      {shown.length === 0 && (
        <p className="explorer__empty" role="status">
          {tf("noResults")}
        </p>
      )}

      <section
        className="explorer__map"
        aria-label={t("mapLabel")}
        data-testid="market-map"
        data-selected={selected ?? ""}
        ref={mapBox}
      >
        {!loadMap && <MapPreview pins={shown} />}
        {loadMap && (
          <MarketMap
            pins={shown}
            selected={selected}
            visible={view !== "list"}
            onSelect={(id) => {
              setSelected(id);
              document
                .getElementById(`market-${id}`)
                ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
            }}
          />
        )}
        {selectedPin && <MarketSheet pin={selectedPin} onClose={() => setSelected(null)} />}
      </section>

      <ul className="explorer__list market-list" aria-label={t("listLabel")}>
        {shown.map((p) => {
          const isSelected = p.id === selected;
          return (
            <li
              key={p.id}
              id={`market-${p.id}`}
              className="market-list__item"
              data-selected={isSelected || undefined}
            >
              <div className="market-list__thumb">
                {p.photo ? (
                  <Image
                    src={p.photo.src}
                    alt={p.photo.alt}
                    fill
                    sizes="(max-width: 899px) 30vw, 10rem"
                    className="market-list__photo"
                  />
                ) : (
                  <HeroScene id={`thumb-${p.id}`} />
                )}
                <div className="market-list__stamp" aria-hidden="true">
                  <span className="market-list__day">{p.startDay}</span>
                  <span className="market-list__month">{p.startMonth}</span>
                </div>
                {p.photo?.source === "ai" && (
                  <span className="market-list__ai">{t("aiPhoto")}</span>
                )}
              </div>
              <div className="market-list__body">
                <p className="market-list__city">{p.city}</p>
                <h2 className="market-list__name">
                  <Link href={p.href}>{p.name}</Link>
                </h2>
                <p className="market-list__dates">
                  <CalendarIcon />
                  {p.dates}
                </p>
                {!p.verified && <UnverifiedNote />}
                <button
                  type="button"
                  className="market-list__select"
                  aria-pressed={isSelected}
                  onClick={() => setSelected(p.id)}
                >
                  <PinIcon />
                  {t("showOnMap")}
                </button>
                {isSelected && <span className="market-list__selected">{t("selected")}</span>}
              </div>
              <button
                type="button"
                className="market-list__fav"
                aria-pressed={favorites.includes(p.id)}
                aria-label={t("favorite", { name: p.name })}
                onClick={() => toggleFavorite(p.id)}
              >
                <StarIcon />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * MapLibre is the heaviest script on the site. It is downloaded only once the
 * map box is on screen and the visitor has done something (touch, scroll,
 * mouse, key), so the first paint and the list stay fast on slow phones.
 * Until then a light preview with the pins stands in for the map.
 */
function useMapWhenVisible(box: React.RefObject<HTMLElement | null>): boolean {
  const [load, setLoad] = useState(false);
  useEffect(() => {
    const el = box.current;
    if (!el || load) return;
    let visible = false;
    let touched = false;
    const events = ["pointerdown", "pointermove", "keydown", "scroll", "wheel", "touchstart"];
    const maybeStart = () => {
      if (visible && touched) setLoad(true);
    };
    const onActivity = () => {
      touched = true;
      for (const e of events) window.removeEventListener(e, onActivity);
      maybeStart();
    };
    for (const e of events) window.addEventListener(e, onActivity, { passive: true });
    const observer = new IntersectionObserver((entries) => {
      visible = entries.some((e) => e.isIntersecting);
      maybeStart();
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      for (const e of events) window.removeEventListener(e, onActivity);
    };
  }, [box, load]);
  return load;
}

/** Pins placed roughly on a plain background while MapLibre is not loaded. */
function MapPreview({ pins }: { pins: MarketPin[] }) {
  const [[west, south], [east, north]] = [
    [14.07, 49.0],
    [24.15, 54.9],
  ];
  return (
    <div className="map-preview" aria-hidden="true">
      {pins.map((p) => (
        <span
          key={p.id}
          className="map-preview__pin"
          style={{
            left: `${6 + ((p.lng - west) / (east - west)) * 88}%`,
            top: `${6 + ((north - p.lat) / (north - south)) * 88}%`,
          }}
        />
      ))}
    </div>
  );
}

export function PinIcon() {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 2h2v2h6V2h2v2h3v18H4V4h3zm11 8H6v10h12zM6 6v2h12V6z" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="m12 2.8 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.6l-5.8 3.1 1.1-6.5-4.7-4.6 6.5-.9z" />
    </svg>
  );
}

function FilterIcon({ filter }: { filter: MarketFilter }) {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
      {filter === "all" ? (
        <path d="M12 2 7 9h3l-4 6h4l-5 6h14l-5-6h4l-4-6h3z" />
      ) : filter === "weekend" ? (
        <path d="M7 2h2v2h6V2h2v2h3v18H4V4h3zm11 8H6v10h12zM6 6v2h12V6zm2 6h3v3H8z" />
      ) : (
        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm1-13h-2v6l5 3 1-1.6-4-2.4z" />
      )}
    </svg>
  );
}

function ViewIcon({ view }: { view: "map" | "list" }) {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
      {view === "map" ? (
        <path d="M15 4 9 2 3 4v18l6-2 6 2 6-2V2l-6 2zm-1 15.6-4-1.3V4.4l4 1.3v13.9z" />
      ) : (
        <path d="M4 5h2v2H4zm4 0h12v2H8zM4 11h2v2H4zm4 0h12v2H8zM4 17h2v2H4zm4 0h12v2H8z" />
      )}
    </svg>
  );
}

function UnverifiedNote() {
  const t = useTranslations("MarketStatus");
  return (
    <p className="badge badge--unverified">
      <span aria-hidden="true">! </span>
      {t("unverified")}
    </p>
  );
}
