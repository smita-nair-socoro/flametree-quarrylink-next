import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */

  /**
   * Static Site Export Configuration
   * Enables static HTML export for deployment to S3 + CloudFront
   * - Generates static HTML files during `next build`
   * - No server-side rendering or API routes
   * - All dynamic data must be fetched client-side
   * - Dynamic routes ([param]) require generateStaticParams or won't work
   */
  output: 'export',

  /**
   * Disable Image Optimization for static export
   * The default Next.js Image Optimization API requires a server
   * For static export, images are served as-is without optimization
   */
  images: {
    unoptimized: true,
  },

  // Optional: Change links `/me` -> `/me/` and emit `/me.html` -> `/me/index.html`
  trailingSlash: true,

  // Optional: Prevent automatic `/me` -> `/me/`, instead preserve `href`
  // skipTrailingSlashRedirect: true,

  // Optional: Change the output directory `out` -> `dist`
  // distDir: 'dist',
};

export default nextConfig;
