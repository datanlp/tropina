import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { MARKETS_PATH } from "@/lib/paths";

export default function NotFound() {
  const t = useTranslations("NotFound");
  return (
    <>
      <h1>{t("title")}</h1>
      <p>{t("text")}</p>
      <p>
        <Link href={MARKETS_PATH}>{t("home")}</Link>
      </p>
    </>
  );
}
