"use client";

import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useLocale, useMessages, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import type { MarketPin } from "./types";

const STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";
const POLAND: maplibregl.LngLatBoundsLike = [
  [14.07, 49.0],
  [24.15, 54.9],
];
const SOURCE = "markets";
const CLUSTER_MAX_ZOOM = 9;
const ACCENT = "#a3122a";
const NIGHT = "#0f1d33";
const GOLD = "#f2c35b";

maplibregl.setWorkerUrl(`/vendor/maplibre-gl-worker.mjs?v=${maplibregl.getVersion()}`);

function reducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function toGeoJSON(pins: MarketPin[]): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: "FeatureCollection",
    features: pins.map((p) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [p.lng, p.lat] },
      properties: { id: p.id },
    })),
  };
}

type Props = {
  pins: MarketPin[];
  selected: string | null;
  visible: boolean;
  onSelect: (id: string) => void;
};

export default function MarketMap({ pins, selected, visible, onSelect }: Props) {
  const t = useTranslations("Explorer");
  const messages = useMessages();
  const locale = useLocale();
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const onSelectRef = useRef(onSelect);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  // Create the map once.
  useEffect(() => {
    if (!container.current) return;
    let map: maplibregl.Map;
    try {
      map = new maplibregl.Map({
        container: container.current,
        style: STYLE_URL,
        bounds: POLAND,
        fitBoundsOptions: { padding: 24 },
        locale: messages.MapUi as Record<string, string>,
        attributionControl: { compact: true },
        cooperativeGestures: true,
        fadeDuration: reducedMotion() ? 0 : 300,
      });
    } catch {
      // No WebGL: show the note once React is done with this effect.
      queueMicrotask(() => setFailed(true));
      return;
    }
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    map.on("load", () => {
      map.addSource(SOURCE, {
        type: "geojson",
        data: toGeoJSON(pins),
        cluster: true,
        clusterMaxZoom: CLUSTER_MAX_ZOOM,
        clusterRadius: 40,
        promoteId: "id",
      });
      map.addLayer({
        id: "clusters",
        type: "circle",
        source: SOURCE,
        filter: ["has", "point_count"],
        paint: {
          "circle-color": NIGHT,
          "circle-radius": ["step", ["get", "point_count"], 17, 5, 21, 10, 25],
          "circle-stroke-width": 3,
          "circle-stroke-color": GOLD,
        },
      });
      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: SOURCE,
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-font": ["Noto Sans Bold"],
          "text-size": 13,
        },
        paint: { "text-color": GOLD },
      });
      map.addLayer({
        id: "markets",
        type: "circle",
        source: SOURCE,
        filter: ["!", ["has", "point_count"]],
        paint: {
          // Selected marker is bigger and has a dark ring, not only another colour.
          "circle-color": ACCENT,
          "circle-radius": ["case", ["boolean", ["feature-state", "selected"], false], 13, 9],
          "circle-stroke-width": ["case", ["boolean", ["feature-state", "selected"], false], 5, 3],
          "circle-stroke-color": [
            "case",
            ["boolean", ["feature-state", "selected"], false],
            NIGHT,
            GOLD,
          ],
        },
      });

      map.on("click", "clusters", async (e) => {
        const feature = e.features?.[0];
        if (!feature) return;
        const source = map.getSource<maplibregl.GeoJSONSource>(SOURCE);
        const zoom = await source?.getClusterExpansionZoom(feature.properties.cluster_id);
        const [lng, lat] = (feature.geometry as GeoJSON.Point).coordinates;
        map.easeTo({ center: [lng, lat], zoom, duration: reducedMotion() ? 0 : 500 });
      });
      map.on("click", "markets", (e) => {
        const id = e.features?.[0]?.properties.id;
        if (typeof id === "string") onSelectRef.current(id);
      });
      for (const layer of ["clusters", "markets"]) {
        map.on("mouseenter", layer, () => (map.getCanvas().style.cursor = "pointer"));
        map.on("mouseleave", layer, () => (map.getCanvas().style.cursor = ""));
      }
      setReady(true);
    });
    map.on("error", (e) => {
      // Tiles or style unreachable: the list still has everything.
      if (!map.loaded() && !map.isStyleLoaded()) setFailed(Boolean(e.error));
    });

    return () => {
      popupRef.current?.remove();
      map.remove();
      mapRef.current = null;
    };
    // The map is created once per mount; pins are updated below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep data in sync.
  useEffect(() => {
    if (!ready) return;
    mapRef.current?.getSource<maplibregl.GeoJSONSource>(SOURCE)?.setData(toGeoJSON(pins));
  }, [pins, ready]);

  // Highlight the selected market and show a popup with a link to its page.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    for (const p of pins)
      map.setFeatureState({ source: SOURCE, id: p.id }, { selected: p.id === selected });
    popupRef.current?.remove();
    const pin = pins.find((p) => p.id === selected);
    if (!pin) return;

    map.easeTo({
      center: [pin.lng, pin.lat],
      zoom: Math.max(map.getZoom(), CLUSTER_MAX_ZOOM + 1),
      duration: reducedMotion() ? 0 : 600,
    });

    const box = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = pin.name;
    const dates = document.createElement("p");
    dates.textContent = pin.dates;
    const link = document.createElement("a");
    link.href = `/${locale}${pin.href}`;
    link.textContent = t("openCard");
    box.append(title, dates, link);
    popupRef.current = new maplibregl.Popup({ offset: 14, focusAfterOpen: false })
      .setLngLat([pin.lng, pin.lat])
      .setDOMContent(box)
      .addTo(map);
  }, [selected, pins, ready, t, locale]);

  // A map that was hidden (phone list view) needs a resize when shown again.
  useEffect(() => {
    if (visible) mapRef.current?.resize();
  }, [visible]);

  return (
    <>
      <div ref={container} className="explorer__canvas" />
      {failed && <p className="explorer__map-error">{t("mapUnavailable")}</p>}
    </>
  );
}
