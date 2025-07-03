import type { NextConfig } from 'next';

//TODO: enable after, when we have api calls
// const isDev = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',

  //TODO: enable after when we have api calls
  // Only set up the proxy in DEV
  // async rewrites() {
  //   return isDev
  //     ? [
  //         {
  //           source: '/api/v1/:path*',
  //           destination: `${process.env.API_URL}/api/v1/:path*`,
  //         },
  //       ]
  //     : [];
  // },

  // Optional: Change links `/me` -> `/me/` and emit `/me.html` -> `/me/index.html`
  // trailingSlash: true,

  // Optional: Prevent automatic `/me` -> `/me/`, instead preserve `href`
  // skipTrailingSlashRedirect: true,

  // Optional: Change the output directory `out` -> `dist`
  // distDir: 'dist',
};

export default nextConfig;
