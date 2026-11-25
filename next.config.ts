import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // E2E tests build into their own folder (NEXT_DIST_DIR=.next-e2e) so they can
  // run while `npm run dev` is using .next.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
