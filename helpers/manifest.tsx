import React from "react";
import { Helmet } from "react-helmet";

const manifestData = {
  id: "omni-pa-app",
  name: "OmniPA",
  short_name: "OmniPA",
  description:
    "Your AI-powered personal assistant for daily planning, goal tracking, shopping, mood logging, travel planning, and more.",
  icons: [
    {
      src: "/icons/icon-192x192.png",
      sizes: "192x192",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/icons/icon-512x512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/icons/icon-192x192-maskable.png",
      sizes: "192x192",
      type: "image/png",
      purpose: "maskable",
    },
    {
      src: "/icons/icon-512x512-maskable.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "maskable",
    },
  ],
  screenshots: [
    {
      src: "/screenshots/desktop-home.png",
      sizes: "1280x720",
      type: "image/png",
      form_factor: "wide",
      label: "Home screen on desktop",
    },
    {
      src: "/screenshots/mobile-home.png",
      sizes: "390x844",
      type: "image/png",
      form_factor: "narrow",
      label: "Home screen on mobile",
    },
    {
      src: "/screenshots/mobile-dashboard.png",
      sizes: "390x844",
      type: "image/png",
      form_factor: "narrow",
      label: "Dashboard view on mobile",
    },
  ],
  start_url: "/",
  display: "standalone",
  scope: "/",
  background_color: "#f8f9fa",
  theme_color: "#1e293b",
  orientation: "portrait-primary",
  dir: "ltr",
  lang: "en-US",
  categories: ["productivity", "lifestyle", "utilities", "health"],
  iarc_rating_id: "e84b072d-71b3-4d3e-86ae-31a8ce4e53b7",
  prefer_related_applications: false,
  related_applications: [
    {
      platform: "play",
      url: "https://play.google.com/store/apps/details?id=com.omnipa.app",
      id: "com.omnipa.app",
    },
    {
      platform: "itunes",
      url: "https://apps.apple.com/app/omnipa/id123456789",
      id: "123456789",
    },
  ],
  launch_handler: {
    client_mode: "navigate-existing",
  },
  scope_extensions: [
    {
      origin: "https://api.omnipa.com",
    },
  ],
};

/**
 * Injects the PWA manifest and related meta tags into the document head.
 * This component should be included in the main app layout to enable PWA features.
 */
export const PwaManifest = () => {
  // Using a data URI avoids needing a separate static file and endpoint for the manifest.
  const manifestHref = `data:application/manifest+json,${encodeURIComponent(
    JSON.stringify(manifestData)
  )}`;

  return (
    <Helmet>
      <link rel="manifest" href={manifestHref} />
      <meta name="theme-color" content={manifestData.theme_color} />

      {/* Apple-specific meta tags for a native-like experience on iOS */}
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta
        name="apple-mobile-web-app-status-bar-style"
        content="default"
      />
      <meta name="apple-mobile-web-app-title" content={manifestData.short_name} />
      <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />

      {/* Additional PWA meta tags */}
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="application-name" content={manifestData.short_name} />
      <meta name="msapplication-TileColor" content={manifestData.theme_color} />
      <meta name="msapplication-config" content="/browserconfig.xml" />
    </Helmet>
  );
};