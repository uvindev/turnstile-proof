export type AnalyticsEvent =
  | "workbench_viewed"
  | "integration_audited"
  | "control_report_copied"
  | "team_interest"
  | "feedback_intent";

declare global {
  interface Window {
    plausible?: { (event: string): void; q?: unknown[][] };
  }
}

export function trackEvent(event: AnalyticsEvent): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("turnstileproof:analytics", { detail: { event } }),
  );
  if (!process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN) return;
  window.plausible ??= (...args: unknown[]) => {
    window.plausible!.q ??= [];
    window.plausible!.q!.push(args);
  };
  window.plausible(event);
}
