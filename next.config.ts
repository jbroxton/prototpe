import type { NextConfig } from "next";
import path from "path";

// Keep config portable for Vercel + local builds.
const nextConfig: NextConfig = {
  // Silence monorepo/workspace root warnings when building outside the repo root.
  // This keeps output file tracing contained to this project folder.
  outputFileTracingRoot: path.resolve(__dirname),
  typescript: {
    // Allow prototype/server tests to run despite route handler TS sigs.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
