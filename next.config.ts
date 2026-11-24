import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // APOD pictures come from the asset host of science.nasa.gov, under several
    // paths and with the size in the query string.
    remotePatterns: [{ protocol: "https", hostname: "assets.science.nasa.gov" }],
  },
};

export default nextConfig;
