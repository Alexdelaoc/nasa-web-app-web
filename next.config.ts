import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // APOD serves its pictures straight from its own host.
    remotePatterns: [{ protocol: "https", hostname: "apod.nasa.gov" }],
  },
};

export default nextConfig;
