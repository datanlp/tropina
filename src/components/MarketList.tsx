import { useLocale } from "next-intl";
import type { Market } from "@/data/schema";
import { Link } from "@/i18n/navigation";
import { marketPath } from "@/lib/paths";
import { SeasonDates } from "./SeasonDates";
import { VerificationBadge } from "./VerificationBadge";

export function MarketList({ markets, showCity = true }: { markets: Market[]; showCity?: boolean }) {
  const locale = useLocale();
  return (
    <ul className="market-list">
      {markets.map((m) => (
        <li key={m.id} className="market-list__item">
          <h2 className="market-list__name">
            <Link href={marketPath(m)}>
              {m.name[locale]}
            </Link>
          </h2>
          <p>
            {showCity && <>{m.city.name[locale]} · </>}
            <SeasonDates season={m.season} />
          </p>
          {!m.verified && <VerificationBadge verified={false} />}
        </li>
      ))}
    </ul>
  );
}
