const config = {
  plugins: {
    // Convert oklch() to rgb() at build time for browser compatibility
    '@csstools/postcss-oklab-function': { preserve: false },
    "@tailwindcss/postcss": {},
  },
};

export default config;
