"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import type { MarketPin } from "./types";

// MapLibre needs the browser (WebGL), so it is loaded on the client only.
const MarketMap = dynamic(() => import("./MarketMap"), { ssr: false });

type View = "list" | "map";

export function MarketsExplorer({ pins }: { pins: MarketPin[] }) {
  const t = useTranslations("Explorer");
  const [selected, setSelected] = useState<string | null>(null);
  const [view, setView] = useState<View>("list");

  return (
    <div className="explorer" data-view={view}>
      <div className="explorer__switch" role="group" aria-label={t("viewSwitch")}>
        {(["map", "list"] as const).map((v) => (
          <button key={v} type="button" aria-pressed={view === v} onClick={() => setView(v)}>
            {v === "map" ? t("viewMap") : t("viewList")}
          </button>
        ))}
      </div>

      <ul className="explorer__list market-list" aria-label={t("listLabel")}>
        {pins.map((p) => {
          const isSelected = p.id === selected;
          return (
            <li
              key={p.id}
              id={`market-${p.id}`}
              className="market-list__item"
              data-selected={isSelected || undefined}
            >
              <h2 className="market-list__name">
                <Link href={p.href}>{p.name}</Link>
              </h2>
              <p>
                {p.city} · {p.dates}
              </p>
              {!p.verified && <UnverifiedNote />}
              <button
                type="button"
                className="market-list__select"
                aria-pressed={isSelected}
                onClick={() => setSelected(p.id)}
              >
                {t("showOnMap")}
              </button>
              {isSelected && <span className="market-list__selected">{t("selected")}</span>}
            </li>
          );
        })}
      </ul>

      <section
        className="explorer__map"
        aria-label={t("mapLabel")}
        data-testid="market-map"
        data-selected={selected ?? ""}
      >
        <MarketMap
          pins={pins}
          selected={selected}
          visible={view === "map"}
          onSelect={(id) => {
            setSelected(id);
            document
              .getElementById(`market-${id}`)
              ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
          }}
        />
      </section>
    </div>
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
