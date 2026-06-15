import type { NextConfig } from "next";

const isDesktopExport = process.env.NEXT_DESKTOP_EXPORT === "1";

const nextConfig: NextConfig = {
  devIndicators: false,
  ...(isDesktopExport
    ? {
        output: "export",
        images: {
          unoptimized: true,
        },
      }
    : {}),
};

export default nextConfig;
