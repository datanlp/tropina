"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { HeroScene } from "@/components/HeroScene";
import { Link } from "@/i18n/navigation";
import { track } from "@/lib/analytics";
import { PHOTO_FORM_URL } from "@/lib/links";
import type { MarketPin } from "./types";

/**
 * Card for the market picked on the map: a bottom sheet on phones, a floating
 * card over the map on wide screens. Without a photo it shows our own drawing.
 */
export function MarketSheet({ pin, onClose }: { pin: MarketPin; onClose: () => void }) {
  const t = useTranslations("Explorer");

  return (
    <div className="sheet" data-testid="market-sheet">
      <div className="sheet__media">
        {pin.photo ? (
          <Image
            src={pin.photo.src}
            alt={pin.photo.alt}
            fill
            sizes="(max-width: 899px) 40vw, 220px"
            className="sheet__photo"
          />
        ) : (
          <HeroScene />
        )}
        {pin.photo?.source === "ai" && <span className="sheet__label">{t("aiPhoto")}</span>}
        {pin.photo?.credit && (
          <span className="sheet__label">{t("photoBy", { name: pin.photo.credit })}</span>
        )}
      </div>

      <div className="sheet__body">
        <p className="sheet__title">{pin.name}</p>
        <ul className="sheet__facts">
          <li className="sheet__kind">
            <TreeIcon />
            {t("christmasMarket")}
          </li>
          <li>
            <ClockIcon />
            {pin.dates}
          </li>
          <li>
            <MapPinIcon />
            {pin.address}
          </li>
        </ul>
        <div className="sheet__actions">
          <Link href={pin.href} className="button button--green">
            {t("explore")}
            <span aria-hidden="true">›</span>
          </Link>
          {PHOTO_FORM_URL && (
            <a
              className="sheet__send-photo"
              href={`${PHOTO_FORM_URL}?market=${encodeURIComponent(pin.id)}`}
              rel="noopener"
              onClick={() => track("photo_form_click", { market: pin.id })}
            >
              {t("sendPhoto")}
            </a>
          )}
        </div>
      </div>

      <button type="button" className="sheet__close" aria-label={t("closeCard")} onClick={onClose}>
        <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6.4 5 5 6.4 10.6 12 5 17.6 6.4 19l5.6-5.6 5.6 5.6 1.4-1.4-5.6-5.6L19 6.4 17.6 5 12 10.6z" />
        </svg>
      </button>
    </div>
  );
}

function TreeIcon() {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2 7 9h3l-4 6h4l-5 6h14l-5-6h4l-4-6h3z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm1-13h-2v6l5 3 1-1.6-4-2.4z" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
    </svg>
  );
}
