import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [375, 640, 768, 1024, 1280, 1536],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 31536000,
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    qualities: [60, 75, 80, 85],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.securecash.com.au",
      },
      {
        protocol: "https",
        hostname: "i.vimeocdn.com",
      },
      {
        protocol: "https",
        hostname: "flagcdn.com",
      },
    ],
  },

  compress: true,
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  poweredByHeader: false,

  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },

  experimental: {
    optimizePackageImports: [
      "swiper",
      "swiper/react",
      "react-icons",
      "@react-google-maps/api",
      "react-hook-form",
      "zod",
      "react-calendar",
      "react-date-picker",
    ],
    webpackBuildWorker: true,
    scrollRestoration: true,
  },

  async headers() {
    return [
      {
        source: "/franchise",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://assets.calendly.com https://calendly.com https://m.stripe.network https://m.stripe.com;",
          },
        ],
      },
      {
        source: "/images/banner/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:path((?!.*\\.).*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
      {
        source: "/:path((?!_next|images).*)*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },

  transpilePackages: [
    "swiper",
    "swiper/react",
    "react-calendar",
    "react-date-picker",
    "html-react-parser",
  ],
};

export default withSentryConfig(nextConfig, {
  org: "securecash-vo",
  project: "securecash",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  webpack: {
    automaticVercelMonitors: true,
    treeshake: {
      removeDebugLogging: true,
    },
  },
});
