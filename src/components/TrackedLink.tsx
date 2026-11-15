"use client";

import type { ComponentProps } from "react";
import { type AnalyticsEvent, type AnalyticsProps, track } from "@/lib/analytics";

/** An external link that reports its click before the browser leaves. */
export function TrackedLink({
  event,
  props,
  href,
  children,
  ...rest
}: ComponentProps<"a"> & { event: AnalyticsEvent; props?: AnalyticsProps; href: string }) {
  return (
    <a {...rest} href={href} onClick={() => track(event, props)}>
      {children}
    </a>
  );
}
