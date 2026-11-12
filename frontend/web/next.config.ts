import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for Capacitor packaging
  output: "export",
  // Disable Next.js image optimization (not supported in static export)
  images: {
    unoptimized: true,
  },
  // Trailing slash for consistent routing in static export
  trailingSlash: true,
  // Turbopack root — silences workspace-root detection warning in dev
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
