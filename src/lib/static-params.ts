/**
 * With Cache Components, `generateStaticParams` must return at least one entry
 * or the build fails. Until real markets are added, the production data set is
 * empty, so we return a placeholder that the page answers with notFound().
 * Once real data exists the placeholder is never used.
 */
export const PLACEHOLDER_SLUG = "__none__";

export function staticParamsOrPlaceholder<K extends string>(
  params: Record<K, string>[],
  keys: readonly K[],
): Record<K, string>[] {
  if (params.length > 0) return params;
  return [Object.fromEntries(keys.map((k) => [k, PLACEHOLDER_SLUG])) as Record<K, string>];
}
