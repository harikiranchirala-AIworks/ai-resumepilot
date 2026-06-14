export type FunnelEvent =
  | "homepage_to_workspace"
  | "workspace_viewed"
  | "resume_parsed"
  | "resume_generated";

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export function trackFunnelEvent(event: FunnelEvent) {
  if (typeof window === "undefined") return;

  const payload = {
    event,
    funnel_name: "resume_tailoring",
    page_path: window.location.pathname,
  };

  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(payload);
  window.dispatchEvent(new CustomEvent("ats-resume-ready:analytics", { detail: payload }));
}
