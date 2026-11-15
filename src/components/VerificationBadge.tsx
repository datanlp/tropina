import { useTranslations } from "next-intl";

/** Status is always spelled out in text, never shown by colour alone. */
export function VerificationBadge({ verified }: { verified: boolean }) {
  const t = useTranslations("MarketStatus");
  return verified ? (
    <p className="badge badge--verified">
      <span aria-hidden="true">✓ </span>
      {t("verified")}
    </p>
  ) : (
    <p className="badge badge--unverified">
      <span aria-hidden="true">! </span>
      {t("unverified")}
    </p>
  );
}
