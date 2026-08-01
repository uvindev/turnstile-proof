"use client";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { trackEvent, type AnalyticsEvent } from "@/lib/analytics";

export function IntentLink({
  event,
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  event: AnalyticsEvent;
  children: ReactNode;
}) {
  return (
    <a {...props} onClick={() => trackEvent(event)}>
      {children}
    </a>
  );
}
