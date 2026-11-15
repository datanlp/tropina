"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState, useSyncExternalStore } from "react";
import { track } from "@/lib/analytics";
import { installPlatform, shouldOfferInstall } from "@/lib/install";
import {
  dismissInstall,
  installDismissed,
  installPromptAvailable,
  isStandalone,
  onInstallPromptChange,
  rememberCardOpened,
  showInstallPrompt,
} from "./install-state";

/**
 * Rendered on every market card: records the visit (analytics + the counter
 * behind the install tip) and, from the second card on, suggests installing.
 */
export function MarketVisit({ marketId }: { marketId: string }) {
  const t = useTranslations("Install");
  const [offer, setOffer] = useState<"ios" | "other" | null>(null);
  const promptReady = useSyncExternalStore(
    onInstallPromptChange,
    installPromptAvailable,
    () => false,
  );

  useEffect(() => {
    track("market_open", { market: marketId });
    const cardsOpened = rememberCardOpened(marketId);
    if (
      shouldOfferInstall({ cardsOpened, dismissed: installDismissed(), standalone: isStandalone() })
    ) {
      const platform = installPlatform(navigator.userAgent, navigator.maxTouchPoints);
      queueMicrotask(() => setOffer(platform));
    }
  }, [marketId]);

  const visible = offer === "ios" || (offer === "other" && promptReady);

  useEffect(() => {
    if (visible) track("install_prompt_shown", { platform: offer ?? "other" });
  }, [visible, offer]);

  if (!visible) return null;

  const close = () => {
    dismissInstall();
    setOffer(null);
  };

  return (
    <section className="install-tip" aria-label={t("title")}>
      <h2>{t("title")}</h2>
      <p>{offer === "ios" ? t("iosSteps") : t("otherText")}</p>
      <div className="actions">
        {offer === "other" && (
          <button
            type="button"
            className="button"
            onClick={() => {
              void showInstallPrompt();
              close();
            }}
          >
            {t("install")}
          </button>
        )}
        <button type="button" className="button button--secondary" onClick={close}>
          {t("dismiss")}
        </button>
      </div>
    </section>
  );
}
