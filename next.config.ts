import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */

  /**
   * Standalone output for Docker deployment
   * Produces a minimal self-contained .next/standalone directory
   */
  output: 'standalone',

  /**
   * Disable Image Optimization for deployment on Render
   */
  images: {
    unoptimized: true,
  },

  // Optional: Change links `/me` -> `/me/` and emit `/me/index.html` -> `/me/index.html`
  trailingSlash: true,
};

export default nextConfig;
