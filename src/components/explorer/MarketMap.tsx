"use client";

import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useMessages, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import type { MarketPin } from "./types";

const STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";
const POLAND: maplibregl.LngLatBoundsLike = [
  [14.07, 49.0],
  [24.15, 54.9],
];
const SOURCE = "markets";
const CLUSTER_MAX_ZOOM = 9;
/** From this zoom every pin shows its name and last day. */
const LABEL_ZOOM = 11;
const BURGUNDY = "#8b1e2d";
const CREAM = "#fffaf1";

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

/**
 * Repaint the OpenFreeMap "liberty" style in muted warm tones (paper, sage
 * parks, soft blue water) so our pins stand out. Layers are matched by type
 * and name, so a renamed layer simply keeps its original colour.
 */
function warmUp(map: maplibregl.Map) {
  type Prop = Parameters<typeof map.setPaintProperty>[1];
  type Value = Parameters<typeof map.setPaintProperty>[2];
  const set = (id: string, prop: string, value: string | number) => {
    try {
      map.setPaintProperty(id, prop as Prop, value as Value);
    } catch {
      // Property not valid for this layer: leave it as is.
    }
  };
  for (const layer of map.getStyle().layers ?? []) {
    const id = layer.id;
    const name = id.toLowerCase();
    if (layer.type === "background") set(id, "background-color", "#f3ede2");
    else if (layer.type === "fill") {
      if (/water|ocean|lake|river/.test(name)) set(id, "fill-color", "#c7dadb");
      else if (/park|wood|forest|grass|green|landcover|cemetery|pitch/.test(name))
        set(id, "fill-color", "#dfe5cf");
      else if (/building/.test(name)) set(id, "fill-color", "#e7ddcd");
      else set(id, "fill-color", "#efe7da");
    } else if (layer.type === "fill-extrusion") {
      set(id, "fill-extrusion-color", "#e7ddcd");
      set(id, "fill-extrusion-opacity", 0.6);
    } else if (layer.type === "line") {
      if (/water|river|stream|canal/.test(name)) set(id, "line-color", "#b6cfd1");
      else if (/casing|outline/.test(name)) set(id, "line-color", "#e2d6c3");
      else if (/rail|transit/.test(name)) set(id, "line-color", "#d6cbb9");
      else if (/boundary|admin/.test(name)) set(id, "line-color", "#c9b9a3");
      else if (/road|highway|street|path|bridge|tunnel|motorway|trunk|primary/.test(name))
        set(id, "line-color", "#fffaf1");
    } else if (layer.type === "symbol") {
      set(id, "text-color", "#6b6056");
      set(id, "text-halo-color", "#f6f1e7");
      if (/poi/.test(name)) map.setLayoutProperty(id, "visibility", "none");
    }
  }
}

/** Little market stall, drawn in the pin. */
const STALL_SVG =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9 5 4h14l2 5c0 1.4-1.1 2.5-2.5 2.5S16 10.4 16 9c0 1.4-1.1 2.5-2.5 2.5h-3C9.1 11.5 8 10.4 8 9c0 1.4-1.1 2.5-2.5 2.5S3 10.4 3 9zm2 4h14v7h-5v-4h-4v4H5z"/></svg>';

type Props = {
  pins: MarketPin[];
  selected: string | null;
  visible: boolean;
  onSelect: (id: string) => void;
};

export default function MarketMap({ pins, selected, visible, onSelect }: Props) {
  const t = useTranslations("Explorer");
  const messages = useMessages();
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markers = useRef(new Map<string, maplibregl.Marker>());
  const pinsRef = useRef(pins);
  const selectedRef = useRef(selected);
  const onSelectRef = useRef(onSelect);
  const untilRef = useRef((date: string) => t("until", { date }));
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    onSelectRef.current = onSelect;
    pinsRef.current = pins;
    selectedRef.current = selected;
    untilRef.current = (date: string) => t("until", { date });
  }, [onSelect, pins, selected, t]);

  // Create the map once.
  useEffect(() => {
    if (!container.current) return;
    const box = container.current;
    const pinMarkers = markers.current;
    let map: maplibregl.Map;
    try {
      map = new maplibregl.Map({
        container: box,
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

    /** One HTML pin per market that is not inside a cluster right now. */
    const syncMarkers = () => {
      if (!map.getSource(SOURCE) || !map.isSourceLoaded(SOURCE)) return;
      const ids = new Set<string>();
      for (const f of map.querySourceFeatures(SOURCE)) {
        const id = f.properties?.id;
        if (typeof id === "string" && !f.properties?.point_count) ids.add(id);
      }
      for (const [id, marker] of pinMarkers)
        if (!ids.has(id)) {
          marker.remove();
          pinMarkers.delete(id);
        }
      for (const id of ids) {
        if (pinMarkers.has(id)) continue;
        const pin = pinsRef.current.find((p) => p.id === id);
        if (!pin) continue;
        const el = document.createElement("div");
        el.className = "map-pin";
        if (id === selectedRef.current) el.dataset.selected = "";
        const label = document.createElement("div");
        label.className = "map-pin__label";
        const name = document.createElement("strong");
        name.textContent = pin.name;
        const until = document.createElement("span");
        until.textContent = untilRef.current(pin.endShort);
        label.append(name, until);
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "map-pin__dot";
        // The list is the keyboard path; pins are for pointer and touch.
        dot.tabIndex = -1;
        dot.setAttribute("aria-label", pin.name);
        dot.innerHTML = STALL_SVG;
        dot.addEventListener("click", (e) => {
          e.stopPropagation();
          onSelectRef.current(id);
        });
        el.append(label, dot);
        pinMarkers.set(
          id,
          new maplibregl.Marker({ element: el, anchor: "bottom" })
            .setLngLat([pin.lng, pin.lat])
            .addTo(map),
        );
      }
    };

    const syncLabels = () => {
      box.toggleAttribute("data-labels", map.getZoom() >= LABEL_ZOOM);
    };

    map.on("load", () => {
      warmUp(map);
      map.addSource(SOURCE, {
        type: "geojson",
        data: toGeoJSON(pinsRef.current),
        cluster: true,
        clusterMaxZoom: CLUSTER_MAX_ZOOM,
        clusterRadius: 44,
        promoteId: "id",
      });
      map.addLayer({
        id: "clusters",
        type: "circle",
        source: SOURCE,
        filter: ["has", "point_count"],
        paint: {
          "circle-color": BURGUNDY,
          "circle-radius": ["step", ["get", "point_count"], 18, 5, 22, 10, 26],
          "circle-stroke-width": 4,
          "circle-stroke-color": CREAM,
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
          "text-size": 14,
        },
        paint: { "text-color": CREAM },
      });
      // Invisible layer: keeps single points queryable for the HTML pins.
      map.addLayer({
        id: "markets",
        type: "circle",
        source: SOURCE,
        filter: ["!", ["has", "point_count"]],
        paint: { "circle-radius": 0, "circle-opacity": 0 },
      });

      map.on("click", "clusters", async (e) => {
        const feature = e.features?.[0];
        if (!feature) return;
        const source = map.getSource<maplibregl.GeoJSONSource>(SOURCE);
        const zoom = await source?.getClusterExpansionZoom(feature.properties.cluster_id);
        const [lng, lat] = (feature.geometry as GeoJSON.Point).coordinates;
        map.easeTo({ center: [lng, lat], zoom, duration: reducedMotion() ? 0 : 500 });
      });
      map.on("mouseenter", "clusters", () => (map.getCanvas().style.cursor = "pointer"));
      map.on("mouseleave", "clusters", () => (map.getCanvas().style.cursor = ""));
      map.on("sourcedata", (e) => {
        if (e.sourceId === SOURCE && e.isSourceLoaded) syncMarkers();
      });
      map.on("moveend", syncMarkers);
      map.on("zoom", syncLabels);
      syncLabels();
      setReady(true);
    });
    map.on("error", (e) => {
      // Tiles or style unreachable: the list still has everything.
      if (!map.loaded() && !map.isStyleLoaded()) setFailed(Boolean(e.error));
    });

    return () => {
      for (const m of pinMarkers.values()) m.remove();
      pinMarkers.clear();
      map.remove();
      mapRef.current = null;
    };
    // The map is created once per mount; pins are updated below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep data in sync (filters). Pins are rebuilt from the new data.
  useEffect(() => {
    if (!ready) return;
    for (const m of markers.current.values()) m.remove();
    markers.current.clear();
    mapRef.current?.getSource<maplibregl.GeoJSONSource>(SOURCE)?.setData(toGeoJSON(pins));
  }, [pins, ready]);

  // Highlight the selected market and bring it into view above the card.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    for (const [id, marker] of markers.current)
      marker.getElement().toggleAttribute("data-selected", id === selected);
    const pin = pins.find((p) => p.id === selected);
    if (!pin) return;
    map.easeTo({
      center: [pin.lng, pin.lat],
      zoom: Math.max(map.getZoom(), LABEL_ZOOM + 1),
      // Leave room for the market card that covers the bottom of the map.
      offset: [0, -Math.min(120, map.getContainer().clientHeight / 5)],
      duration: reducedMotion() ? 0 : 600,
    });
  }, [selected, pins, ready]);

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
