/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface Window {
  dataLayer: unknown[];
  grantAnalyticsConsent: () => void;
  denyAnalyticsConsent: () => void;
}
